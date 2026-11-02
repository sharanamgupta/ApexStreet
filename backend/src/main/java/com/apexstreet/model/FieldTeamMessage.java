package com.apexstreet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "field_team_messages")
public class FieldTeamMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "street_light_id", nullable = false)
    private StreetLight streetLight;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "technician_id", nullable = false)
    private Technician technician;

    @Column(nullable = false, length = 20)
    private String sender;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { createdAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public StreetLight getStreetLight() { return streetLight; }
    public void setStreetLight(StreetLight streetLight) { this.streetLight = streetLight; }
    public Technician getTechnician() { return technician; }
    public void setTechnician(Technician technician) { this.technician = technician; }
    public String getSender() { return sender; }
    public void setSender(String sender) { this.sender = sender; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
