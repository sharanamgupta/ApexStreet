package com.apexstreet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "areas", uniqueConstraints = @UniqueConstraint(name = "uk_area_name", columnNames = "name"))
public class Area {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 150) private String name;
    @Column(length = 500) private String description;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 30) private AreaType type;
    @Column(nullable = false) private boolean active = true;
    @Column(name = "automation_enabled", nullable = false) private boolean automationEnabled = true;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false) private LocalDateTime updatedAt;

    @PrePersist protected void onCreate() { LocalDateTime now = LocalDateTime.now(); createdAt = now; updatedAt = now; }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
    public Long getId() { return id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public AreaType getType() { return type; }
    public void setType(AreaType type) { this.type = type; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public boolean isAutomationEnabled() { return automationEnabled; }
    public void setAutomationEnabled(boolean automationEnabled) { this.automationEnabled = automationEnabled; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
