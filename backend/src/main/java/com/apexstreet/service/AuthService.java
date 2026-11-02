package com.apexstreet.service;

import com.apexstreet.dto.*;
import com.apexstreet.model.Role;
import com.apexstreet.model.User;
import com.apexstreet.repository.UserRepository;
import com.apexstreet.security.JwtTokenProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        // 1. Check Unique Email across entire system
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("An account with this email already exists.");
        }

        // Public registration supports standard user and operator accounts.
        // ADMIN accounts must still be provisioned by an administrator.
        String requestedRole = request.getRole() == null
                ? "USER"
                : request.getRole().trim().toUpperCase();
        Role targetRole;
        if ("USER".equals(requestedRole)) {
            targetRole = Role.USER;
        } else if ("OPERATOR".equals(requestedRole)) {
            targetRole = Role.OPERATOR;
        } else {
            throw new IllegalArgumentException("Registration role must be USER or OPERATOR.");
        }

        User user = new User();
        user.setName(request.getFullName().trim());
        user.setEmail(normalizedEmail);
        user.setPassword(passwordEncoder.encode(request.getPassword())); // BCrypt hashed
        user.setRole(targetRole);

        User savedUser = userRepository.save(user);
        String token = tokenProvider.generateToken(savedUser.getEmail(), savedUser.getRole().name());

        return new AuthResponse(token, targetRole.name() + " registered successfully", new UserDto(savedUser));
    }

    public AuthResponse login(LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();
        String expectedRoleStr = request.getRole() != null ? request.getRole().trim().toUpperCase() : null;

        String badCredsMsg = "OPERATOR".equalsIgnoreCase(expectedRoleStr)
                ? "Invalid Operator credentials."
                : "USER".equalsIgnoreCase(expectedRoleStr)
                ? "Invalid User credentials."
                : "Invalid email or password.";

        User user = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new BadCredentialsException(badCredsMsg));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException(badCredsMsg);
        }

        // Validate actual database role against frontend selection
        if (expectedRoleStr != null && !user.getRole().name().equalsIgnoreCase(expectedRoleStr)) {
            throw new BadCredentialsException(badCredsMsg);
        }

        String token = tokenProvider.generateToken(user.getEmail(), user.getRole().name());

        return new AuthResponse(token, "Login successful", new UserDto(user));
    }
}
