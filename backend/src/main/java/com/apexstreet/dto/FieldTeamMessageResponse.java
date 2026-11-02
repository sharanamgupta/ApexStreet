package com.apexstreet.dto;

import com.apexstreet.model.FieldTeamMessage;
import java.time.LocalDateTime;

public record FieldTeamMessageResponse(Long id, String lightId, Long technicianId, String technicianName,
                                       String sender, String message, LocalDateTime createdAt) {
    public static FieldTeamMessageResponse from(FieldTeamMessage item) {
        return new FieldTeamMessageResponse(item.getId(), item.getStreetLight().getLightId(), item.getTechnician().getId(),
                item.getTechnician().getName(), item.getSender(), item.getMessage(), item.getCreatedAt());
    }
}
