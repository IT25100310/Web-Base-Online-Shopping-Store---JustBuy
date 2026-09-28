package com.justbuy.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_conversations", indexes = {
        @Index(name = "idx_chat_customer", columnList = "customer_id"),
        @Index(name = "idx_chat_seller", columnList = "seller_id")
})
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ChatConversation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "customer_id", nullable = false) private Long customerId;
    @Column(name = "customer_name", nullable = false) private String customerName;
    @Column(name = "seller_id", nullable = false) private Long sellerId;
    @Column(name = "seller_name", nullable = false) private String sellerName;
    @Column(updatable = false) private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
