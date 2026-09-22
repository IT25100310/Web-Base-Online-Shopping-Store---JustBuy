package com.justbuy.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "sellers",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_sellers_email",
                        columnNames = "email"
                )
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    /*
     * This must contain the BCrypt password hash,
     * not the plain-text password.
     */
    @Column(name = "password_hash")
    private String passwordHash;

    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String logoUrl;

    private String bannerUrl;

    private Double rating;

    private Integer reviewCount;

    private Integer followerCount;

    private Integer salesCount;

    private String location;

    private String phoneNumber;
    private String idNumber;
    private String businessDetails;
    private String paymentMethod;

    @Builder.Default
    private String status = "ACTIVE";

    @Builder.Default
    private Boolean verified = false;

    private String badge;

    @Column(updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();

        if (name != null && !name.isBlank()
                && (slug == null || slug.isBlank())) {
            slug = name
                    .trim()
                    .toLowerCase()
                    .replaceAll("\\s+", "-");
        }

        if (verified == null) {
            verified = false;
        }
        if (status == null || status.isBlank()) {
            status = "ACTIVE";
        }
    }
}
