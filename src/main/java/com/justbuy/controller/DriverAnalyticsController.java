package com.justbuy.controller;

import com.justbuy.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/driver")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DriverAnalyticsController {
    private final OrderRepository orderRepository;

    @GetMapping("/{driverId}/analytics")
    public ResponseEntity<Map<String, Object>> analytics(@PathVariable Long driverId) {
        var orders = orderRepository.findByDriverIdOrderByCreatedAtDesc(driverId);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalOrders", orders.size());
        result.put("pendingOrders", count(orders, "PENDING"));
        result.put("inTransit", count(orders, "IN_TRANSIT") + count(orders, "OUT_FOR_DELIVERY"));
        result.put("deliveredOrders", count(orders, "DELIVERED") + count(orders, "COMPLETED"));
        result.put("cancelledOrders", count(orders, "CANCELLED"));
        result.put("earnings", orders.stream().filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus()) && o.getTotal() != null).mapToDouble(o -> o.getTotal().doubleValue() * 0.05).sum());
        result.put("orders", orders);
        return ResponseEntity.ok(result);
    }

    private long count(List<com.justbuy.model.Order> orders, String status) {
        return orders.stream().filter(o -> status.equalsIgnoreCase(o.getStatus())).count();
    }
}
