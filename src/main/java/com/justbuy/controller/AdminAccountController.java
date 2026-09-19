package com.justbuy.controller;

import com.justbuy.model.AdminAccount;
import com.justbuy.repository.AdminAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/accounts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AdminAccountController {
    private final AdminAccountRepository repository;

    @GetMapping
    public List<AdminAccount> list() {
        return repository.findAll();
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody AdminAccount input) {
        String role = normalize(input.getRole());
        if (!List.of("CUSTOMER", "SELLER", "DELIVERY").contains(role)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Choose customer, seller, or delivery."));
        }
        if (blank(input.getName()) || blank(input.getEmail()) || !input.getEmail().contains("@")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Name and a valid email are required."));
        }
        if (repository.findByEmailIgnoreCase(input.getEmail()).isPresent()) {
            return ResponseEntity.status(409).body(Map.of("message", "An account with this email already exists."));
        }
        input.setId(null);
        input.setRole(role);
        input.setStatus("ACTIVE");
        return ResponseEntity.ok(repository.save(input));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) return ResponseEntity.notFound().build();
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase();
    }

    private static boolean blank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
