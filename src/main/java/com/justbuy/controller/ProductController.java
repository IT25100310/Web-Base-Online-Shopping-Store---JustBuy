package com.justbuy.controller;

import com.justbuy.model.Product;
import com.justbuy.repository.CategoryRepository;
import com.justbuy.service.ProductService;
import com.justbuy.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "popular") String sort,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String category) {

        List<Product> products;
        if (categoryId == null && category != null && !category.isBlank()) {
            categoryId = categoryRepository.findByNameIgnoreCase(category.trim())
                    .map(categoryEntity -> categoryEntity.getId())
                    .orElse(null);
        }
        if (categoryId != null) {
            products = productService.getByCategory(categoryId, page, size, sort);
        } else {
            products = productService.getAll(page, size);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        response.put("page", page);
        response.put("size", size);
        response.put("total", products.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Product>> getSellerProducts(@PathVariable Long sellerId) {
        return ResponseEntity.ok(productRepository.findBySellerId(sellerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return productService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(productService.save(product));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        product.setId(id);
        return ResponseEntity.ok(productService.save(product));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleInvalidProduct(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of("message", exception.getMessage()));
    }

    @GetMapping("/featured")
    public ResponseEntity<List<Product>> getFeatured() {
        return ResponseEntity.ok(productService.getFeatured());
    }

    @GetMapping("/flash-deals")
    public ResponseEntity<List<Product>> getFlashDeals() {
        return ResponseEntity.ok(productService.getFlashDeals());
    }

    @GetMapping("/best-sellers")
    public ResponseEntity<List<Product>> getBestSellers(
            @RequestParam(defaultValue = "12") int limit) {
        return ResponseEntity.ok(productService.getBestSellers(limit));
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<List<Product>> getNewArrivals(
            @RequestParam(defaultValue = "12") int limit) {
        return ResponseEntity.ok(productService.getNewArrivals(limit));
    }

    @GetMapping("/{id}/related")
    public ResponseEntity<List<Product>> getRelated(
            @PathVariable Long id,
            @RequestParam Long categoryId,
            @RequestParam(defaultValue = "6") int limit) {
        return ResponseEntity.ok(productService.getRelated(categoryId, id, limit));
    }
}
