package com.apexstreet.dto;

import jakarta.validation.constraints.NotBlank;

public record FieldTeamMessageRequest(Long technicianId, @NotBlank String message, @NotBlank String sender) {}
