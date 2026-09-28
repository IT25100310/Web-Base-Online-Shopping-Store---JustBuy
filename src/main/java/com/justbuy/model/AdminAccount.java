package com.justbuy.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_accounts")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String status;

    @Lob
    @Column(name = "profile_image_data", columnDefinition = "LONGBLOB")
    private byte[] profileImageData;

    @Column(name = "profile_image_content_type", length = 100)
    private String profileImageContentType;

    @JsonIgnore
    private String passwordHash;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = "ACTIVE";
    }
}
