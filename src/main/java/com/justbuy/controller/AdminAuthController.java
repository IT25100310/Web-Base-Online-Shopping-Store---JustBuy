package com.justbuy.controller;

import com.justbuy.model.AuditLog;
import com.justbuy.repository.AdminAccountRepository;
import com.justbuy.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin-auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminAuthController {
    private final AdminAccountRepository adminAccountRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.getOrDefault("email", "").trim();
        String password = credentials.getOrDefault("password", "");
        return adminAccountRepository.findByEmailIgnoreCase(email)
                .filter(account -> "ACTIVE".equalsIgnoreCase(account.getStatus()))
                .filter(account -> account.getPasswordHash() != null
                        && passwordEncoder.matches(password, account.getPasswordHash()))
                .<ResponseEntity<?>>map(account -> {
                    auditLogRepository.save(AuditLog.builder().actorEmail(account.getEmail()).action("ADMIN_LOGIN").entityType("ADMIN_ACCOUNT").entityId(account.getId()).details("Administrator logged in").build());
                    return ResponseEntity.ok(Map.of("admin", Map.of(
                            "id", account.getId(), "name", account.getName(), "email", account.getEmail(), "role", "admin")));
                })
                .orElseGet(() -> ResponseEntity.status(401).body(Map.of("message", "Invalid admin email or password.")));
    }
}
