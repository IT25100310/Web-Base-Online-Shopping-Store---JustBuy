package com.justbuy.controller;

import com.justbuy.model.AuditLog;
import com.justbuy.model.AdminAccount;
import com.justbuy.model.SupportAgent;
import com.justbuy.repository.AdminAccountRepository;
import com.justbuy.repository.AuditLogRepository;
import com.justbuy.repository.SupportAgentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin-auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminAuthController {
    private final AdminAccountRepository adminAccountRepository;
    private final SupportAgentRepository supportAgentRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.getOrDefault("email", "").trim();
        String password = credentials.getOrDefault("password", "");
        var admin = adminAccountRepository.findByEmailIgnoreCase(email)
                .filter(a -> "ACTIVE".equalsIgnoreCase(a.getStatus()) && "ADMIN".equalsIgnoreCase(a.getRole()))
                .filter(a -> a.getPasswordHash() != null && passwordEncoder.matches(password, a.getPasswordHash()));
        if (admin.isPresent()) return successAdmin(admin.get());

        var agent = supportAgentRepository.findByEmailIgnoreCase(email)
                .filter(a -> "ACTIVE".equalsIgnoreCase(a.getStatus()))
                .filter(a -> a.getPasswordHash() != null && passwordEncoder.matches(password, a.getPasswordHash()));
        if (agent.isPresent()) return successAgent(agent.get());

        return ResponseEntity.status(401).body(Map.of("message", "Invalid administrator or support-agent email/password."));
    }

    private ResponseEntity<?> successAdmin(AdminAccount account) {
        auditLogRepository.save(AuditLog.builder().actorEmail(account.getEmail()).action("STAFF_LOGIN").entityType("ADMIN_ACCOUNT").entityId(account.getId()).details("Administrator logged in").build());
        return ResponseEntity.ok(Map.of("admin", Map.of("id", account.getId(), "name", account.getName(), "email", account.getEmail(), "role", "admin", "accountRole", "ADMIN")));
    }

    private ResponseEntity<?> successAgent(SupportAgent agent) {
        auditLogRepository.save(AuditLog.builder().actorEmail(agent.getEmail()).action("STAFF_LOGIN").entityType("SUPPORT_AGENT").entityId(agent.getId()).details("Support agent logged in").build());
        return ResponseEntity.ok(Map.of("admin", Map.of("id", agent.getId(), "name", agent.getName(), "email", agent.getEmail(), "role", "support_agent", "accountRole", "SUPPORT_AGENT")));
    }
}
