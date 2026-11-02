package com.apexstreet.service;

import com.apexstreet.dto.*;
import com.apexstreet.model.*;
import com.apexstreet.repository.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
public class LightReportService {
    private final LightReportRepository reports; private final StreetLightRepository lights; private final UserRepository users; private final ActivityLogService activityLogs; private final UserNotificationService notifications;
    public LightReportService(LightReportRepository reports, StreetLightRepository lights, UserRepository users, ActivityLogService activityLogs, UserNotificationService notifications) { this.reports = reports; this.lights = lights; this.users = users; this.activityLogs = activityLogs; this.notifications = notifications; }
    @Transactional public LightReportResponse create(LightReportRequest request) { String email = currentEmail(); User user = users.findByEmail(email).orElseThrow(() -> new IllegalStateException("User account not found.")); StreetLight light = lights.findByLightId(request.lightId().trim()).orElseThrow(() -> new StreetLightNotFoundException(request.lightId())); LightReport report = new LightReport(); report.setReporter(user); report.setStreetLight(light); report.setIssue(request.issue().trim()); LightReport saved = reports.save(report); light.setFaultStatus(true); light.setStatus(StreetLightStatus.FAULT); lights.save(light); String message = user.getName() + " reported " + light.getLightId() + " in " + light.getArea() + ": " + report.getIssue(); notifications.notifyOperators(users.findByRoleIn(List.of(Role.OPERATOR, Role.ADMIN)), "New street light report", message, "warning", "/monitor-lights"); activityLogs.record("Street light issue reported", message, "Maintenance", light.getArea(), light.getLightId(), "Warning", "User Report"); return LightReportResponse.from(saved); }
    @Transactional(readOnly = true) public List<LightReportResponse> mine() { return reports.findByReporterEmailOrderByCreatedAtDesc(currentEmail()).stream().map(LightReportResponse::from).toList(); }
    @Transactional(readOnly = true) public List<LightReportResponse> open() { return reports.findByStatusInOrderByCreatedAtDesc(List.of(LightReportStatus.OPEN, LightReportStatus.ASSIGNED, LightReportStatus.IN_PROGRESS)).stream().map(LightReportResponse::from).toList(); }
    public Optional<LightReport> activeFor(String lightId) { return reports.findFirstByStreetLightLightIdAndStatusInOrderByCreatedAtDesc(lightId, List.of(LightReportStatus.OPEN, LightReportStatus.ASSIGNED, LightReportStatus.IN_PROGRESS)); }
    private String currentEmail() { return SecurityContextHolder.getContext().getAuthentication().getName(); }
}
