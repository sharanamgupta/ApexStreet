package com.apexstreet.dto;

import com.apexstreet.model.MaintenanceStatus;
import jakarta.validation.constraints.NotNull;

public record MaintenanceUpdateRequest(@NotNull MaintenanceStatus status, String notes) {
}
