package com.justbuy.repository;

import com.justbuy.model.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
    List<Delivery> findBySellerIdOrderByCreatedAtDesc(Long sellerId);
}
