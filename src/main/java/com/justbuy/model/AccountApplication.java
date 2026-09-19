package com.justbuy.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "account_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AccountApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String applicantName;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String requestedRole;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false)
    private String idNumber;

    @Column(nullable = false)
    private String phoneNumber;

    private String vehicleNumber;
    private String paymentMethod;
    private String businessDetails;
    private String generatedSellerId;

    @Column(nullable = false)
    private String status;

    @Column(updatable = false)
    private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() {
        submittedAt = LocalDateTime.now();
        if (status == null) status = "PENDING";
    }
}