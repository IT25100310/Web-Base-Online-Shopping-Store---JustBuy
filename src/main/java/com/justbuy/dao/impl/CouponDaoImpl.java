package com.justbuy.marketing.dao.impl;

import com.justbuy.marketing.dao.CouponDao;
import com.justbuy.marketing.model.Coupon;
import com.justbuy.marketing.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public class CouponDaoImpl implements CouponDao {

    private final CouponRepository couponRepository;

    @Autowired
    public CouponDaoImpl(CouponRepository couponRepository) {
        this.couponRepository = couponRepository;
    }

    @Override
    public Coupon save(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    @Override
    public Optional<Coupon> findById(Long id) {
        return couponRepository.findById(id);
    }

    @Override
    public Optional<Coupon> findByCode(String code) {
        return couponRepository.findByCode(code);
    }

    @Override
    public List<Coupon> findAll() {
        return couponRepository.findAll();
    }

    @Override
    public List<Coupon> findAllValid() {
        return couponRepository.findValidCoupons(LocalDate.now());
    }

    @Override
    public void deleteById(Long id) {
        couponRepository.deleteById(id);
    }

    @Override
    public boolean codeExists(String code) {
        return couponRepository.existsByCode(code);
    }

    @Override
    public BigDecimal applyCoupon(String code, BigDecimal orderAmount) {
        Optional<Coupon> couponOpt = couponRepository.findByCode(code);

        if (couponOpt.isEmpty()) {
            return orderAmount;
        }

        Coupon coupon = couponOpt.get();

        if (!coupon.isActive() || coupon.isExpired()) {
            return orderAmount;
        }

        if (coupon.getMinPurchaseAmount() != null
                && orderAmount.compareTo(coupon.getMinPurchaseAmount()) < 0) {
            return orderAmount;
        }

        BigDecimal discountedAmount = orderAmount;

        if (coupon.getDiscountPercentage() != null) {
            BigDecimal percentageOff = orderAmount
                    .multiply(BigDecimal.valueOf(coupon.getDiscountPercentage()))
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            discountedAmount = orderAmount.subtract(percentageOff);
        } else if (coupon.getDiscountAmount() != null) {
            discountedAmount = orderAmount.subtract(coupon.getDiscountAmount());
        }

        // Never let the discount push the total below zero
        return discountedAmount.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : discountedAmount;
    }
}
