package com.apexstreet.service;

import com.apexstreet.dto.UserNotificationResponse;
import com.apexstreet.model.UserNotification;
import com.apexstreet.repository.UserNotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Collection;
import com.apexstreet.model.Role;

@Service
public class UserNotificationService {
    private final UserNotificationRepository repository;
    public UserNotificationService(UserNotificationRepository repository) { this.repository = repository; }
    @Transactional(readOnly = true) public List<UserNotificationResponse> mine(String email) { return repository.findByUserEmailOrderByCreatedAtDesc(email).stream().map(UserNotificationResponse::from).toList(); }
    @Transactional public void create(com.apexstreet.model.User user, String title, String message, String type, String link) { UserNotification n = new UserNotification(); n.setUser(user); n.setTitle(title); n.setMessage(message); n.setType(type); n.setLink(link); repository.save(n); }
    @Transactional public void notifyOperators(Collection<com.apexstreet.model.User> users, String title, String message, String type, String link) { users.forEach(user -> create(user, title, message, type, link)); }
    @Transactional public void markRead(Long id, String email) { repository.findById(id).filter(n -> n.getUser().getEmail().equalsIgnoreCase(email)).ifPresent(n -> { n.setRead(true); repository.save(n); }); }
}
