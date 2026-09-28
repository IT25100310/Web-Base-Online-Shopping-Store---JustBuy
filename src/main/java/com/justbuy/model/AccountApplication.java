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
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(nullable = false) private String applicantName;
    @Column(nullable = false) private String email;
    @Column(nullable = false) private String requestedRole;
    @Column(nullable = false) private String address;
    @Column(nullable = false) private String idNumber;
    @Column(nullable = false) private String phoneNumber;

    private String dateOfBirth;
    private String houseNumber;
    private String street;
    private String city;
    private String province;
    private String postalCode;
    private String profilePictureUrl;

    private String vehicleNumber;
    private String vehicleType;
    private String vehicleModel;
    private String vehicleColor;
    private String vehicleRegistrationStatus;
    private String driverId;
    private String licenseNumber;
    private String licenseType;
    private String licenseExpiryDate;

    private String storeName;
    private String businessCategory;
    private String businessAddress;
    private String businessPhone;
    private String businessEmail;
    private String businessLogoUrl;
    private String businessRegistrationNumber;
    private String productCategories;
    private String productsToSell;
    private String returnPolicy;
    private String shippingOptions;
    private String processingTime;
    private String verificationDocuments;

    private String bankName;
    private String accountHolderName;
    private String accountNumber;
    private String branch;
    private String preferredPaymentMethod;

    private String paymentMethod;
    private String businessDetails;
    private String generatedSellerId;
    @Column(nullable = false) private String status;
    @Column(updatable = false) private LocalDateTime submittedAt;

    @PrePersist
    protected void onCreate() { submittedAt = LocalDateTime.now(); if (status == null) status = "PENDING"; }
}
