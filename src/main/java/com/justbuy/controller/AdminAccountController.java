package com.justbuy.controller;

import com.justbuy.model.*;
import com.justbuy.repository.*;
import com.justbuy.service.AdminAuthorizationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminAccountController {
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final DriverRepository driverRepository;
    private final AdminAccountRepository adminAccountRepository;
    private final SupportAgentRepository supportAgentRepository;
    private final OrderRepository orderRepository;
    private final AccountApplicationRepository applicationRepository;
    private final AuditLogRepository auditLogRepository;
    private final AdminAuthorizationService adminAuthorizationService;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> list(@RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return unauthorized();
        List<Map<String, Object>> accounts = new ArrayList<>();
        adminAccountRepository.findAll().stream().filter(a -> "ADMIN".equalsIgnoreCase(a.getRole())).forEach(a -> accounts.add(base(a.getId(), a.getName(), a.getEmail(), "ADMIN", a.getStatus(), a.getCreatedAt())));
        supportAgentRepository.findAll().forEach(a -> { Map<String, Object> item = base(a.getId(), a.getName(), a.getEmail(), "SUPPORT_AGENT", a.getStatus(), a.getCreatedAt()); item.put("phoneNumber", a.getPhoneNumber()); item.put("address", a.getAddress()); item.put("department", a.getDepartment()); item.put("availability", a.getAvailability()); accounts.add(item); });
        userRepository.findAll().forEach(u -> { if (!"ADMIN".equalsIgnoreCase(u.getRole())) { Map<String, Object> item = base(u.getId(), u.getFullName(), u.getEmail(), "CUSTOMER", u.getAccountStatus(), u.getCreatedAt()); item.put("phoneNumber", u.getPhoneNumber()); item.put("address", u.getAddress()); accounts.add(item); } });
        sellerRepository.findAll().forEach(s -> { Map<String, Object> item = base(s.getId(), s.getName(), s.getEmail(), "SELLER", s.getStatus(), s.getJoinedAt()); item.put("storeName", s.getName()); item.put("address", s.getLocation()); item.put("location", s.getLocation()); item.put("phoneNumber", s.getPhoneNumber()); item.put("idNumber", s.getIdNumber()); item.put("businessDetails", s.getBusinessDetails()); item.put("paymentMethod", s.getPaymentMethod()); item.put("verificationStatus", Boolean.TRUE.equals(s.getVerified()) ? "APPROVED" : "PENDING"); accounts.add(item); });
        driverRepository.findAll().forEach(d -> { Map<String, Object> item = base(d.getId(), d.getName(), d.getEmail(), "DELIVERY", publicDriverStatus(d.getStatus()), d.getJoinedAt()); item.put("address", d.getAddress()); item.put("phoneNumber", d.getPhoneNumber()); item.put("idNumber", d.getIdNumber()); item.put("vehicleNumber", d.getVehicleNumber()); item.put("approvalStatus", publicDriverStatus(d.getStatus())); accounts.add(item); });
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> analytics(@RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return unauthorized();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("admins", adminAccountRepository.count()); result.put("supportAgents", supportAgentRepository.count()); result.put("customers", userRepository.findAll().stream().filter(u -> "CUSTOMER".equalsIgnoreCase(u.getRole())).count()); result.put("sellers", sellerRepository.count()); result.put("drivers", driverRepository.count()); result.put("applications", applicationRepository.count()); result.put("orders", orderRepository.count()); result.put("completedOrders", orderRepository.findAll().stream().filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus())).count()); result.put("cancelledOrders", orderRepository.findAll().stream().filter(o -> "CANCELLED".equalsIgnoreCase(o.getStatus())).count()); result.put("revenue", orderRepository.findAll().stream().filter(o -> o.getTotal() != null && !"CANCELLED".equalsIgnoreCase(o.getStatus())).mapToDouble(o -> o.getTotal().doubleValue()).sum()); result.put("auditEvents", auditLogRepository.count()); return ResponseEntity.ok(result);
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<?> auditLogs(@RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return unauthorized();
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByCreatedAtDesc().stream().map(log -> {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", log.getId()); item.put("action", log.getAction()); item.put("entityType", log.getEntityType()); item.put("entityId", log.getEntityId()); item.put("actorEmail", log.getActorEmail()); item.put("details", log.getDetails()); item.put("createdAt", log.getCreatedAt());
            return item;
        }).toList());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, String> input, @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return unauthorized();
        String role = normalizeRole(input.get("role")); String name = input.getOrDefault("name", "").trim(); String email = input.getOrDefault("email", "").trim().toLowerCase(); String password = input.getOrDefault("password", "");
        if (!supported(role)) return bad("Choose admin, support agent, customer, seller, or delivery.");
        if (blank(name) || blank(email) || !email.contains("@")) return bad("Name and a valid email are required.");
        if (password.length() < 4) return bad("Password must contain at least 4 characters.");
        if (emailExists(email)) return bad("An account with this email already exists.");
        String phone = input.getOrDefault("phoneNumber", "Not provided"); String address = input.getOrDefault("address", "Not provided"); String hash = passwordEncoder.encode(password); Object saved;
        if (role.equals("ADMIN")) saved = adminAccountRepository.save(AdminAccount.builder().name(name).email(email).passwordHash(hash).role("ADMIN").status("ACTIVE").build());
        else if (role.equals("SUPPORT_AGENT")) saved = supportAgentRepository.save(SupportAgent.builder().name(name).email(email).passwordHash(hash).phoneNumber(phone).address(address).department(input.getOrDefault("department", "General Support")).status("ACTIVE").build());
        else if (role.equals("CUSTOMER")) saved = userRepository.save(User.builder().fullName(name).email(email).passwordHash(hash).role("CUSTOMER").phoneNumber(phone).address(address).accountStatus("ACTIVE").build());
        else if (role.equals("SELLER")) saved = sellerRepository.save(Seller.builder().name(name).email(email).passwordHash(hash).location(address).phoneNumber(phone).status("ACTIVE").verified(false).build());
        else saved = driverRepository.save(Driver.builder().name(name).email(email).passwordHash(hash).address(address).idNumber(input.getOrDefault("idNumber", "Not provided")).phoneNumber(phone).vehicleNumber(input.getOrDefault("vehicleNumber", "Not provided")).status("APPROVED").verified(true).build());
        audit(adminEmail, "CREATE_ACCOUNT", role, idOf(saved), "Created " + role + " account for " + email); return ResponseEntity.status(HttpStatus.CREATED).body(accountPayload(saved, role));
    }

    @PutMapping("/{role}/{id}/role")
    @Transactional
    public ResponseEntity<?> changeRole(@PathVariable String role, @PathVariable Long id, @RequestBody Map<String, String> body, @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return unauthorized();
        String source = normalizeRole(role); String target = normalizeRole(body.get("role"));
        if (!supported(source) || !supported(target)) return bad("Unsupported source or target role.");
        if (source.equals(target)) return bad("Choose a different role.");
        if (target.equals("ADMIN") && !adminEmail.equalsIgnoreCase(emailFor(source, id))) return convert(source, id, target, adminEmail);
        return convert(source, id, target, adminEmail);
    }

    private ResponseEntity<?> convert(String source, Long id, String target, String adminEmail) {
        String name; String email; String hash; String phone = "Not provided"; String address = "Not provided"; String idNumber = "Not provided"; String vehicle = "Not provided"; Long oldId = id;
        if (source.equals("ADMIN")) { AdminAccount a = adminAccountRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); if (a.getEmail().equalsIgnoreCase(adminEmail)) return bad("You cannot change the role of the account currently being used."); name = a.getName(); email = a.getEmail(); hash = a.getPasswordHash(); adminAccountRepository.delete(a); }
        else if (source.equals("SUPPORT_AGENT")) { SupportAgent a = supportAgentRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); if (a.getEmail().equalsIgnoreCase(adminEmail)) return bad("You cannot change the role of the account currently being used."); name = a.getName(); email = a.getEmail(); hash = a.getPasswordHash(); phone = value(a.getPhoneNumber(), phone); address = value(a.getAddress(), address); supportAgentRepository.delete(a); }
        else if (source.equals("CUSTOMER")) { User u = userRepository.findById(id).orElse(null); if (u == null) return ResponseEntity.notFound().build(); name = u.getFullName(); email = u.getEmail(); hash = u.getPasswordHash(); phone = value(u.getPhoneNumber(), phone); address = value(u.getAddress(), address); userRepository.delete(u); }
        else if (source.equals("SELLER")) { Seller s = sellerRepository.findById(id).orElse(null); if (s == null) return ResponseEntity.notFound().build(); name = s.getName(); email = s.getEmail(); hash = s.getPasswordHash(); phone = value(s.getPhoneNumber(), phone); address = value(s.getLocation(), address); sellerRepository.delete(s); }
        else { Driver d = driverRepository.findById(id).orElse(null); if (d == null) return ResponseEntity.notFound().build(); name = d.getName(); email = d.getEmail(); hash = d.getPasswordHash(); phone = value(d.getPhoneNumber(), phone); address = value(d.getAddress(), address); idNumber = value(d.getIdNumber(), idNumber); vehicle = value(d.getVehicleNumber(), vehicle); driverRepository.delete(d); }
        Object saved;
        if (target.equals("ADMIN")) saved = adminAccountRepository.save(AdminAccount.builder().name(name).email(email).passwordHash(hash).role("ADMIN").status("ACTIVE").build());
        else if (target.equals("SUPPORT_AGENT")) saved = supportAgentRepository.save(SupportAgent.builder().name(name).email(email).passwordHash(hash).phoneNumber(phone).address(address).department("General Support").status("ACTIVE").build());
        else if (target.equals("CUSTOMER")) saved = userRepository.save(User.builder().fullName(name).email(email).passwordHash(hash).role("CUSTOMER").phoneNumber(phone).address(address).accountStatus("ACTIVE").build());
        else if (target.equals("SELLER")) saved = sellerRepository.save(Seller.builder().name(name).email(email).passwordHash(hash).location(address).phoneNumber(phone).status("ACTIVE").verified(false).build());
        else saved = driverRepository.save(Driver.builder().name(name).email(email).passwordHash(hash).address(address).idNumber(idNumber).phoneNumber(phone).vehicleNumber(vehicle).status("APPROVED").verified(true).build());
        audit(adminEmail, "CHANGE_ROLE", source, oldId, "Changed " + email + " from " + source + " to " + target); return ResponseEntity.ok(accountPayload(saved, target));
    }

    @PutMapping("/{role}/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String role, @PathVariable Long id, @RequestBody Map<String, String> body, @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return unauthorized(); String normalized = normalizeRole(role); String requested = normalize(body.get("status")); if (!List.of("ACTIVE", "SUSPENDED").contains(requested)) return bad("Status must be ACTIVE or SUSPENDED.");
        if (normalized.equals("ADMIN")) { AdminAccount a = adminAccountRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); a.setStatus(requested); adminAccountRepository.save(a); }
        else if (normalized.equals("SUPPORT_AGENT")) { SupportAgent a = supportAgentRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); a.setStatus(requested); supportAgentRepository.save(a); }
        else if (normalized.equals("CUSTOMER")) { User a = userRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); a.setAccountStatus(requested); userRepository.save(a); }
        else if (normalized.equals("SELLER")) { Seller a = sellerRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); a.setStatus(requested); sellerRepository.save(a); }
        else if (normalized.equals("DELIVERY")) { Driver a = driverRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); a.setStatus(requested.equals("ACTIVE") ? "APPROVED" : "SUSPENDED"); driverRepository.save(a); }
        else return bad("Unknown account role.");
        audit(adminEmail, "CHANGE_STATUS", normalized, id, requested); return ResponseEntity.ok(Map.of("status", requested, "role", normalized));
    }

    @PutMapping("/{role}/{id}")
    public ResponseEntity<?> update(@PathVariable String role, @PathVariable Long id, @RequestBody Map<String, String> body, @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return unauthorized(); String normalized = normalizeRole(role); String name = body.getOrDefault("name", "").trim(); if (blank(name)) return bad("Name is required.");
        if (normalized.equals("ADMIN")) { AdminAccount a = adminAccountRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); a.setName(name); adminAccountRepository.save(a); }
        else if (normalized.equals("SUPPORT_AGENT")) { SupportAgent a = supportAgentRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); a.setName(name); supportAgentRepository.save(a); }
        else if (normalized.equals("CUSTOMER")) { User a = userRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); a.setFullName(name); userRepository.save(a); }
        else if (normalized.equals("SELLER")) { Seller a = sellerRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); a.setName(name); sellerRepository.save(a); }
        else if (normalized.equals("DELIVERY")) { Driver a = driverRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); a.setName(name); driverRepository.save(a); }
        else return bad("Unknown account role.");
        audit(adminEmail, "UPDATE_ACCOUNT", normalized, id, "Updated account name"); return ResponseEntity.ok(Map.of("role", normalized, "name", name));
    }

    @DeleteMapping("/{role}/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable String role, @PathVariable Long id, @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return unauthorized(); String normalized = normalizeRole(role); String email;
        if (normalized.equals("ADMIN")) { AdminAccount a = adminAccountRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); if (a.getEmail().equalsIgnoreCase(adminEmail)) return bad("You cannot delete the account currently being used."); email = a.getEmail(); adminAccountRepository.delete(a); }
        else if (normalized.equals("SUPPORT_AGENT")) { SupportAgent a = supportAgentRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); email = a.getEmail(); supportAgentRepository.delete(a); }
        else if (normalized.equals("CUSTOMER")) { User a = userRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); email = a.getEmail(); userRepository.delete(a); }
        else if (normalized.equals("SELLER")) { Seller a = sellerRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); email = a.getEmail(); deleteSellerDependencies(id); sellerRepository.delete(a); sellerRepository.flush(); }
        else if (normalized.equals("DELIVERY")) { Driver a = driverRepository.findById(id).orElse(null); if (a == null) return ResponseEntity.notFound().build(); email = a.getEmail(); driverRepository.delete(a); }
        else return bad("Unknown account role.");
        audit(adminEmail, "DELETE_ACCOUNT", normalized, id, "Deleted account " + email); return ResponseEntity.noContent().build();
    }

    private String emailFor(String role, Long id) { if (role.equals("ADMIN")) return adminAccountRepository.findById(id).map(AdminAccount::getEmail).orElse(""); if (role.equals("SUPPORT_AGENT")) return supportAgentRepository.findById(id).map(SupportAgent::getEmail).orElse(""); if (role.equals("CUSTOMER")) return userRepository.findById(id).map(User::getEmail).orElse(""); if (role.equals("SELLER")) return sellerRepository.findById(id).map(Seller::getEmail).orElse(""); return driverRepository.findById(id).map(Driver::getEmail).orElse(""); }
    private boolean emailExists(String email) { return adminAccountRepository.findByEmailIgnoreCase(email).isPresent() || supportAgentRepository.findByEmailIgnoreCase(email).isPresent() || userRepository.findByEmailIgnoreCase(email).isPresent() || sellerRepository.findByEmailIgnoreCase(email).isPresent() || driverRepository.findByEmailIgnoreCase(email).isPresent(); }
    private Map<String, Object> base(Long id, String name, String email, String role, String status, Object createdAt) { Map<String, Object> m = new LinkedHashMap<>(); m.put("id", id); m.put("name", name); m.put("email", email); m.put("role", role); m.put("status", status); m.put("createdAt", createdAt); return m; }
    private Map<String, Object> accountPayload(Object a, String role) { Map<String, Object> m = new LinkedHashMap<>(); m.put("role", role); if (a instanceof AdminAccount x) { m.put("id", x.getId()); m.put("name", x.getName()); m.put("email", x.getEmail()); m.put("status", x.getStatus()); } else if (a instanceof SupportAgent x) { m.put("id", x.getId()); m.put("name", x.getName()); m.put("email", x.getEmail()); m.put("status", x.getStatus()); } else if (a instanceof User x) { m.put("id", x.getId()); m.put("name", x.getFullName()); m.put("email", x.getEmail()); m.put("status", x.getAccountStatus()); } else if (a instanceof Seller x) { m.put("id", x.getId()); m.put("name", x.getName()); m.put("email", x.getEmail()); m.put("status", x.getStatus()); } else if (a instanceof Driver x) { m.put("id", x.getId()); m.put("name", x.getName()); m.put("email", x.getEmail()); m.put("status", publicDriverStatus(x.getStatus())); } return m; }
    private Long idOf(Object a) { if (a instanceof AdminAccount x) return x.getId(); if (a instanceof SupportAgent x) return x.getId(); if (a instanceof User x) return x.getId(); if (a instanceof Seller x) return x.getId(); return ((Driver) a).getId(); }
    private boolean supported(String role) { return List.of("ADMIN", "SUPPORT_AGENT", "CUSTOMER", "SELLER", "DELIVERY").contains(role); }
    private String publicDriverStatus(String status) { return "APPROVED".equalsIgnoreCase(status) ? "ACTIVE" : status; }
    private String value(String value, String fallback) { return value == null || value.isBlank() ? fallback : value; }
    private void audit(String actor, String action, String type, Long id, String details) { auditLogRepository.save(AuditLog.builder().actorEmail(actor).action(action).entityType(type).entityId(id).details(details).build()); }
    private void deleteSellerDependencies(Long sellerId) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        products.forEach(product -> reviewRepository.deleteAll(reviewRepository.findByProductId(product.getId())));
        reviewRepository.flush();
        productRepository.deleteAll(products);
        productRepository.flush();
    }
    private boolean authorized(String email) { return adminAuthorizationService.isAuthorized(email); }
    private ResponseEntity<Map<String, String>> unauthorized() { return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Active admin authorization is required.")); }
    private ResponseEntity<Map<String, String>> bad(String message) { return ResponseEntity.badRequest().body(Map.of("message", message)); }
    private static String normalize(String value) { return value == null ? "" : value.trim().toUpperCase(); }
    private static String normalizeRole(String value) { String role = normalize(value).replace('-', '_').replace(' ', '_'); return role.equals("AGENT") || role.equals("CUSTOMER_SUPPORT") ? "SUPPORT_AGENT" : role.equals("DRIVER") ? "DELIVERY" : role; }
    private static boolean blank(String value) { return value == null || value.trim().isEmpty(); }
}
