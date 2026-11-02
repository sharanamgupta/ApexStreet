package com.apexstreet.service;

import com.apexstreet.dto.StreetLightRequest;
import com.apexstreet.dto.StreetLightResponse;
import com.apexstreet.dto.StreetLightStatisticsResponse;
import com.apexstreet.model.StreetLight;
import com.apexstreet.model.StreetLightMode;
import com.apexstreet.model.StreetLightStatus;
import com.apexstreet.repository.StreetLightRepository;
import com.apexstreet.repository.MaintenanceAssignmentRepository;
import com.apexstreet.repository.FieldTeamMessageRepository;
import com.apexstreet.repository.LightReportRepository;
import com.apexstreet.repository.AutomationLightOverrideRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StreetLightService {
    private final StreetLightRepository repository;
    private final MaintenanceAssignmentRepository maintenanceAssignments;
    private final FieldTeamMessageRepository fieldTeamMessages;
    private final LightReportRepository lightReports;
    private final AutomationLightOverrideRepository automationOverrides;
    private final ActivityLogService activityLogs;

    public StreetLightService(StreetLightRepository repository, MaintenanceAssignmentRepository maintenanceAssignments, FieldTeamMessageRepository fieldTeamMessages, LightReportRepository lightReports, AutomationLightOverrideRepository automationOverrides, ActivityLogService activityLogs) {
        this.repository = repository;
        this.maintenanceAssignments = maintenanceAssignments;
        this.fieldTeamMessages = fieldTeamMessages;
        this.lightReports = lightReports;
        this.automationOverrides = automationOverrides;
        this.activityLogs = activityLogs;
    }

    @Transactional(readOnly = true)
    public List<StreetLightResponse> findAll(String search, String area, StreetLightStatus status, StreetLightMode mode) {
        return repository.search(normalize(search), normalize(area), status, mode)
                .stream().map(StreetLightResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public StreetLightResponse findById(String lightId) {
        return StreetLightResponse.from(getEntity(lightId));
    }

    @Transactional
    public StreetLightResponse create(StreetLightRequest request) {
        String lightId = request.getLightId().trim();
        if (repository.existsByLightId(lightId)) {
            throw new DuplicateStreetLightException("A street light with light ID '" + lightId + "' already exists.");
        }
        StreetLight saved = repository.save(toEntity(new StreetLight(), request, lightId));
        activityLogs.record("Street light created", "Created street light " + saved.getLightId(), "Street Lights", saved.getArea(), saved.getLightId(), "Success", "User Action");
        return StreetLightResponse.from(saved);
    }

    @Transactional
    public StreetLightResponse update(String id, StreetLightRequest request) {
        StreetLight light = getEntity(id);
        String lightId = request.getLightId().trim();
        repository.findByLightId(lightId).filter(existing -> !existing.getId().equals(light.getId())).ifPresent(existing -> {
            throw new DuplicateStreetLightException("A street light with light ID '" + lightId + "' already exists.");
        });
        StreetLight saved = repository.save(toEntity(light, request, lightId));
        activityLogs.record("Street light updated", "Updated street light " + saved.getLightId(), "Street Lights", saved.getArea(), saved.getLightId(), "Success", "User Action");
        return StreetLightResponse.from(saved);
    }

    @Transactional
    public void delete(String lightId) {
        StreetLight light = getEntity(lightId);
        fieldTeamMessages.deleteByStreetLightLightId(lightId);
        maintenanceAssignments.deleteByStreetLightLightId(lightId);
        lightReports.deleteByStreetLightLightId(lightId);
        automationOverrides.deleteByStreetLightId(light.getId());
        repository.delete(light);
        activityLogs.record("Street light deleted", "Deleted street light " + lightId, "Street Lights", light.getArea(), lightId, "Success", "User Action");
    }

    @Transactional(readOnly = true)
    public StreetLightStatisticsResponse statistics() {
        long total = repository.count();
        long online = repository.countByStatus(StreetLightStatus.ON);
        long offline = repository.countByStatus(StreetLightStatus.OFF);
        long faulty = repository.countFaulty();
        return new StreetLightStatisticsResponse(total, online, offline, faulty);
    }

    private StreetLight getEntity(String lightId) {
        return repository.findByLightId(lightId).orElseThrow(() -> new StreetLightNotFoundException(lightId));
    }

    private StreetLight toEntity(StreetLight light, StreetLightRequest request, String lightId) {
        light.setLightId(lightId);
        light.setArea(request.getArea().trim());
        light.setStatus(request.getStatus());
        light.setMode(request.getMode());
        light.setBrightness(request.getBrightness());
        light.setPowerRating(request.getPowerRating());
        if (light.getId() == null) {
            light.setFaultStatus(false);
            if (light.getStatus() == StreetLightStatus.FAULT) light.setStatus(StreetLightStatus.OFF);
        }
        return light;
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
