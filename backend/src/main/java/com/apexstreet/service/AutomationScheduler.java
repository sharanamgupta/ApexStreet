package com.apexstreet.service;

import com.apexstreet.model.*;
import com.apexstreet.repository.AreaRepository;
import com.apexstreet.repository.AutomationConfigurationRepository;
import com.apexstreet.repository.AutomationLightOverrideRepository;
import com.apexstreet.repository.AutomationSchedulePhaseRepository;
import com.apexstreet.repository.StreetLightRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
public class AutomationScheduler {
    private final AreaRepository areas;
    private final AutomationConfigurationRepository configurations;
    private final AutomationSchedulePhaseRepository phases;
    private final AutomationLightOverrideRepository overrides;
    private final StreetLightRepository lights;
    private final ActivityLogService activityLogs;

    public AutomationScheduler(AreaRepository areas,
                               AutomationConfigurationRepository configurations,
                               AutomationSchedulePhaseRepository phases,
                               AutomationLightOverrideRepository overrides,
                               StreetLightRepository lights,
                               ActivityLogService activityLogs) {
        this.areas = areas;
        this.configurations = configurations;
        this.phases = phases;
        this.overrides = overrides;
        this.lights = lights;
        this.activityLogs = activityLogs;
    }

    @Scheduled(fixedDelay = 60000, initialDelay = 1000)
    @Transactional
    public void applyCurrentSchedules() {
        applySchedules(false, null, null);
    }

    @Transactional
    public void applyCurrentSchedules(boolean forceLog) {
        applySchedules(forceLog, null, null);
    }

    @Transactional
    public void runNow(Long areaId, AutomationWeekType weekType) {
        applySchedules(true, areaId, weekType);
    }

    private void applySchedules(boolean forceLog, Long onlyAreaId, AutomationWeekType requestedWeekType) {
        LocalDateTime now = LocalDateTime.now();
        AutomationWeekType weekType = requestedWeekType != null ? requestedWeekType : (isWeekend(now.getDayOfWeek()) ? AutomationWeekType.WEEKEND : AutomationWeekType.WEEKDAY);

        areas.findAll().stream().filter(area -> onlyAreaId == null || area.getId().equals(onlyAreaId)).forEach(area -> configurations.findByAreaId(area.getId()).ifPresent(configuration -> {
            if (!configuration.isEnabled()) return;

            List<AutomationSchedulePhase> scheduledPhases = phases.findByConfigurationIdOrderByWeekTypeAscPhaseOrderAsc(configuration.getId())
                    .stream().filter(phase -> phase.getWeekType() == weekType).toList();
            if (scheduledPhases.isEmpty()) return;

            AutomationSchedulePhase activePhase = scheduledPhases.stream()
                    .filter(phase -> isActive(phase, now.toLocalTime()))
                    .sorted(Comparator.comparing(AutomationSchedulePhase::getPriority).reversed()
                    .thenComparing(AutomationSchedulePhase::getPhaseOrder))
                    .findFirst().orElse(null);
            AutomationSchedulePhase boundaryPhase = activePhase != null ? activePhase : scheduledPhases.stream()
                    .filter(phase -> sameMinute(phase.getEndTime(), now.toLocalTime()))
                    .findFirst().orElse(null);

            Map<Long, AutomationLightOverride> activeOverrides = overrides.findByAreaIdAndStatus(area.getId(), AutomationOverrideStatus.ACTIVE)
                    .stream().collect(java.util.stream.Collectors.toMap(override -> override.getStreetLight().getId(), override -> override, (left, right) -> right));

            lights.findForArea(area, area.getName()).forEach(light -> {
                if (light.isFaultStatus() || light.getStatus() == StreetLightStatus.FAULT) return;
                if (light.getMode() == StreetLightMode.MANUAL || activeOverrides.containsKey(light.getId())) return;

                AutomationAction action = activePhase == null ? AutomationAction.OFF : activePhase.getAction();
                int brightness = activePhase == null ? 0 : normalizeBrightness(activePhase.getBrightness(), action);
                StreetLightStatus status = statusFor(action);
                boolean phaseBoundary = boundaryPhase != null && (sameMinute(boundaryPhase.getStartTime(), now.toLocalTime()) || sameMinute(boundaryPhase.getEndTime(), now.toLocalTime()));
                if (light.getStatus() == status && light.getBrightness() == brightness && !phaseBoundary && !forceLog) return;

                if (light.getStatus() != status || light.getBrightness() != brightness) {
                    light.setStatus(status);
                    light.setBrightness(brightness);
            if (light.getMode() != StreetLightMode.MANUAL) light.setMode(StreetLightMode.AUTO);
                    lights.save(light);
                }

                Map<String, String> details = new LinkedHashMap<>();
                details.put("lightId", light.getLightId());
                details.put("area", area.getName());
                details.put("command", action.name());
                details.put("brightness", String.valueOf(brightness));
                if (boundaryPhase != null) {
                    details.put("phaseId", String.valueOf(boundaryPhase.getId()));
                    details.put("scheduledStart", boundaryPhase.getStartTime().toString());
                    details.put("scheduledEnd", boundaryPhase.getEndTime().toString());
                }
                activityLogs.record("Scheduled light " + action.name(),
                        light.getLightId() + " in " + area.getName() + " changed to " + action.name() + " at " + now.toLocalTime().withSecond(0).withNano(0),
                        "Automation", area.getName(), light.getLightId(), "Success", "Automation", details);
            });
        }));
    }

    /** Runs the same production schedule evaluation immediately, useful after saving a phase. */
    @Transactional
    public void runNow() {
        applySchedules(true, null, null);
    }

    private boolean isActive(AutomationSchedulePhase phase, LocalTime now) {
        LocalTime start = phase.getStartTime();
        LocalTime end = phase.getEndTime();
        if (start.equals(end)) return true;
        return start.isBefore(end)
                ? !now.isBefore(start) && now.isBefore(end)
                : !now.isBefore(start) || now.isBefore(end);
    }

    private boolean isWeekend(DayOfWeek day) {
        return day == DayOfWeek.SATURDAY || day == DayOfWeek.SUNDAY;
    }

    private boolean sameMinute(LocalTime left, LocalTime right) {
        return left.getHour() == right.getHour() && left.getMinute() == right.getMinute();
    }

    private int normalizeBrightness(Integer value, AutomationAction action) {
        if (action == AutomationAction.OFF) return 0;
        if (action == AutomationAction.ON) return 100;
        return Math.max(1, Math.min(100, value == null ? 50 : value));
    }

    private StreetLightStatus statusFor(AutomationAction action) {
        return switch (action) {
            case ON -> StreetLightStatus.ON;
            case OFF -> StreetLightStatus.OFF;
            case DIM -> StreetLightStatus.DIM;
        };
    }
}
