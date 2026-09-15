package com.Justbuy.controller;


import com.justbuy.model.Product;
import com.justbuy.service.ProductService;
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

    private final ProductService productService; // browsing / search (existing, used by other modules too)
    private final ProductDAO productDAO;          // create / update / delete for Admin & Seller

    // ---------- Browsing (Customer-facing, unchanged) ----------


    @GetMapping
    public ResponseEntity<Map<String, Object>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "popular") String sort,
            @RequestParam(required = false) Long categoryId) {

        List<Product> products;
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

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        return productService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
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

        // ---------- Seller / Admin management (Product-1, Product-2) ----------

        /** Admin adds a product, or a Seller adds a product to their own store. */
        @PostMapping
        public ResponseEntity<Product> createProduct(@RequestBody Product product) {
            return ResponseEntity.ok(productDAO.create(product));
        }

        /** Admin/Seller edits an existing product's details. */
        @PutMapping("/{id}")
        public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
            Product updated = productDAO.update(id, product);
            return updated != null ? ResponseEntity.ok(updated) : ResponseEntity.notFound().build();
        }

        /** Seller restocks or reduces stock, e.g. PATCH /api/products/5/stock?change=10 */
        @PatchMapping("/{id}/stock")
        public ResponseEntity<Void> adjustStock(@PathVariable Long id, @RequestParam int change) {
            boolean ok = productDAO.updateStock(id, change);
            return ok ? ResponseEntity.ok().build() : ResponseEntity.notFound().build();
        }

        /** Admin/Seller removes a product from the catalogue. */
        @DeleteMapping("/{id}")
        public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
            boolean deleted = productDAO.deleteById(id);
            return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}

