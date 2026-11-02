package com.apexstreet.service;

import com.apexstreet.dto.*;
import com.apexstreet.model.*;
import com.apexstreet.repository.MaintenanceAssignmentRepository;
import com.apexstreet.repository.FieldTeamMessageRepository;
import com.apexstreet.repository.StreetLightRepository;
import com.apexstreet.repository.TechnicianRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
public class MonitorLightService {
    private static final Set<MaintenanceStatus> ACTIVE = Set.of(MaintenanceStatus.ASSIGNED, MaintenanceStatus.IN_PROGRESS);
    private final StreetLightRepository lights;
    private final TechnicianRepository technicians;
    private final MaintenanceAssignmentRepository jobs;
    private final FieldTeamMessageRepository messages;
    private final LightReportService reports;
    private final UserNotificationService notifications;
    private final ActivityLogService activityLogs;

    public MonitorLightService(StreetLightRepository lights, TechnicianRepository technicians, MaintenanceAssignmentRepository jobs, FieldTeamMessageRepository messages, LightReportService reports, UserNotificationService notifications, ActivityLogService activityLogs) {
        this.lights = lights; this.technicians = technicians; this.jobs = jobs; this.messages = messages; this.reports = reports; this.notifications = notifications; this.activityLogs = activityLogs;
    }

    @Transactional(readOnly = true)
    public List<MonitorLightResponse> findAll(String search, String area, String status) {
        String normalizedSearch = normalize(search), normalizedArea = normalize(area);
        StreetLightStatus storedStatus = parseStoredStatus(status);
        return lights.search(normalizedSearch, normalizedArea, storedStatus, null).stream()
                .filter(light -> matchesHealth(light, status))
                .map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public MonitorLightResponse findById(String lightId) { return toResponse(getLight(lightId)); }

    @Transactional(readOnly = true)
    public MonitorSummaryResponse summary() {
        List<StreetLight> all = lights.findAll();
        long connected = all.stream().filter(light -> !isFault(light) && light.getStatus() != StreetLightStatus.OFF).count();
        long faults = all.stream().filter(this::isFault).count();
        long assigned = jobs.countByStatusIn(ACTIVE);
        long unassigned = all.stream().filter(this::isFault)
                .filter(light -> jobs.findFirstByStreetLightLightIdAndStatusInOrderByAssignedAtDesc(light.getLightId(), ACTIVE).isEmpty()).count();
        return new MonitorSummaryResponse(connected, faults, assigned, unassigned);
    }

    @Transactional(readOnly = true)
    public List<TechnicianResponse> technicians(String area) {
        return technicians.findAll().stream()
                .filter(Technician::isActive)
                .filter(t -> area == null || (t.getAreaReference() != null && t.getAreaReference().getName().equalsIgnoreCase(area.trim())))
                .map(t -> TechnicianResponse.from(t, jobs.countByTechnicianIdAndStatusIn(t.getId(), ACTIVE))).toList();
    }

    @Transactional
    public MonitorLightResponse assign(String lightId, AssignTechnicianRequest request) {
        StreetLight light = getLight(lightId);
        if (!isFault(light)) throw new IllegalStateException("Only faulted street lights can be assigned.");
        Technician technician = technicians.findById(request.technicianId()).orElseThrow(() -> new IllegalArgumentException("Technician not found."));
        if (!technician.isActive()) throw new IllegalStateException("This field technician is not active.");
        if (technician.getAreaReference() == null || !technician.getAreaReference().getName().equalsIgnoreCase(light.getArea())) {
            throw new IllegalArgumentException("The technician must be assigned to the street light's area.");
        }
        MaintenanceAssignment job = jobs.findFirstByStreetLightLightIdAndStatusInOrderByAssignedAtDesc(lightId, ACTIVE).orElseGet(() -> {
            MaintenanceAssignment created = new MaintenanceAssignment(); created.setStreetLight(light); return created;
        });
        job.setTechnician(technician); job.setStatus(MaintenanceStatus.ASSIGNED); job.setAssignedAt(LocalDateTime.now()); job.setResolvedAt(null); job.setNotes(request.notes());
        jobs.save(job);
        reports.activeFor(lightId).ifPresent(report -> report.setStatus(LightReportStatus.ASSIGNED));
        activityLogs.record("Technician assigned", technician.getName() + " assigned to repair " + lightId, "Maintenance", light.getArea(), lightId, "Success", "Maintenance");
        return toResponse(light);
    }

    @Transactional
    public MonitorLightResponse updateMaintenance(String lightId, MaintenanceUpdateRequest request) {
        if (request.status() == MaintenanceStatus.UNASSIGNED || request.status() == MaintenanceStatus.RESOLVED) throw new IllegalArgumentException("Maintenance status must be ASSIGNED or IN_PROGRESS.");
        MaintenanceAssignment job = activeJob(lightId);
        if (job.getTechnician() == null) throw new IllegalStateException("Assign a technician before updating maintenance.");
        job.setStatus(request.status()); if (request.notes() != null) job.setNotes(request.notes()); jobs.save(job);
        reports.activeFor(lightId).ifPresent(report -> report.setStatus(request.status() == MaintenanceStatus.IN_PROGRESS ? LightReportStatus.IN_PROGRESS : LightReportStatus.ASSIGNED));
        return toResponse(getLight(lightId));
    }

    @Transactional
    public MonitorLightResponse resolve(String lightId) {
        StreetLight light = getLight(lightId); MaintenanceAssignment job = activeJob(lightId);
        job.setStatus(MaintenanceStatus.RESOLVED); job.setResolvedAt(LocalDateTime.now()); jobs.save(job);
        light.setFaultStatus(false); light.setStatus(StreetLightStatus.ON); lights.save(light);
        reports.activeFor(lightId).ifPresent(report -> { report.setStatus(LightReportStatus.RESOLVED); report.setResolvedAt(LocalDateTime.now()); notifications.create(report.getReporter(), "Street light repaired", lightId + " in " + light.getArea() + " has been repaired and is back online.", "success", "/user-dashboard/reports"); });
        activityLogs.record("Street light fixed", lightId + " in " + light.getArea() + " was repaired and returned to service.", "Maintenance", light.getArea(), lightId, "Success", "Maintenance");
        return toResponse(light);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceJobResponse> history(String lightId) {
        getLight(lightId);
        return jobs.findByStreetLightLightIdOrderByAssignedAtDesc(lightId).stream().map(job -> MaintenanceJobResponse.from(job, job.getTechnician() == null ? 0 : jobs.countByTechnicianIdAndStatusIn(job.getTechnician().getId(), ACTIVE))).toList();
    }

    @Transactional(readOnly = true)
    public List<FieldTeamMessageResponse> messages(String lightId) {
        getLight(lightId);
        return messages.findByStreetLightLightIdOrderByCreatedAtAsc(lightId).stream().map(FieldTeamMessageResponse::from).toList();
    }

    @Transactional
    public FieldTeamMessageResponse sendMessage(String lightId, FieldTeamMessageRequest request) {
        StreetLight light = getLight(lightId);
        String sender = request.sender().trim().toUpperCase();
        if (!sender.equals("OPERATOR") && !sender.equals("TECHNICIAN")) throw new IllegalArgumentException("Sender must be OPERATOR or TECHNICIAN.");
        MaintenanceAssignment activeJob = activeJob(lightId);
        Technician technician = activeJob.getTechnician();
        if (technician == null) throw new IllegalStateException("Assign a technician before sending a field-team message.");
        if (request.technicianId() != null && !request.technicianId().equals(technician.getId())) {
            throw new IllegalArgumentException("Messages must use the technician assigned to this maintenance job.");
        }
        FieldTeamMessage message = new FieldTeamMessage();
        message.setStreetLight(light);
        message.setTechnician(technician);
        message.setSender(sender);
        message.setMessage(request.message().trim());
        return FieldTeamMessageResponse.from(messages.save(message));
    }

    private MonitorLightResponse toResponse(StreetLight light) {
        MaintenanceAssignment job = jobs.findFirstByStreetLightLightIdAndStatusInOrderByAssignedAtDesc(light.getLightId(), ACTIVE).orElse(null);
        MaintenanceAssignment latest = job != null ? job : jobs.findByStreetLightLightIdOrderByAssignedAtDesc(light.getLightId()).stream().findFirst().orElse(null);
        MaintenanceStatus maintenance = job != null ? job.getStatus() : (isFault(light) ? MaintenanceStatus.UNASSIGNED : latestResolved(light.getLightId()));
        // Only expose the technician for the active job. A resolved job may still
        // be the latest historical record, but it must not block reassignment or
        // make the UI offer "Confirm fix" for a new fault.
        TechnicianResponse assigned = job == null || job.getTechnician() == null ? null : TechnicianResponse.from(job.getTechnician(), jobs.countByTechnicianIdAndStatusIn(job.getTechnician().getId(), ACTIVE));
        String health = isFault(light) ? "FAULT" : light.getStatus() == StreetLightStatus.OFF ? "OFFLINE" : "HEALTHY";
        LightReport report = reports.activeFor(light.getLightId()).orElse(null);
        String issue = report != null ? report.getIssue() : (isFault(light) ? "Street light fault requires attention" : null);
        return new MonitorLightResponse(light.getId(), light.getLightId(), light.getArea(), light.getStatus(), light.getMode(), light.getBrightness(), health, isFault(light), maintenance, assigned, issue, light.getUpdatedAt(), report == null ? null : report.getId(), report == null ? null : report.getStatus().name(), report == null ? null : report.getReporter().getName(), report == null ? null : report.getCreatedAt());
    }

    private MaintenanceStatus latestResolved(String lightId) { return jobs.findByStreetLightLightIdOrderByAssignedAtDesc(lightId).stream().findFirst().map(MaintenanceAssignment::getStatus).orElse(MaintenanceStatus.UNASSIGNED); }
    private MaintenanceAssignment activeJob(String lightId) { getLight(lightId); return jobs.findFirstByStreetLightLightIdAndStatusInOrderByAssignedAtDesc(lightId, ACTIVE).orElseThrow(() -> new IllegalStateException("No active maintenance job exists for this street light.")); }
    private StreetLight getLight(String lightId) { return lights.findByLightId(lightId).orElseThrow(() -> new MonitorLightNotFoundException(lightId)); }
    private boolean isFault(StreetLight light) { return light.isFaultStatus() || light.getStatus() == StreetLightStatus.FAULT; }
    private StreetLightStatus parseStoredStatus(String status) {
        if (status == null || status.isBlank() || status.equalsIgnoreCase("HEALTHY") || status.equalsIgnoreCase("OFFLINE") || status.equalsIgnoreCase("FAULT")) return null;
        try { return StreetLightStatus.valueOf(status.trim().toUpperCase()); }
        catch (IllegalArgumentException ex) { throw new IllegalArgumentException("Invalid status filter."); }
    }
    private boolean matchesHealth(StreetLight light, String status) {
        if (status == null || status.isBlank()) return true;
        if (status.equalsIgnoreCase("FAULT")) return isFault(light);
        if (status.equalsIgnoreCase("HEALTHY")) return !isFault(light) && light.getStatus() != StreetLightStatus.OFF;
        if (status.equalsIgnoreCase("OFFLINE")) return !isFault(light) && light.getStatus() == StreetLightStatus.OFF;
        return true;
    }
    private String normalize(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
