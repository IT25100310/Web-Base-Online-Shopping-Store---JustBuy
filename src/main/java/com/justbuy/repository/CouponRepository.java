package com.justbuy.marketing.repository;

import com.justbuy.marketing.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CouponRepository extends JpaRepository<Coupon, Long> {

    Optional<Coupon> findByCode(String code);

    List<Coupon> findByActiveTrue();

    @Query("SELECT c FROM Coupon c WHERE c.active = true AND c.expiryDate >= :today")
    List<Coupon> findValidCoupons(@Param("today") LocalDate today);

    boolean existsByCode(String code);
}
