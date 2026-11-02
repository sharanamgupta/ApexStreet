package com.apexstreet.repository;

import com.apexstreet.model.UserNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface UserNotificationRepository extends JpaRepository<UserNotification, Long> {
    List<UserNotification> findByUserEmailOrderByCreatedAtDesc(String email);
}
