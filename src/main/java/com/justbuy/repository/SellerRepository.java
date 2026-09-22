package com.justbuy.repository;

import com.justbuy.model.Seller;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SellerRepository extends JpaRepository<Seller, Long> {

    List<Seller> findByVerifiedTrue();

    Optional<Seller> findBySlug(String slug);

    Optional<Seller> findByEmailIgnoreCase(String email);
}
