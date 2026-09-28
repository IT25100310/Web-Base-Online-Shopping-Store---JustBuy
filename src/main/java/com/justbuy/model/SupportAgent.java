package com.justbuy.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_agents", uniqueConstraints = @UniqueConstraint(name = "uk_support_agents_email", columnNames = "email"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportAgent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @JsonIgnore
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    private String phoneNumber;
    private String address;

    @Lob
    @Column(name = "profile_image_data", columnDefinition = "LONGBLOB")
    private byte[] profileImageData;

    @Column(name = "profile_image_content_type", length = 100)
    private String profileImageContentType;
    private String department;
    private String availability;

    @Column(nullable = false)
    @Builder.Default
    private String status = "ACTIVE";

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null || status.isBlank()) status = "ACTIVE";
        if (availability == null || availability.isBlank()) availability = "AVAILABLE";
    }
}
