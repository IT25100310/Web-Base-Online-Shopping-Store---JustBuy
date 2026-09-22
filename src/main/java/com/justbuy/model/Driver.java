package com.justbuy.model;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "drivers",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_drivers_email",
                columnNames = "email"
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Driver {

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

    @Column(nullable = false)
    private String address;

    @Column(name = "id_number", nullable = false)
    private String idNumber;

    @Column(name = "phone_number", nullable = false)
    private String phoneNumber;

    @Column(name = "vehicle_number", nullable = false)
    private String vehicleNumber;

    @Column(nullable = false)
    @Builder.Default
    private String status = "APPROVED";

    @Column(nullable = false)
    @Builder.Default
    private Boolean verified = true;

    @Column(updatable = false)
    private LocalDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        if (joinedAt == null) {
            joinedAt = LocalDateTime.now();
        }
        if (status == null || status.isBlank()) {
            status = "APPROVED";
        }
        if (verified == null) {
            verified = true;
        }
    }
}
