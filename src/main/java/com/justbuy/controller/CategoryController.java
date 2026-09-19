package com.justbuy.controller;

import com.justbuy.model.Category;
import com.justbuy.repository.CategoryRepository;
import com.justbuy.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CategoryController {

    private final CategoryRepository categoryRepo;
    private final ProductRepository productRepo;

    @GetMapping
    public ResponseEntity<List<Category>> getAll() {
        return ResponseEntity.ok(categoryRepo.findAll());
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Category>> getFeatured() {
        return ResponseEntity.ok(categoryRepo.findByFeaturedTrue());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getById(@PathVariable Long id) {
        return categoryRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Category> getBySlug(@PathVariable String slug) {
        return categoryRepo.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Category> create(@RequestBody Category input) {
        validate(input);
        if (categoryRepo.findBySlug(input.getSlug()).isPresent()) {
            throw new IllegalArgumentException("Category slug already exists.");
        }
        input.setId(null);
        return ResponseEntity.ok(categoryRepo.save(input));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> update(@PathVariable Long id, @RequestBody Category input) {
        validate(input);
        return categoryRepo.findById(id).map(existing -> {
            categoryRepo.findBySlug(input.getSlug()).filter(category -> !category.getId().equals(id))
                    .ifPresent(category -> { throw new IllegalArgumentException("Category slug already exists."); });
            existing.setName(input.getName().trim());
            existing.setSlug(input.getSlug());
            existing.setDescription(input.getDescription());
            existing.setIcon(input.getIcon());
            existing.setImageUrl(input.getImageUrl());
            existing.setColor(input.getColor());
            existing.setProductCount(input.getProductCount());
            existing.setFeatured(Boolean.TRUE.equals(input.getFeatured()));
            return ResponseEntity.ok(categoryRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!categoryRepo.existsById(id)) return ResponseEntity.notFound().build();
        if (productRepo.existsByCategoryId(id)) {
            throw new IllegalArgumentException("Category cannot be deleted while products reference it.");
        }
        categoryRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void validate(Category input) {
        if (input == null || input.getName() == null || input.getName().isBlank()) {
            throw new IllegalArgumentException("Category name is required.");
        }
        if (input.getSlug() == null || input.getSlug().isBlank()) {
            input.setSlug(input.getName().trim().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", ""));
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCategory(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }
}
