package com.apexstreet.dto;

import jakarta.validation.constraints.NotBlank;

public record LightReportRequest(@NotBlank String lightId, @NotBlank String issue) {}
