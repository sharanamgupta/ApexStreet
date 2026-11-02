package com.apexstreet.dto;

import com.apexstreet.model.UserNotification;
import java.time.LocalDateTime;

public record UserNotificationResponse(Long id, String title, String message, String type, boolean read, String link, LocalDateTime createdAt) {
    public static UserNotificationResponse from(UserNotification item) { return new UserNotificationResponse(item.getId(), item.getTitle(), item.getMessage(), item.getType(), item.isRead(), item.getLink(), item.getCreatedAt()); }
}
