package com.justbuy.controller;


import com.justbuy.model.User;
import com.justbuy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // ==========================================
    // CUSTOMER REGISTRATION
    // ==========================================

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        String fullName = request.fullName() == null
                ? ""
                : request.fullName().trim();

        String email = request.email() == null
                ? ""
                : request.email().trim().toLowerCase();

        String password = request.password() == null
                ? ""
                : request.password();

        // Validate full name
        if (fullName.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Full name is required."));
        }

        // Validate email
        if (email.isBlank() || !email.contains("@")) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Please enter a valid email address."));
        }

        // Validate password
        if (password.length() < 6) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Password must be at least 6 characters."));
        }

        // Check existing customer
        if (userRepository.existsByEmailIgnoreCase(email)) {
            return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "An account with this email already exists."));
        }

        // Create customer
        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role("CUSTOMER")
                .build();

        User savedUser = userRepository.save(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(Map.of(
                        "id", savedUser.getId(),
                        "fullName", savedUser.getFullName(),
                        "email", savedUser.getEmail(),
                        "role", savedUser.getRole()
                ));
    }


    // ==========================================
    // CUSTOMER LOGIN
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {

        String email = request.email() == null
                ? ""
                : request.email().trim().toLowerCase();

        String password = request.password() == null
                ? ""
                : request.password();

        if (email.isBlank() || password.isBlank()) {
            return ResponseEntity
                    .badRequest()
                    .body(Map.of("message", "Email and password are required."));
        }

        return userRepository.findByEmailIgnoreCase(email)
                .filter(user ->
                        user.getPasswordHash() != null &&
                                passwordEncoder.matches(
                                        password,
                                        user.getPasswordHash()
                                )
                )
                .map(user -> ResponseEntity.ok(
                        Map.of(
                                "id", user.getId(),
                                "fullName", user.getFullName(),
                                "email", user.getEmail(),
                                "role", user.getRole()
                        )
                ))
                .orElseGet(() ->
                        ResponseEntity
                                .status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of(
                                        "message",
                                        "Invalid customer email or password."
                                ))
                );
    }


    // ==========================================
    // REQUEST RECORDS
    // ==========================================

    public record RegisterRequest(
            String fullName,
            String email,
            String password
    ) {
    }

    public record LoginRequest(
            String email,
            String password
    ) {
    }
}