package com.apexstreet.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "street_lights", uniqueConstraints = @UniqueConstraint(name = "uk_street_light_light_id", columnNames = "light_id"))
public class StreetLight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "light_id", nullable = false, unique = true, length = 50)
    private String lightId;

    @Column(nullable = false, length = 150)
    private String area;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "area_id")
    private Area areaReference;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StreetLightStatus status;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StreetLightMode mode;

    @Column(nullable = false)
    private Integer brightness;

    @Column(name = "power_rating", nullable = false, precision = 10, scale = 2)
    private BigDecimal powerRating;

    @Column(name = "fault_status", nullable = false)
    private boolean faultStatus;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public String getLightId() { return lightId; }
    public void setLightId(String lightId) { this.lightId = lightId; }
    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public Area getAreaReference() { return areaReference; }
    public void setAreaReference(Area areaReference) { this.areaReference = areaReference; }
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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
