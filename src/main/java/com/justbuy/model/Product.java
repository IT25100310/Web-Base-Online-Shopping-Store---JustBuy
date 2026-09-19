package com.justbuy.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    private Long version;

    @Column(nullable = false)
    private String name;

    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(precision = 10, scale = 2)
    private BigDecimal originalPrice;   // for strike-through discount

    private Integer discountPercent;
    private Integer stock;

    // Images stored as comma-separated URLs (simplified for H2)
    @Column(columnDefinition = "TEXT")
    private String imageUrls;           // comma-separated

    private String thumbnailUrl;
    private String colors;              // JSON-like "Red,Blue,Green"
    private String sizes;               // "XS,S,M,L,XL"
    private Double rating;
    private Integer reviewCount;
    private Integer soldCount;
    private Boolean featured;
    private Boolean flashDeal;
    private Boolean freeShipping;
    private String badge;               // "New", "Best Seller", "Hot", etc.
    private String tags;                // comma-separated

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id")
    private Seller seller;

    @Column(updatable = false)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (slug == null) slug = name.toLowerCase().replace(" ", "-").replaceAll("[^a-z0-9-]", "");
        if (featured == null) featured = false;
        if (flashDeal == null) flashDeal = false;
        if (freeShipping == null) freeShipping = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper to get image list
    public List<String> getImageList() {
        if (imageUrls == null || imageUrls.isEmpty()) return new ArrayList<>();
        return List.of(imageUrls.split(","));
    }
}
