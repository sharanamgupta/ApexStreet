package com.apexstreet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs", indexes = {
        @Index(name = "ix_activity_timestamp", columnList = "event_timestamp"),
        @Index(name = "ix_activity_module", columnList = "module")
})
public class ActivityLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false, length = 100) private String action;
    @Column(nullable = false, length = 1000) private String description;
    @Column(nullable = false, length = 60) private String module;
    @Column(length = 150) private String area;
    @Column(name = "user_or_system", nullable = false, length = 150) private String userOrSystem;
    @Column(length = 100) private String target;
    @Column(nullable = false, length = 20) private String status;
    @Column(nullable = false, length = 20) private String type;
    @Column(name = "event_timestamp", nullable = false) private LocalDateTime timestamp;
    @Column(columnDefinition = "TEXT") private String details;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id") private User user;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;

    @PrePersist void onCreate() { if (timestamp == null) timestamp = LocalDateTime.now(); if (createdAt == null) createdAt = LocalDateTime.now(); }
    public Long getId(){return id;} public String getAction(){return action;} public void setAction(String v){action=v;} public String getDescription(){return description;} public void setDescription(String v){description=v;} public String getModule(){return module;} public void setModule(String v){module=v;} public String getArea(){return area;} public void setArea(String v){area=v;} public String getUserOrSystem(){return userOrSystem;} public void setUserOrSystem(String v){userOrSystem=v;} public String getTarget(){return target;} public void setTarget(String v){target=v;} public String getStatus(){return status;} public void setStatus(String v){status=v;} public String getType(){return type;} public void setType(String v){type=v;} public LocalDateTime getTimestamp(){return timestamp;} public void setTimestamp(LocalDateTime v){timestamp=v;} public String getDetails(){return details;} public void setDetails(String v){details=v;} public User getUser(){return user;} public void setUser(User v){user=v;} public LocalDateTime getCreatedAt(){return createdAt;}
}
