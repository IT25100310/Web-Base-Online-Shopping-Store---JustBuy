package com.justbuy.controller;

import com.justbuy.model.Seller;
import com.justbuy.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/seller-auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SellerAuthController {

    private final SellerRepository sellerRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.getOrDefault("email", "").trim();
        String password = credentials.getOrDefault("password", "");
        return sellerRepository.findByEmailIgnoreCase(email)
            .filter(seller -> passwordEncoder.matches(password, seller.getPasswordHash()))
            .<ResponseEntity<?>>map(seller -> ResponseEntity.ok(Map.of("seller", seller)))
            .orElseGet(() -> ResponseEntity.status(401).body(Map.of("message", "Invalid seller email or password")));
    }
}
