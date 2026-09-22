package com.justbuy.dao;

import com.justbuy.model.Coupon;

import java.util.List;
import java.util.Optional;

public interface CouponDao {

    Coupon save(Coupon coupon);

    Optional<Coupon> findById(Long id);

    Optional<Coupon> findByCode(String code);

    List<Coupon> findAll();

    List<Coupon> findAllValid();

    void deleteById(Long id);

    boolean codeExists(String code);

    /**
     * Applies a coupon to a given order amount and returns the discounted total.
     * Returns the original amount unchanged if the coupon is invalid, expired,
     * inactive, or the minimum purchase amount is not met.
     */
    java.math.BigDecimal applyCoupon(String code, java.math.BigDecimal orderAmount);
}
