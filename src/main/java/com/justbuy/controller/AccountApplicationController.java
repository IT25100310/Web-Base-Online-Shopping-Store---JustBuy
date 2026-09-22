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
@RequestMapping("/api/account-applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AccountApplicationController {
    private final AccountApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final DriverRepository driverRepository;
    private final AuditLogRepository auditLogRepository;
    private final AdminAuthorizationService adminAuthorizationService;

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) String status, @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!adminAuthorizationService.isAuthorized(adminEmail)) return forbidden();
        return ResponseEntity.ok(status == null || status.isBlank() ? applicationRepository.findAll() : applicationRepository.findByStatusIgnoreCase(status));
    }

    @PutMapping("/{id}/status")
    @Transactional
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body,
                                          @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!adminAuthorizationService.isAuthorized(adminEmail)) return forbidden();
        String status = normalize(body.get("status"));
        if (!List.of("PENDING", "APPROVED", "REJECTED", "SUSPENDED").contains(status)) return bad("Invalid application status.");
        AccountApplication application = applicationRepository.findById(id).orElse(null);
        if (application == null) return ResponseEntity.notFound().build();
        if (status.equals("APPROVED")) {
            String email = application.getEmail().trim();
            User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
            if (user == null || user.getPasswordHash() == null || user.getPasswordHash().isBlank()) return bad("Applicant must have a valid customer account and password before approval.");
            if (application.getRequestedRole().equalsIgnoreCase("SELLER")) {
                user.setRole("SELLER"); user.setPhoneNumber(application.getPhoneNumber()); user.setAddress(application.getAddress()); user.setAccountStatus("ACTIVE"); userRepository.save(user);
                Seller seller = sellerRepository.findByEmailIgnoreCase(email).orElseGet(Seller::new);
                seller.setName(application.getApplicantName()); seller.setEmail(email); seller.setPasswordHash(user.getPasswordHash()); seller.setDescription(application.getBusinessDetails()); seller.setBusinessDetails(application.getBusinessDetails()); seller.setPaymentMethod(application.getPaymentMethod()); seller.setLocation(application.getAddress()); seller.setPhoneNumber(application.getPhoneNumber()); seller.setIdNumber(application.getIdNumber()); seller.setVerified(true); seller.setStatus("ACTIVE"); seller.setBadge("Verified Seller"); sellerRepository.save(seller);
            } else {
                user.setRole("DRIVER"); user.setPhoneNumber(application.getPhoneNumber()); user.setAddress(application.getAddress()); user.setAccountStatus("ACTIVE"); userRepository.save(user);
                Driver driver = driverRepository.findByEmailIgnoreCase(email).orElseGet(Driver::new);
                driver.setName(application.getApplicantName()); driver.setEmail(email); driver.setPasswordHash(user.getPasswordHash()); driver.setAddress(application.getAddress()); driver.setIdNumber(application.getIdNumber()); driver.setPhoneNumber(application.getPhoneNumber()); driver.setVehicleNumber(application.getVehicleNumber()); driver.setStatus("APPROVED"); driver.setVerified(true); driverRepository.save(driver);
            }
        }
        application.setStatus(status); AccountApplication saved = applicationRepository.save(application);
        auditLogRepository.save(AuditLog.builder().actorEmail(adminEmail).action("CHANGE_APPLICATION_STATUS").entityType("ACCOUNT_APPLICATION").entityId(id).details(application.getRequestedRole() + " application changed to " + status).build());
        return ResponseEntity.ok(saved);
    }

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody AccountApplication input) {
        String role = normalize(input.getRequestedRole());
        if (!role.equals("SELLER") && !role.equals("DELIVERY")) return bad("Choose seller or delivery.");
        if (blank(input.getApplicantName()) || blank(input.getEmail()) || blank(input.getAddress()) || blank(input.getIdNumber()) || blank(input.getPhoneNumber())) return bad("Complete all required application fields.");
        if (!input.getEmail().contains("@") || input.getIdNumber().length() < 5) return bad("Enter a valid email and ID number.");
        if (role.equals("SELLER") && (blank(input.getPaymentMethod()) || blank(input.getBusinessDetails()))) return bad("Payment method and seller details are required.");
        if (role.equals("DELIVERY") && blank(input.getVehicleNumber())) return bad("Vehicle number is required for delivery applications.");
        if (applicationRepository.findFirstByEmailIgnoreCaseAndRequestedRoleAndStatus(input.getEmail(), role, "PENDING").isPresent()) return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", "You already have a pending application for this role."));
        input.setId(null); input.setRequestedRole(role); input.setStatus("PENDING");
        if (role.equals("SELLER")) input.setGeneratedSellerId("SEL-" + String.format("%06d", System.currentTimeMillis() % 1_000_000));
        AccountApplication saved = applicationRepository.save(input);
        auditLogRepository.save(AuditLog.builder().actorEmail(saved.getEmail()).action("CREATE_APPLICATION").entityType("ACCOUNT_APPLICATION").entityId(saved.getId()).details(role + " application submitted").build());
        return ResponseEntity.ok(saved);
    }
    private static String normalize(String value) { return value == null ? "" : value.trim().toUpperCase(); }
    private static boolean blank(String value) { return value == null || value.trim().isEmpty(); }
    private ResponseEntity<Map<String, String>> forbidden() { return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Active admin authorization is required.")); }
    private ResponseEntity<Map<String, String>> bad(String message) { return ResponseEntity.badRequest().body(Map.of("message", message)); }
}
