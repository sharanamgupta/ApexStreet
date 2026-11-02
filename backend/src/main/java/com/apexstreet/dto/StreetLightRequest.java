package com.apexstreet.dto;

import com.apexstreet.model.StreetLightMode;
import com.apexstreet.model.StreetLightStatus;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class StreetLightRequest {
    @NotBlank @Size(max = 50)
    private String lightId;
    @NotBlank @Size(max = 150)
    private String area;
    @NotNull private StreetLightStatus status;
    @NotNull private StreetLightMode mode;
    @NotNull @Min(0) @Max(100)
    private Integer brightness;
    @NotNull @DecimalMin(value = "0.01") @Digits(integer = 8, fraction = 2)
    private BigDecimal powerRating;
    private boolean faultStatus;

    public String getLightId() { return lightId; }
    public void setLightId(String lightId) { this.lightId = lightId; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public StreetLightStatus getStatus() { return status; }
    public void setStatus(StreetLightStatus status) { this.status = status; }
    public StreetLightMode getMode() { return mode; }
    public void setMode(StreetLightMode mode) { this.mode = mode; }
    public Integer getBrightness() { return brightness; }
    public void setBrightness(Integer brightness) { this.brightness = brightness; }
    public BigDecimal getPowerRating() { return powerRating; }
    public void setPowerRating(BigDecimal powerRating) { this.powerRating = powerRating; }
    public boolean isFaultStatus() { return faultStatus; }
    public void setFaultStatus(boolean faultStatus) { this.faultStatus = faultStatus; }
}
