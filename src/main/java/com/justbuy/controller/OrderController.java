package com.justbuy.controller;

import com.justbuy.model.Order;
import com.justbuy.repository.OrderRepository;
import com.justbuy.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OrderController {
    private final OrderService orderService;
    private final OrderRepository orderRepository;

    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        if (order.getPlacedByRole() == null || order.getPlacedByRole().isBlank()) order.setPlacedByRole("CUSTOMER");
        return ResponseEntity.ok(orderService.createOrder(order));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getById(@PathVariable Long id) { return orderService.getById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()); }
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<Order> getByOrderNumber(@PathVariable String orderNumber) { return orderService.getByOrderNumber(orderNumber).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build()); }
    @GetMapping
    public ResponseEntity<List<Order>> getAll() { return ResponseEntity.ok(orderService.getAll()); }

    @GetMapping("/for-role")
    public ResponseEntity<?> getForRole(@RequestParam String role, @RequestParam Long id) {
        return switch (role.trim().toUpperCase()) {
            case "CUSTOMER", "SELLER", "DRIVER", "DELIVERY" -> ResponseEntity.ok(role.trim().equalsIgnoreCase("CUSTOMER")
                    ? orderRepository.findByCustomerIdOrderByCreatedAtDesc(id)
                    : role.trim().equalsIgnoreCase("SELLER")
                    ? orderRepository.findDistinctByItemsSellerIdOrderByCreatedAtDesc(id)
                    : orderRepository.findByDriverIdOrderByCreatedAtDesc(id));
            default -> ResponseEntity.badRequest().body(Map.of("message", "Unknown order role."));
        };
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestParam String status, @RequestParam String role) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) return ResponseEntity.notFound().build();
        String next = status.trim().toUpperCase(); String actor = role.trim().toUpperCase();
        if (!allowed(actor, order, next)) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "This role cannot make that order status change."));
        if (next.equals("CANCELLED") && order.getCreatedAt() != null && order.getCreatedAt().plusDays(3).isBefore(LocalDateTime.now())) return ResponseEntity.badRequest().body(Map.of("message", "Orders can only be cancelled within 3 days."));
        return ResponseEntity.ok(orderService.updateStatus(id, next));
    }

    private boolean allowed(String role, Order order, String next) {
        if (!List.of("PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "COMPLETED", "CANCELLED").contains(next)) return false;
        if (next.equals("CANCELLED")) return !List.of("DELIVERED", "COMPLETED", "CANCELLED").contains(order.getStatus());
        if (role.equals("CUSTOMER") || role.equals("USER")) return next.equals("COMPLETED") && "DELIVERED".equals(order.getStatus());
        if (role.equals("SELLER")) return List.of("CONFIRMED", "PROCESSING", "SHIPPED").contains(next);
        if (role.equals("DRIVER") || role.equals("DELIVERY")) return List.of("IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED").contains(next);
        return false;
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleInvalidOrder(IllegalArgumentException exception) { return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage())); }
}
