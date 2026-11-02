package com.apexstreet;

import com.apexstreet.dto.AuthResponse;
import com.apexstreet.dto.LoginRequest;
import com.apexstreet.dto.RegisterRequest;
import com.apexstreet.model.Role;
import com.apexstreet.model.User;
import com.apexstreet.repository.UserRepository;
import com.apexstreet.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    public void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("1. New signup -> saved in database with BCrypt hash and ROLE_USER")
    public void testNewSignupSavedInDatabase() {
        RegisterRequest registerRequest = new RegisterRequest("Jane Doe", "jane@example.com", "password123");
        AuthResponse response = authService.register(registerRequest);

        assertNotNull(response.getToken());
        assertEquals("jane@example.com", response.getUser().getEmail());
        assertEquals(Role.USER, response.getUser().getRole());

        User user = userRepository.findByEmail("jane@example.com").orElse(null);
        assertNotNull(user);
        assertEquals("Jane Doe", user.getName());
        assertEquals(Role.USER, user.getRole());
        assertTrue(passwordEncoder.matches("password123", user.getPassword()));
        assertNotEquals("password123", user.getPassword()); // Password is BCrypt hashed
    }

    @Test
    @DisplayName("2. Duplicate email rejected")
    public void testDuplicateEmailRejected() {
        RegisterRequest registerRequest1 = new RegisterRequest("User One", "duplicate@example.com", "password123");
        authService.register(registerRequest1);

        RegisterRequest registerRequest2 = new RegisterRequest("User Two", "duplicate@example.com", "password456");
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            authService.register(registerRequest2);
        });

        assertEquals("An account with this email already exists.", exception.getMessage());
    }

    @Test
    @DisplayName("3. Correct login works")
    public void testCorrectLoginWorks() {
        RegisterRequest registerRequest = new RegisterRequest("John Smith", "john@example.com", "securePass123");
        authService.register(registerRequest);

        LoginRequest loginRequest = new LoginRequest("john@example.com", "securePass123");
        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response.getToken());
        assertEquals("john@example.com", response.getUser().getEmail());
        assertEquals("Login successful", response.getMessage());
    }

    @Test
    @DisplayName("4. Wrong password rejected")
    public void testWrongPasswordRejected() {
        RegisterRequest registerRequest = new RegisterRequest("John Smith", "john@example.com", "securePass123");
        authService.register(registerRequest);

        LoginRequest loginRequest = new LoginRequest("john@example.com", "wrongPassword");
        assertThrows(BadCredentialsException.class, () -> {
            authService.login(loginRequest);
        });
    }

    @Test
    @DisplayName("5. Admin login works")
    public void testAdminLoginWorks() {
        User adminUser = new User();
        adminUser.setName("System Admin");
        adminUser.setEmail("admin@apexstreet.com");
        adminUser.setPassword(passwordEncoder.encode("AdminSecret123"));
        adminUser.setRole(Role.ADMIN);
        userRepository.save(adminUser);

        LoginRequest loginRequest = new LoginRequest("admin@apexstreet.com", "AdminSecret123");
        AuthResponse response = authService.login(loginRequest);

        assertNotNull(response.getToken());
        assertEquals(Role.ADMIN, response.getUser().getRole());
    }

    @Test
    @DisplayName("6. Public signup never allows creating ADMIN role")
    public void testPublicSignupAlwaysAssignsRoleUser() {
        RegisterRequest registerRequest = new RegisterRequest("Sneaky Admin", "sneaky@example.com", "password123");
        AuthResponse response = authService.register(registerRequest);

        assertEquals(Role.USER, response.getUser().getRole());
        User savedUser = userRepository.findByEmail("sneaky@example.com").orElseThrow();
        assertEquals(Role.USER, savedUser.getRole());
    }
}
