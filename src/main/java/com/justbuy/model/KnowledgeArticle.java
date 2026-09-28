package com.justbuy.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "support_knowledge_articles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeArticle {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String title;
    @Column(nullable = false) private String category;
    @Lob @Column(nullable = false) private String content;
    @Column(nullable = false) @Builder.Default private Boolean published = true;
    @Column(nullable = false) private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() { if (published == null) published = true; updatedAt = LocalDateTime.now(); }
    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
