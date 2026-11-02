package com.apexstreet.dto;

import jakarta.validation.constraints.NotNull;

public record AssignTechnicianRequest(@NotNull Long technicianId, String notes) {
}
