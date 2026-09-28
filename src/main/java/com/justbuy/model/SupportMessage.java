package com.justbuy.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_messages", indexes = @Index(name = "idx_support_message_ticket", columnList = "ticket_id,created_at"))
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportMessage {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "ticket_id", nullable = false) private Long ticketId;
    @Column(nullable = false) private String senderType;
    private Long senderId;
    @Column(nullable = false) private String senderName;
    @Lob private String body;
    @Column(nullable = false) @Builder.Default private Boolean internalNote = false;
    private String attachmentName;
    private String attachmentContentType;
    @JsonIgnore @Lob @Column(columnDefinition = "LONGBLOB") private byte[] attachmentData;
    @Column(nullable = false, updatable = false) private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() { if (internalNote == null) internalNote = false; createdAt = LocalDateTime.now(); }
}
