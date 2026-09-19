package com.justbuy.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin-auth")
@CrossOrigin(origins = "*")
public class AdminAuthController {
    private static final String ADMIN_EMAIL = "admin@justbuy.com";
    private static final String ADMIN_PASSWORD = "admin123";

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.getOrDefault("email", "").trim();
        String password = credentials.getOrDefault("password", "");
        if (!ADMIN_EMAIL.equalsIgnoreCase(email) || !ADMIN_PASSWORD.equals(password)) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid admin email or password."));
        }
        return ResponseEntity.ok(Map.of("admin", Map.of("name", "JustBuy Administrator", "email", ADMIN_EMAIL, "role", "admin")));
    }
}
