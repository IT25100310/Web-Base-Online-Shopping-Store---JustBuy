package com.justbuy.service;

import com.justbuy.model.Order;
import com.justbuy.model.OrderItem;
import com.justbuy.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepo;

    public Order createOrder(Order order) {
        // Calculate totals
        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                item.setOrder(order);
                item.setSubtotal(item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }
        }
        order.setEstimatedDelivery(LocalDateTime.now().plusDays(7));
        order.setTrackingNumber("TRK" + System.currentTimeMillis());
        return orderRepo.save(order);
    }

    public Optional<Order> getById(Long id) {
        return orderRepo.findById(id);
    }

    public Optional<Order> getByOrderNumber(String orderNumber) {
        return orderRepo.findByOrderNumber(orderNumber);
    }

    public List<Order> getAll() {
        return orderRepo.findAll();
    }
}
