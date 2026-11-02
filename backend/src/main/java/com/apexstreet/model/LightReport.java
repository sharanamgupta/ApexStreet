package com.apexstreet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "light_reports")
public class LightReport {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "street_light_id", nullable = false)
    private StreetLight streetLight;
    @ManyToOne(fetch = FetchType.LAZY, optional = false) @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;
    @Column(nullable = false, length = 1000) private String issue;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 20) private LightReportStatus status = LightReportStatus.OPEN;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(name = "resolved_at") private LocalDateTime resolvedAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
    public Long getId() { return id; }
    public StreetLight getStreetLight() { return streetLight; }
    public void setStreetLight(StreetLight streetLight) { this.streetLight = streetLight; }
    public User getReporter() { return reporter; }
    public void setReporter(User reporter) { this.reporter = reporter; }
    public String getIssue() { return issue; }
    public void setIssue(String issue) { this.issue = issue; }
    public LightReportStatus getStatus() { return status; }
    public void setStatus(LightReportStatus status) { this.status = status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}
