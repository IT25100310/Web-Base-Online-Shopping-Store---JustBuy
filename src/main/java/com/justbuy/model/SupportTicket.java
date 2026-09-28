package com.justbuy.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "support_tickets", indexes = {
        @Index(name = "idx_support_ticket_status", columnList = "status"),
        @Index(name = "idx_support_ticket_customer", columnList = "customer_id"),
        @Index(name = "idx_support_ticket_agent", columnList = "assigned_agent_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportTicket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ticket_number", nullable = false, unique = true, length = 40)
    private String ticketNumber;
    private Long customerId;
    @Column(nullable = false) private String customerName;
    @Column(nullable = false) private String customerEmail;
    private String customerPhone;
    @Column(nullable = false) private String subject;
    @Lob private String description;
    @Column(nullable = false) @Builder.Default private String category = "OTHER";
    private Long relatedOrderId;
    @Column(nullable = false) @Builder.Default private String priority = "MEDIUM";
    @Column(nullable = false) @Builder.Default private String status = "NEW";
    private Long assignedAgentId;
    private String assignedAgentName;
    @Builder.Default private String channel = "IN_APP";
    private LocalDateTime firstResponseAt;
    private LocalDateTime resolvedAt;
    private Integer satisfactionScore;
    private String satisfactionComment;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(nullable = false) private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (ticketNumber == null || ticketNumber.isBlank()) ticketNumber = "JB-TKT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        if (category == null || category.isBlank()) category = "OTHER";
        if (priority == null || priority.isBlank()) priority = "MEDIUM";
        if (status == null || status.isBlank()) status = "NEW";
        if (channel == null || channel.isBlank()) channel = "IN_APP";
        createdAt = LocalDateTime.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
