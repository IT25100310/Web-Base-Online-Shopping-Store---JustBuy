package com.justbuy.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_requests", indexes = {
        @Index(name = "idx_support_request_status", columnList = "status"),
        @Index(name = "idx_support_request_order", columnList = "order_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportRequest {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String requestType;
    @Column(nullable = false) @Builder.Default private String status = "REQUESTED";
    private Long ticketId;
    private Long orderId;
    private Long customerId;
    @Column(nullable = false) private String customerName;
    @Column(nullable = false) private String customerEmail;
    @Column(nullable = false) private String reason;
    @Lob private String resolutionNote;
    private Long handledByAgentId;
    private String handledByAgentName;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { if (status == null || status.isBlank()) status = "REQUESTED"; createdAt = LocalDateTime.now(); updatedAt = createdAt; }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
