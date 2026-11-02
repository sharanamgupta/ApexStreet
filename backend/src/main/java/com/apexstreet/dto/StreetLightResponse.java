package com.apexstreet.dto;

import com.apexstreet.model.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record StreetLightResponse(Long id, String lightId, String area, StreetLightStatus status,
                                  StreetLightMode mode, Integer brightness, BigDecimal powerRating,
                                  boolean faultStatus, LocalDateTime createdAt, LocalDateTime updatedAt) {
    public static StreetLightResponse from(StreetLight light) {
        return new StreetLightResponse(light.getId(), light.getLightId(), light.getArea(), light.getStatus(),
                light.getMode(), light.getBrightness(), light.getPowerRating(), light.isFaultStatus(),
                light.getCreatedAt(), light.getUpdatedAt());
    }
}
