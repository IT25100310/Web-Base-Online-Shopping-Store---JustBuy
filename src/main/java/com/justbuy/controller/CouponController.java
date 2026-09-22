package com.justbuy.controller;

import com.justbuy.dao.CouponDao;
import com.justbuy.model.Coupon;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/marketing/coupons")
public class CouponController {

    private final CouponDao couponDao;

    @Autowired
    public CouponController(CouponDao couponDao) {
        this.couponDao = couponDao;
    }

    // GET all coupons
    @GetMapping
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponDao.findAll());
    }

    // GET only currently valid (active, not expired) coupons
    @GetMapping("/valid")
    public ResponseEntity<List<Coupon>> getValidCoupons() {
        return ResponseEntity.ok(couponDao.findAllValid());
    }

    // GET a single coupon by id
    @GetMapping("/{id}")
    public ResponseEntity<Coupon> getCouponById(@PathVariable Long id) {
        return couponDao.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // CREATE a new coupon
    @PostMapping
    public ResponseEntity<?> createCoupon(@RequestBody Coupon coupon) {
        if (couponDao.codeExists(coupon.getCode())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("Coupon code already exists: " + coupon.getCode());
        }
        Coupon saved = couponDao.save(coupon);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // UPDATE an existing coupon
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCoupon(@PathVariable Long id, @RequestBody Coupon updated) {
        return couponDao.findById(id)
                .map(existing -> {
                    existing.setCode(updated.getCode());
                    existing.setDiscountPercentage(updated.getDiscountPercentage());
                    existing.setDiscountAmount(updated.getDiscountAmount());
                    existing.setMinPurchaseAmount(updated.getMinPurchaseAmount());
                    existing.setExpiryDate(updated.getExpiryDate());
                    existing.setActive(updated.isActive());
                    return ResponseEntity.ok(couponDao.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE a coupon
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        if (couponDao.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        couponDao.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // APPLY a coupon code to an order amount at checkout
    // Body example: { "code": "SAVE10", "orderAmount": 2500.00 }
    @PostMapping("/apply")
    public ResponseEntity<Map<String, Object>> applyCoupon(@RequestBody Map<String, Object> request) {
        String code = (String) request.get("code");
        BigDecimal orderAmount = new BigDecimal(request.get("orderAmount").toString());

        BigDecimal finalAmount = couponDao.applyCoupon(code, orderAmount);

        return ResponseEntity.ok(Map.of(
                "code", code,
                "originalAmount", orderAmount,
                "finalAmount", finalAmount,
                "discountApplied", orderAmount.subtract(finalAmount)
        ));
    }
}
