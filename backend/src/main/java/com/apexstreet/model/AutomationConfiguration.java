package com.apexstreet.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name="automation_configurations", uniqueConstraints=@UniqueConstraint(name="uk_automation_area", columnNames="area_id"))
public class AutomationConfiguration {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @OneToOne(fetch=FetchType.LAZY, optional=false) @JoinColumn(name="area_id", nullable=false) private Area area;
    @Column(nullable=false) private boolean enabled=true;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=30) private AutomationMode mode=AutomationMode.NORMAL;
    @Column(name="fault_hold_enabled", nullable=false) private boolean faultHoldEnabled=true;
    @Column(name="preserve_last_safe_command", nullable=false) private boolean preserveLastSafeCommand=true;
    @Enumerated(EnumType.STRING) @Column(nullable=false, length=30) private AutomationSeason season=AutomationSeason.SUMMER;
    @Column(name="created_at", nullable=false, updatable=false) private LocalDateTime createdAt;
    @Column(name="updated_at", nullable=false) private LocalDateTime updatedAt;
    @PrePersist void create(){var n=LocalDateTime.now();createdAt=n;updatedAt=n;} @PreUpdate void update(){updatedAt=LocalDateTime.now();}
    public Long getId(){return id;} public Area getArea(){return area;} public void setArea(Area v){area=v;} public boolean isEnabled(){return enabled;} public void setEnabled(boolean v){enabled=v;} public AutomationMode getMode(){return mode;} public void setMode(AutomationMode v){mode=v;} public boolean isFaultHoldEnabled(){return faultHoldEnabled;} public void setFaultHoldEnabled(boolean v){faultHoldEnabled=v;} public boolean isPreserveLastSafeCommand(){return preserveLastSafeCommand;} public void setPreserveLastSafeCommand(boolean v){preserveLastSafeCommand=v;} public AutomationSeason getSeason(){return season;} public void setSeason(AutomationSeason v){season=v;}
}
