package com.justbuy.controller;

import com.justbuy.model.*;
import com.justbuy.repository.*;
import com.justbuy.service.AdminAuthorizationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/admin/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminAccountController {
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository;
    private final AccountApplicationRepository applicationRepository;
    private final AuditLogRepository auditLogRepository;
    private final AdminAuthorizationService adminAuthorizationService;

    @GetMapping
    public ResponseEntity<?> list(@RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return unauthorized();
        List<Map<String, Object>> accounts = new ArrayList<>();
        userRepository.findAll().forEach(user -> {
            if ("ADMIN".equalsIgnoreCase(user.getRole())) return;
            Map<String, Object> item = base(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getAccountStatus(), user.getCreatedAt());
            item.put("phoneNumber", user.getPhoneNumber());
            item.put("address", user.getAddress());
            accounts.add(item);
        });
        sellerRepository.findAll().forEach(seller -> {
            Map<String, Object> item = base(seller.getId(), seller.getName(), seller.getEmail(), "SELLER", seller.getStatus(), seller.getJoinedAt());
            item.put("storeName", seller.getName()); item.put("address", seller.getLocation()); item.put("location", seller.getLocation());
            item.put("phoneNumber", seller.getPhoneNumber()); item.put("idNumber", seller.getIdNumber());
            item.put("businessDetails", seller.getBusinessDetails()); item.put("paymentMethod", seller.getPaymentMethod());
            item.put("verificationStatus", Boolean.TRUE.equals(seller.getVerified()) ? "APPROVED" : "PENDING");
            accounts.add(item);
        });
        driverRepository.findAll().forEach(driver -> {
            Map<String, Object> item = base(driver.getId(), driver.getName(), driver.getEmail(), "DELIVERY", driver.getStatus(), driver.getJoinedAt());
            item.put("address", driver.getAddress()); item.put("phoneNumber", driver.getPhoneNumber()); item.put("idNumber", driver.getIdNumber());
            item.put("vehicleNumber", driver.getVehicleNumber()); item.put("approvalStatus", driver.getStatus());
            accounts.add(item);
        });
        return ResponseEntity.ok(accounts);
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> analytics(@RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return unauthorized();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("customers", userRepository.findAll().stream().filter(u -> "CUSTOMER".equalsIgnoreCase(u.getRole())).count());
        result.put("sellers", sellerRepository.count());
        result.put("drivers", driverRepository.count());
        result.put("applications", applicationRepository.count());
        result.put("orders", orderRepository.count());
        result.put("completedOrders", orderRepository.findAll().stream().filter(o -> "COMPLETED".equalsIgnoreCase(o.getStatus())).count());
        result.put("cancelledOrders", orderRepository.findAll().stream().filter(o -> "CANCELLED".equalsIgnoreCase(o.getStatus())).count());
        result.put("revenue", orderRepository.findAll().stream().filter(o -> o.getTotal() != null && !"CANCELLED".equalsIgnoreCase(o.getStatus())).mapToDouble(o -> o.getTotal().doubleValue()).sum());
        result.put("auditEvents", auditLogRepository.count());
        return ResponseEntity.ok(result);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody AdminAccount input, @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return unauthorized();
        String role = normalize(input.getRole());
        if (!List.of("CUSTOMER", "SELLER", "DELIVERY").contains(role)) return bad("Choose customer, seller, or delivery.");
        if (blank(input.getName()) || blank(input.getEmail()) || !input.getEmail().contains("@")) return bad("Name and a valid email are required.");
        input.setId(null); input.setRole(role); input.setStatus("ACTIVE");
        AdminAccount saved = input;
        audit(adminEmail, "CREATE_ACCOUNT", "ADMIN_ACCOUNT", null, role + " account record created for " + input.getEmail());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{role}/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable String role, @PathVariable Long id, @RequestBody Map<String, String> body,
                                          @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return unauthorized();
        String normalizedRole = normalize(role); String status = normalize(body.get("status"));
        if (!List.of("ACTIVE", "SUSPENDED").contains(status)) return bad("Status must be ACTIVE or SUSPENDED.");
        if (normalizedRole.equals("CUSTOMER")) {
            User user = userRepository.findById(id).orElse(null); if (user == null) return ResponseEntity.notFound().build();
            user.setAccountStatus(status); userRepository.save(user); audit(adminEmail, "CHANGE_STATUS", "CUSTOMER", id, status); return ResponseEntity.ok(user);
        }
        if (normalizedRole.equals("SELLER")) {
            Seller seller = sellerRepository.findById(id).orElse(null); if (seller == null) return ResponseEntity.notFound().build();
            seller.setStatus(status); sellerRepository.save(seller); audit(adminEmail, "CHANGE_STATUS", "SELLER", id, status); return ResponseEntity.ok(seller);
        }
        if (normalizedRole.equals("DELIVERY")) {
            Driver driver = driverRepository.findById(id).orElse(null); if (driver == null) return ResponseEntity.notFound().build();
            driver.setStatus(status); driverRepository.save(driver); audit(adminEmail, "CHANGE_STATUS", "DELIVERY", id, status); return ResponseEntity.ok(driver);
        }
        return bad("Unknown account role.");
    }

    @DeleteMapping("/{role}/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable String role, @PathVariable Long id,
                                    @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return unauthorized();
        String normalizedRole = normalize(role); String email;
        if (normalizedRole.equals("CUSTOMER")) {
            User user = userRepository.findById(id).orElse(null); if (user == null) return ResponseEntity.notFound().build();
            email = user.getEmail(); userRepository.delete(user);
        } else if (normalizedRole.equals("SELLER")) {
            Seller seller = sellerRepository.findById(id).orElse(null); if (seller == null) return ResponseEntity.notFound().build();
            email = seller.getEmail(); sellerRepository.delete(seller); userRepository.findByEmailIgnoreCase(email).ifPresent(userRepository::delete);
        } else if (normalizedRole.equals("DELIVERY")) {
            Driver driver = driverRepository.findById(id).orElse(null); if (driver == null) return ResponseEntity.notFound().build();
            email = driver.getEmail(); driverRepository.delete(driver); userRepository.findByEmailIgnoreCase(email).ifPresent(userRepository::delete);
        } else return bad("Unknown account role.");
        audit(adminEmail, "DELETE_ACCOUNT", normalizedRole, id, "Deleted account " + email);
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> base(Long id, String name, String email, String role, String status, Object createdAt) {
        Map<String, Object> item = new LinkedHashMap<>(); item.put("id", id); item.put("name", name); item.put("email", email); item.put("role", role); item.put("status", status); item.put("createdAt", createdAt); return item;
    }
    private void audit(String actor, String action, String type, Long id, String details) { auditLogRepository.save(AuditLog.builder().actorEmail(actor).action(action).entityType(type).entityId(id).details(details).build()); }
    private boolean authorized(String email) { return adminAuthorizationService.isAuthorized(email); }
    private ResponseEntity<Map<String, String>> unauthorized() { return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Active admin authorization is required.")); }
    private ResponseEntity<Map<String, String>> bad(String message) { return ResponseEntity.badRequest().body(Map.of("message", message)); }
    private static String normalize(String value) { return value == null ? "" : value.trim().toUpperCase(); }
    private static boolean blank(String value) { return value == null || value.trim().isEmpty(); }
}
