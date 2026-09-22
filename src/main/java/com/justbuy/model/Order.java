package com.justbuy.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderNumber;
    private String customerName;
    private String customerEmail;
    private String shippingAddress;
    private String paymentMethod;
    private Long customerId;
    private String placedByRole;
    private Long driverId;

    @Column(precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 10, scale = 2)
    private BigDecimal shippingCost;

    @Column(precision = 10, scale = 2)
    private BigDecimal total;

    private String status;      // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
    private String trackingNumber;
    private String promoCode;

    @Column(precision = 10, scale = 2)
    private BigDecimal discount;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "order")
    @JsonManagedReference
    private List<OrderItem> items = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime estimatedDelivery;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (orderNumber == null) {
            orderNumber = "JB" + System.currentTimeMillis();
        }
        if (status == null) status = "CONFIRMED";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
