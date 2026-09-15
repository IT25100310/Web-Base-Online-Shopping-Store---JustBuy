package com.justbuy.repository;

import com.justbuy.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByFeaturedTrue();
    Optional<Category> findBySlug(String slug);
}
