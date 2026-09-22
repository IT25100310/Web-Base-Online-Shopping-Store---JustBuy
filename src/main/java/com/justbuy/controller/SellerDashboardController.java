package com.justbuy.controller;

import com.justbuy.service.SellerDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sellers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SellerDashboardController {
    private final SellerDashboardService sellerDashboardService;

    @GetMapping("/{sellerId}/dashboard")
    public ResponseEntity<?> dashboard(@PathVariable Long sellerId) {
        try {
            return ResponseEntity.ok(sellerDashboardService.getDashboard(sellerId));
        } catch (IllegalArgumentException exception) {
            return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
        }
    }
}
