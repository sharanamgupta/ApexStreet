package com.apexstreet.dto;

import com.apexstreet.model.Area;
import java.time.LocalDateTime;
import java.util.List;

public record AreaResponse(Long id, String name, String description, String type, boolean active,
                           boolean automationEnabled, long totalLights, long onLights, long dimLights,
                           long offLights, long faultLights, double respondingPercentage,
                           double networkActivity, double energyUsage, double energyChange,
                           double averageBrightness, LocalDateTime createdAt, LocalDateTime updatedAt, List<AreaLightResponse> lights) {
    public static AreaResponse empty(Area area) {
        return new AreaResponse(area.getId(), area.getName(), area.getDescription(), area.getType().getLabel(), area.isActive(), area.isAutomationEnabled(), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, area.getCreatedAt(), area.getUpdatedAt(), List.of());
    }
}
