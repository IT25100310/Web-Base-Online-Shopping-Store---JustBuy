package com.justbuy.controller;

import com.justbuy.model.Delivery;
import com.justbuy.repository.DeliveryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DeliveryController {

    private final DeliveryRepository deliveryRepository;

    @GetMapping
    public ResponseEntity<List<Delivery>> getDeliveries(@RequestParam Long sellerId) {
        return ResponseEntity.ok(deliveryRepository.findBySellerIdOrderByCreatedAtDesc(sellerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Delivery> getDelivery(@PathVariable Long id) {
        return deliveryRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Delivery> createDelivery(@RequestBody Delivery delivery) {
        delivery.setId(null);
        return ResponseEntity.ok(deliveryRepository.save(delivery));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Delivery> updateDelivery(@PathVariable Long id, @RequestBody Delivery input) {
        return deliveryRepository.findById(id).map(existing -> {
            existing.setSellerId(input.getSellerId());
            existing.setOrderId(input.getOrderId());
            existing.setOrderNumber(input.getOrderNumber());
            existing.setTrackingNumber(input.getTrackingNumber());
            existing.setCarrier(input.getCarrier());
            existing.setStatus(input.getStatus());
            existing.setRecipientName(input.getRecipientName());
            existing.setDeliveryAddress(input.getDeliveryAddress());
            existing.setEstimatedDelivery(input.getEstimatedDelivery());
            existing.setShippedAt(input.getShippedAt());
            existing.setDeliveredAt(input.getDeliveredAt());
            return ResponseEntity.ok(deliveryRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDelivery(@PathVariable Long id) {
        if (!deliveryRepository.existsById(id)) return ResponseEntity.notFound().build();
        deliveryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
