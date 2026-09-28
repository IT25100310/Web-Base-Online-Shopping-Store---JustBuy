package com.justbuy.service;

import com.justbuy.model.Driver;
import com.justbuy.model.Order;
import com.justbuy.repository.DriverRepository;
import com.justbuy.repository.OrderRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DriverAssignmentService {
    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository;

    public void assignIfPossible(Order order) {
        List<Driver> onlineDrivers = driverRepository.findByAvailableTrueAndStatusIgnoreCaseAndVerifiedTrue("APPROVED");
        onlineDrivers.stream()
                .min(Comparator.comparingLong((Driver driver) -> activeDeliveries(driver.getId()))
                        .thenComparing(Driver::getId))
                .ifPresent(driver -> {
                    order.setDriverId(driver.getId());
                    if (order.getStatus() == null || order.getStatus().isBlank() || "CONFIRMED".equalsIgnoreCase(order.getStatus())) order.setStatus("SHIPPED");
                    if (order.getId() != null) orderRepository.save(order);
                });
    }

    @Transactional
    public void assignWaitingOrders() {
        orderRepository.findByDriverIdIsNullAndStatusInOrderByCreatedAtAsc(List.of("PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"))
                .forEach(this::assignIfPossible);
        orderRepository.flush();
    }

    private long activeDeliveries(Long driverId) {
        return orderRepository.findByDriverIdOrderByCreatedAtDesc(driverId).stream()
                .filter(order -> order.getStatus() != null)
                .filter(order -> !List.of("DELIVERED", "COMPLETED", "FAILED", "CUSTOMER_UNAVAILABLE", "CANCELLED").contains(order.getStatus().toUpperCase()))
                .count();
    }
}
