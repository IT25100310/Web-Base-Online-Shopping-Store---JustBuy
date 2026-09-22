package com.justbuy.controller;

import com.justbuy.repository.DriverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/driver-auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DriverAuthController {

    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.getOrDefault("email", "").trim();
        String password = credentials.getOrDefault("password", "");

        return driverRepository.findByEmailIgnoreCase(email)
                .filter(driver -> "APPROVED".equalsIgnoreCase(driver.getStatus()))
                .filter(driver -> driver.getPasswordHash() != null
                        && passwordEncoder.matches(password, driver.getPasswordHash()))
                .<ResponseEntity<?>>map(driver -> ResponseEntity.ok(Map.of("driver", driver)))
                .orElseGet(() -> ResponseEntity.status(401).body(
                        Map.of("message", "Invalid driver email or password, or driver is not approved.")));
    }
}
