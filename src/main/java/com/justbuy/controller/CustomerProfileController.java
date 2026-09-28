package com.justbuy.controller;

import com.justbuy.model.User;
import com.justbuy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/customer-profile")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CustomerProfileController {
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> get(@RequestParam Long id) {
        return userRepository.findById(id).map(this::safe).map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PatchMapping
    public ResponseEntity<?> update(@RequestParam Long id, @RequestBody ProfileUpdate update) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) return ResponseEntity.notFound().build();
        if (update.fullName() == null || update.fullName().trim().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Full name is required."));
        }
        user.setFullName(update.fullName().trim());
        user.setPhoneNumber(clean(update.phoneNumber()));
        user.setAddress(clean(update.address()));
        return ResponseEntity.ok(safe(userRepository.save(user)));
    }

    private Map<String, Object> safe(User user) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", user.getId());
        result.put("fullName", user.getFullName());
        result.put("email", user.getEmail());
        result.put("phoneNumber", user.getPhoneNumber());
        result.put("address", user.getAddress());
        result.put("accountStatus", user.getAccountStatus());
        return result;
    }

    private String clean(String value) { return value == null || value.trim().isBlank() ? null : value.trim(); }

    public record ProfileUpdate(String fullName, String phoneNumber, String address) {}
}
