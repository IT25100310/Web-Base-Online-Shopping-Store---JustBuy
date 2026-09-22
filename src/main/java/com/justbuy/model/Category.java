package com.justbuy.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String slug;
    private String description;
    private String icon;        // emoji or icon name
    private String imageUrl;
    private String color;       // hex accent color for category card
    private Integer productCount;
    private Boolean featured;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (slug == null) slug = name.toLowerCase().replace(" ", "-");
    }
}
