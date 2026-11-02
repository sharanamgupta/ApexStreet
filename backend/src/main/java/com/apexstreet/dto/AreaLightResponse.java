package com.apexstreet.dto;

import com.apexstreet.model.StreetLightStatus;
import java.math.BigDecimal;

public record AreaLightResponse(String lightId, String area, StreetLightStatus status, Integer brightness,
                                BigDecimal powerRating, boolean faultStatus) {
}
