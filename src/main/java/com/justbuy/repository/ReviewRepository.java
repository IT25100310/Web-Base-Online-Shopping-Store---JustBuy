package com.justbuy.repository;

import com.justbuy.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Set;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProductId(Long productId);
    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);
    List<Review> findByProductIdInOrderByCreatedAtDesc(Set<Long> productIds);
}
