package com.justbuy.controller;

import com.justbuy.model.AccountApplication;
import com.justbuy.repository.AccountApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/account-applications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AccountApplicationController {
    private final AccountApplicationRepository repository;

    @GetMapping
    public ResponseEntity<List<AccountApplication>> list(@RequestParam(required = false) String status) {
        if (status == null || status.isBlank()) return ResponseEntity.ok(repository.findAll());
        return ResponseEntity.ok(repository.findByStatusIgnoreCase(status.trim()));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = normalize(body.get("status"));
        if (!List.of("PENDING", "APPROVED", "REJECTED").contains(status)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Status must be pending, approved, or rejected."));
        }
        return repository.findById(id)
                .map(application -> {
                    application.setStatus(status);
                    return ResponseEntity.ok(repository.save(application));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody AccountApplication input) {
        String role = normalize(input.getRequestedRole());
        if (!role.equals("SELLER") && !role.equals("DELIVERY")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Choose seller or delivery."));
        }
        if (blank(input.getApplicantName()) || blank(input.getEmail()) || blank(input.getAddress())
                || blank(input.getIdNumber()) || blank(input.getPhoneNumber())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Complete all required application fields."));
        }
        if (!input.getEmail().contains("@") || input.getIdNumber().length() < 5) {
            return ResponseEntity.badRequest().body(Map.of("message", "Enter a valid email and ID number."));
        }
        if (role.equals("SELLER") && (blank(input.getPaymentMethod()) || blank(input.getBusinessDetails()))) {
            return ResponseEntity.badRequest().body(Map.of("message", "Payment method and seller details are required."));
        }
        if (role.equals("DELIVERY") && blank(input.getVehicleNumber())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Vehicle number is required for delivery applications."));
        }
        if (repository.findFirstByEmailIgnoreCaseAndRequestedRoleAndStatus(input.getEmail(), role, "PENDING").isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "You already have a pending application for this role."));
        }

        input.setId(null);
        input.setRequestedRole(role);
        input.setStatus("PENDING");
        if (role.equals("SELLER")) input.setGeneratedSellerId("SEL-" + String.format("%06d", (System.currentTimeMillis() % 1_000_000)));
        return ResponseEntity.ok(repository.save(input));
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase();
    }

    private static boolean blank(String value) {
        return value == null || value.trim().isEmpty();
    }
}