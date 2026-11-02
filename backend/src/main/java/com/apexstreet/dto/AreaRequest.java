package com.apexstreet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AreaRequest(@NotBlank @Size(max = 150) String name, @NotBlank String type,
                          @Size(max = 500) String description, Boolean active, Boolean automationEnabled) {
}
