package com.apexstreet.config;

import com.apexstreet.model.Role;
import com.apexstreet.model.User;
import com.apexstreet.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JdbcTemplate jdbcTemplate;

    @Value("${app.admin.init.enabled:true}")
    private boolean enabled;

    @Value("${app.admin.init.name:ApexStreet Admin}")
    private String adminName;

    @Value("${app.admin.init.email:admin@apexstreet.com}")
    private String adminEmail;

    @Value("${app.admin.init.password:Admin@12345}")
    private String adminPassword;

    public AdminInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder, JdbcTemplate jdbcTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL");
            logger.info("Successfully altered table users to allow longer role values.");
        } catch (Exception e) {
            logger.warn("Could not alter table users role column (it may already be correct or table does not exist yet): {}", e.getMessage());
        }

        if (!enabled) {
            return;
        }

        String normalizedEmail = adminEmail.trim().toLowerCase();
        if (!userRepository.existsByEmail(normalizedEmail)) {
            User admin = new User();
            admin.setName(adminName.trim());
            admin.setEmail(normalizedEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword)); // Safely BCrypt hashed
            admin.setRole(Role.ADMIN);
            userRepository.save(admin);
            logger.info("Admin account initialized successfully for email: {}", normalizedEmail);
        } else {
            logger.info("Admin account already exists for email: {}", normalizedEmail);
        }

        // Auto-Initialize Default Operator Account if not present
        String operatorEmail = "operator@apexstreet.com";
        if (!userRepository.existsByEmail(operatorEmail)) {
            User operator = new User();
            operator.setName("ApexStreet Operator");
            operator.setEmail(operatorEmail);
            operator.setPassword(passwordEncoder.encode("Operator@12345"));
            operator.setRole(Role.OPERATOR);
            userRepository.save(operator);
            logger.info("Operator account initialized successfully for email: {}", operatorEmail);
        }
    }
}
