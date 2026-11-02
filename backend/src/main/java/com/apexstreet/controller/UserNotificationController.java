package com.apexstreet.controller;

import com.apexstreet.dto.UserNotificationResponse;
import com.apexstreet.service.UserNotificationService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController @RequestMapping("/api/notifications")
public class UserNotificationController {
    private final UserNotificationService service;
    public UserNotificationController(UserNotificationService service) { this.service = service; }
    @GetMapping public List<UserNotificationResponse> mine(Authentication authentication) { return service.mine(authentication.getName()); }
    @PatchMapping("/{id}/read") public void read(@PathVariable Long id, Authentication authentication) { service.markRead(id, authentication.getName()); }
}
