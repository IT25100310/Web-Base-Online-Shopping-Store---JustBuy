package com.justbuy.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    private String authorName;
    private String authorAvatar;
    private Integer rating;         // 1-5

    @Column(columnDefinition = "TEXT")
    private String comment;

    private String imageUrl;        // optional photo review
    private Integer helpfulCount;
    private Boolean verified;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (verified == null) verified = false;
        if (helpfulCount == null) helpfulCount = 0;
    }
}
