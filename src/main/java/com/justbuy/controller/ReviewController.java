package com.justbuy.controller;

import com.justbuy.model.Review;
import com.justbuy.model.Product;
import com.justbuy.repository.ReviewRepository;
import com.justbuy.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

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
    public ResponseEntity<?> createReview(@RequestBody Review review) {
        if (review == null || review.getProduct() == null || review.getProduct().getId() == null) return ResponseEntity.badRequest().body(Map.of("message", "A product is required."));
        if (review.getRating() == null || review.getRating() < 1 || review.getRating() > 5) return ResponseEntity.badRequest().body(Map.of("message", "Rating must be between 1 and 5."));
        if (review.getComment() == null || review.getComment().isBlank()) return ResponseEntity.badRequest().body(Map.of("message", "Please write a review."));
        Product product = productRepo.findById(review.getProduct().getId()).orElse(null);
        if (product == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Product not found."));
        review.setProduct(product); review.setComment(review.getComment().trim());
        if (review.getAuthorName() == null || review.getAuthorName().isBlank()) review.setAuthorName("Customer");
        if (review.getVerified() == null) review.setVerified(false);
        Review saved = reviewRepo.save(review);
        List<Review> all = reviewRepo.findByProductId(product.getId());
        double average = all.stream().mapToInt(item -> item.getRating() == null ? 0 : item.getRating()).average().orElse(0);
        product.setRating(Math.round(average * 10.0) / 10.0); product.setReviewCount(all.size()); productRepo.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
