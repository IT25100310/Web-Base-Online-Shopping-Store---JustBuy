package com.justbuy.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_users_email", columnNames = "email")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(nullable = false)
    @Builder.Default
    private String role = "CUSTOMER";

    private String phoneNumber;
    private String address;

    @Column(nullable = false)
    @Builder.Default
    private String accountStatus = "ACTIVE";

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();

        if (role == null || role.isBlank()) {
            role = "CUSTOMER";
        }
        if (accountStatus == null || accountStatus.isBlank()) {
            accountStatus = "ACTIVE";
        }
    }
}
