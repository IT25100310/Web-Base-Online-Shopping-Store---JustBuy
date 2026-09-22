package com.justbuy.controller;

import com.justbuy.model.Review;
import com.justbuy.model.Product;
import com.justbuy.repository.ReviewRepository;
import com.justbuy.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewRepository reviewRepo;
    private final ProductRepository productRepo;

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<Review>> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewRepo.findByProductIdOrderByCreatedAtDesc(productId));
    }

    @PostMapping
    public ResponseEntity<Review> createReview(@RequestBody Review review) {
        return ResponseEntity.ok(reviewRepo.save(review));
    }
}
