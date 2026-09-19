package com.justbuy.service;

import com.justbuy.model.Order;
import com.justbuy.model.OrderItem;
import com.justbuy.model.Product;
import com.justbuy.repository.OrderRepository;
import com.justbuy.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepo;
    private final ProductRepository productRepo;

    @Transactional
    public Order createOrder(Order order) {
        if (order == null || order.getItems() == null || order.getItems().isEmpty()) {
            throw new IllegalArgumentException("An order must contain at least one item.");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItem item : order.getItems()) {
            if (item.getProductId() == null || item.getQuantity() == null || item.getQuantity() < 1) {
                throw new IllegalArgumentException("Each order item needs a valid product and quantity.");
            }

            Product product = productRepo.findByIdForUpdate(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + item.getProductId()));
            if (product.getStock() == null || product.getStock() < item.getQuantity()) {
                throw new IllegalArgumentException("Insufficient stock for product: " + product.getName());
            }

            BigDecimal price = Objects.requireNonNull(product.getPrice(), "Product price is required");
            BigDecimal itemSubtotal = price.multiply(BigDecimal.valueOf(item.getQuantity()));
            item.setOrder(order);
            item.setProductName(product.getName());
            item.setProductImage(product.getThumbnailUrl());
            item.setPrice(price);
            item.setSubtotal(itemSubtotal);
            product.setStock(product.getStock() - item.getQuantity());
            product.setSoldCount((product.getSoldCount() == null ? 0 : product.getSoldCount()) + item.getQuantity());
            subtotal = subtotal.add(itemSubtotal);
        }

        BigDecimal shippingCost = subtotal.compareTo(new BigDecimal("100.00")) >= 0
                ? BigDecimal.ZERO : new BigDecimal("9.99");
        order.setSubtotal(subtotal);
        order.setShippingCost(shippingCost);
        order.setDiscount(BigDecimal.ZERO);
        order.setTotal(subtotal.add(shippingCost));
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
