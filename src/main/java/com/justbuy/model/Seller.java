package com.justbuy.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "sellers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seller {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String email;

    private String passwordHash;

    private String slug;
    private String description;
    private String logoUrl;
    private String bannerUrl;
    private Double rating;
    private Integer reviewCount;
    private Integer followerCount;
    private Integer salesCount;
    private String location;
    private Boolean verified;
    private String badge;       // "Top Seller", "Rising Star", etc.

    @Column(updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
        if (slug == null) slug = name.toLowerCase().replace(" ", "-");
        if (verified == null) verified = false;
    }
}
