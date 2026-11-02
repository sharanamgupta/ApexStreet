package com.apexstreet.dto;

import com.apexstreet.model.*;
import java.time.LocalDateTime;

public record MonitorLightResponse(Long id, String lightId, String area, StreetLightStatus status,
                                   StreetLightMode mode, Integer brightness, String health,
                                   boolean faultStatus, MaintenanceStatus maintenanceStatus,
                                   TechnicianResponse assignedTechnician, String issue,
                                   LocalDateTime lastUpdated, Long reportId, String reportStatus,
                                   String reportedBy, LocalDateTime reportCreatedAt) {
}
