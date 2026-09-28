package com.justbuy.controller;

import com.justbuy.model.*;
import com.justbuy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/unified-auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UnifiedAuthController {
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final DriverRepository driverRepository;
    private final AdminAccountRepository adminAccountRepository;
    private final SupportAgentRepository supportAgentRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.getOrDefault("email", "").trim().toLowerCase();
        String password = credentials.getOrDefault("password", "");
        if (email.isBlank() || password.isBlank()) return ResponseEntity.badRequest().body(Map.of("message", "Email and password are required."));

        List<AccountMatch> matches = new ArrayList<>();
        boolean blocked = false;
        var user = userRepository.findByEmailIgnoreCase(email);
        if (user.isPresent() && passwordMatches(password, user.get().getPasswordHash())) {
            if ("ACTIVE".equalsIgnoreCase(user.get().getAccountStatus())) matches.add(customer(user.get())); else blocked = true;
        }
        var seller = sellerRepository.findByEmailIgnoreCase(email);
        if (seller.isPresent() && passwordMatches(password, seller.get().getPasswordHash())) {
            if (sellerActive(seller.get())) matches.add(seller(seller.get())); else blocked = true;
        }
        var driver = driverRepository.findByEmailIgnoreCase(email);
        if (driver.isPresent() && passwordMatches(password, driver.get().getPasswordHash())) {
            if ("APPROVED".equalsIgnoreCase(driver.get().getStatus()) && Boolean.TRUE.equals(driver.get().getVerified())) matches.add(driver(driver.get())); else blocked = true;
        }
        var agent = supportAgentRepository.findByEmailIgnoreCase(email);
        if (agent.isPresent() && passwordMatches(password, agent.get().getPasswordHash())) {
            if ("ACTIVE".equalsIgnoreCase(agent.get().getStatus())) matches.add(agent(agent.get())); else blocked = true;
        }
        var admin = adminAccountRepository.findByEmailIgnoreCase(email);
        if (admin.isPresent() && passwordMatches(password, admin.get().getPasswordHash())) {
            if ("ACTIVE".equalsIgnoreCase(admin.get().getStatus())) matches.add(admin(admin.get())); else blocked = true;
        }

        if (matches.size() > 1) return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "This email is linked to more than one account. Contact an administrator."));
        if (matches.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", blocked ? "This account is suspended or not approved." : "Invalid email or password."));
        AccountMatch match = matches.get(0);
        auditLogRepository.save(AuditLog.builder().actorEmail(email).action("UNIFIED_LOGIN").entityType(match.entityType()).entityId(match.id()).details("Logged in as " + match.role()).build());
        Map<String, Object> response = new LinkedHashMap<>(match.payload());
        response.put("role", match.role());
        response.put("redirect", match.redirect());
        return ResponseEntity.ok(response);
    }

    private boolean passwordMatches(String raw, String hash) { return hash != null && passwordEncoder.matches(raw, hash); }
    private boolean sellerActive(Seller seller) { return seller.getStatus() == null || "ACTIVE".equalsIgnoreCase(seller.getStatus()) || "APPROVED".equalsIgnoreCase(seller.getStatus()); }
    private AccountMatch customer(User a) { return new AccountMatch(a.getId(), "CUSTOMER", "/HTML/index.html#/", "USER", map("id", a.getId(), "name", a.getFullName(), "fullName", a.getFullName(), "email", a.getEmail(), "accountStatus", a.getAccountStatus())); }
    private AccountMatch seller(Seller a) { Map<String, Object> safe = map("id", a.getId(), "name", a.getName(), "email", a.getEmail(), "slug", a.getSlug(), "description", a.getDescription(), "logoUrl", a.getLogoUrl(), "bannerUrl", a.getBannerUrl(), "rating", a.getRating(), "reviewCount", a.getReviewCount(), "followerCount", a.getFollowerCount(), "salesCount", a.getSalesCount(), "location", a.getLocation(), "phoneNumber", a.getPhoneNumber(), "status", a.getStatus(), "verified", a.getVerified(), "badge", a.getBadge()); return new AccountMatch(a.getId(), "SELLER", "/HTML/seller-dashboard.html", "SELLER", map("id", a.getId(), "name", a.getName(), "fullName", a.getName(), "email", a.getEmail(), "seller", safe)); }
    private AccountMatch driver(Driver a) { Map<String, Object> safe = map("id", a.getId(), "name", a.getName(), "email", a.getEmail(), "address", a.getAddress(), "phoneNumber", a.getPhoneNumber(), "idNumber", a.getIdNumber(), "vehicleNumber", a.getVehicleNumber(), "status", a.getStatus(), "verified", a.getVerified()); return new AccountMatch(a.getId(), "DRIVER", "/HTML/delivery-dashboard.html", "DRIVER", map("id", a.getId(), "name", a.getName(), "fullName", a.getName(), "email", a.getEmail(), "phoneNumber", a.getPhoneNumber(), "vehicleNumber", a.getVehicleNumber(), "driver", safe)); }
    private AccountMatch agent(SupportAgent a) { return new AccountMatch(a.getId(), "SUPPORT_AGENT", "/HTML/support-agent-dashboard.html", "SUPPORT_AGENT", map("id", a.getId(), "name", a.getName(), "fullName", a.getName(), "email", a.getEmail(), "accountRole", "SUPPORT_AGENT")); }
    private AccountMatch admin(AdminAccount a) { return new AccountMatch(a.getId(), "ADMIN", "/HTML/admin-dashboard.html", "ADMIN_ACCOUNT", map("id", a.getId(), "name", a.getName(), "fullName", a.getName(), "email", a.getEmail(), "accountRole", "ADMIN")); }
    private Map<String, Object> map(Object... values) { Map<String, Object> result = new LinkedHashMap<>(); for (int i = 0; i < values.length; i += 2) if (values[i + 1] != null) result.put(String.valueOf(values[i]), values[i + 1]); return result; }
    private record AccountMatch(Long id, String role, String redirect, String entityType, Map<String, Object> payload) {}
}
