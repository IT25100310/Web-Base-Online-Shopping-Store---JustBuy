package com.justbuy.controller;

import com.justbuy.model.Driver;
import com.justbuy.model.Order;
import com.justbuy.repository.DriverRepository;
import com.justbuy.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DriverDashboardController {
    private static final long MAX_PROOF_BYTES = 5L * 1024 * 1024;
    private static final List<String> DRIVER_STATUSES = List.of("IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED", "CUSTOMER_UNAVAILABLE");

    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository;
    private final com.justbuy.service.DriverAssignmentService driverAssignmentService;

    @GetMapping("/{driverId}/dashboard")
    @Transactional
    public ResponseEntity<?> dashboard(@PathVariable Long driverId) {
        Driver driver = driverRepository.findById(driverId).orElse(null);
        if (driver == null) return notFound("Driver not found.");
        if (Boolean.TRUE.equals(driver.getAvailable())) driverAssignmentService.assignWaitingOrders();
        List<Order> orders = orderRepository.findByDriverIdOrderByCreatedAtDesc(driverId);
        return ResponseEntity.ok(Map.of("driver", driverSummary(driver), "orders", orders, "earnings", earnings(orders), "online", Boolean.TRUE.equals(driver.getAvailable())));
    }

    @PatchMapping("/{driverId}/availability")
    public ResponseEntity<?> availability(@PathVariable Long driverId, @RequestBody Map<String, Boolean> body) {
        Driver driver = driverRepository.findById(driverId).orElse(null);
        if (driver == null) return notFound("Driver not found.");
        boolean online = Boolean.TRUE.equals(body.get("online"));
        driver.setAvailable(online);
        driverRepository.save(driver);
        if (online) driverAssignmentService.assignWaitingOrders();
        return ResponseEntity.ok(Map.of("online", online, "message", online ? "You are online for new deliveries." : "You are offline and will not receive new deliveries."));
    }

    @PatchMapping(value = "/{driverId}/orders/{orderId}/status", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Transactional
    public ResponseEntity<?> updateStatus(@PathVariable Long driverId, @PathVariable Long orderId,
                                          @RequestParam String status,
                                          @RequestParam(required = false) String note,
                                          @RequestPart(value = "proof", required = false) MultipartFile proof) throws IOException {
        Driver driver = driverRepository.findById(driverId).orElse(null);
        Order order = orderRepository.findById(orderId).orElse(null);
        if (driver == null || order == null) return notFound("Driver or order not found.");
        if (!driverId.equals(order.getDriverId())) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "This order is not assigned to you."));
        String next = status == null ? "" : status.trim().toUpperCase();
        if (!DRIVER_STATUSES.contains(next)) return ResponseEntity.badRequest().body(Map.of("message", "Invalid driver delivery status."));
        if (!transitionAllowed(order.getStatus(), next)) return ResponseEntity.badRequest().body(Map.of("message", "That status change is not allowed from the current order status."));
        if (proof != null && !proof.isEmpty()) {
            if (proof.getSize() > MAX_PROOF_BYTES) return ResponseEntity.badRequest().body(Map.of("message", "Delivery proof must be 5 MB or smaller."));
            if (proof.getContentType() == null || !proof.getContentType().toLowerCase().startsWith("image/")) return ResponseEntity.badRequest().body(Map.of("message", "Delivery proof must be an image."));
            order.setDeliveryProofData(proof.getBytes());
            order.setDeliveryProofContentType(proof.getContentType());
        }
        if (note != null && !note.isBlank()) order.setDeliveryNote(note.trim());
        order.setDriverStatus(next);
        order.setStatus(next);
        if ("DELIVERED".equals(next)) order.setDeliveredAt(LocalDateTime.now());
        if ("FAILED".equals(next) || "CUSTOMER_UNAVAILABLE".equals(next)) order.setDeliveryIssue(note == null ? next : note.trim());
        Order saved = orderRepository.save(order);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{driverId}/orders/{orderId}/proof")
    public ResponseEntity<byte[]> proof(@PathVariable Long driverId, @PathVariable Long orderId) {
        Order order = orderRepository.findById(orderId).orElse(null);
        if (order == null || !driverId.equals(order.getDriverId()) || order.getDeliveryProofData() == null) return ResponseEntity.notFound().build();
        MediaType type;
        try { type = MediaType.parseMediaType(order.getDeliveryProofContentType()); }
        catch (Exception ignored) { type = MediaType.APPLICATION_OCTET_STREAM; }
        return ResponseEntity.ok().contentType(type).body(order.getDeliveryProofData());
    }

    private boolean transitionAllowed(String current, String next) {
        String state = current == null ? "CONFIRMED" : current.toUpperCase();
        if ("DELIVERED".equals(state) || "FAILED".equals(state) || "CUSTOMER_UNAVAILABLE".equals(state)) return false;
        return switch (next) {
            case "IN_TRANSIT" -> List.of("PENDING", "CONFIRMED", "PROCESSING", "SHIPPED").contains(state);
            case "OUT_FOR_DELIVERY" -> List.of("IN_TRANSIT", "OUT_FOR_DELIVERY").contains(state);
            case "DELIVERED", "FAILED", "CUSTOMER_UNAVAILABLE" -> List.of("IN_TRANSIT", "OUT_FOR_DELIVERY", "SHIPPED").contains(state);
            default -> false;
        };
    }

    private double earnings(List<Order> orders) { return orders.stream().filter(o -> "DELIVERED".equalsIgnoreCase(o.getStatus()) && o.getTotal() != null).mapToDouble(o -> o.getTotal().doubleValue() * 0.03).sum(); }
    private Map<String, Object> driverSummary(Driver driver) {
        Map<String, Object> result = new java.util.LinkedHashMap<>();
        result.put("id", driver.getId()); result.put("name", driver.getName()); result.put("email", driver.getEmail());
        result.put("phoneNumber", driver.getPhoneNumber()); result.put("address", driver.getAddress());
        result.put("vehicleNumber", driver.getVehicleNumber()); result.put("available", Boolean.TRUE.equals(driver.getAvailable()));
        return result;
    }
    private ResponseEntity<Map<String, String>> notFound(String message) { return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", message)); }
}
