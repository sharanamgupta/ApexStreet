package com.apexstreet.dto;

import com.apexstreet.model.MaintenanceAssignment;
import com.apexstreet.model.MaintenanceStatus;
import java.time.LocalDateTime;

public record MaintenanceJobResponse(Long id, String lightId, TechnicianResponse technician,
                                     MaintenanceStatus status, LocalDateTime assignedAt,
                                     LocalDateTime resolvedAt, String notes, LocalDateTime createdAt,
                                     LocalDateTime updatedAt) {
    public static MaintenanceJobResponse from(MaintenanceAssignment job, long workload) {
        TechnicianResponse technician = job.getTechnician() == null ? null : TechnicianResponse.from(job.getTechnician(), workload);
        return new MaintenanceJobResponse(job.getId(), job.getStreetLight().getLightId(), technician, job.getStatus(),
                job.getAssignedAt(), job.getResolvedAt(), job.getNotes(), job.getCreatedAt(), job.getUpdatedAt());
    }
}
