package com.justbuy.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_notifications", indexes = @Index(name = "idx_support_notification_recipient", columnList = "recipient_role,recipient_id,read_at"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportNotification {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String recipientRole;
    private Long recipientId;
    @Column(nullable = false) private String type;
    @Column(nullable = false) private String title;
    @Column(nullable = false) private String message;
    private LocalDateTime readAt;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;
    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }
}
