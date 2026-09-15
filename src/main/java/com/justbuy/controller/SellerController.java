package com.justbuy.controller;

import com.justbuy.model.Seller;
import com.justbuy.model.Product;
import com.justbuy.repository.SellerRepository;
import com.justbuy.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/sellers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SellerController {

    private final SellerRepository sellerRepo;
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<Seller>> getAll() {
        return ResponseEntity.ok(sellerRepo.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Seller> getById(@PathVariable Long id) {
        return sellerRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/products")
    public ResponseEntity<Map<String, Object>> getSellerProducts(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        List<Product> products = productService.getBySeller(id, page, size);
        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        response.put("page", page);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<Seller> getBySlug(@PathVariable String slug) {
        return sellerRepo.findBySlug(slug)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
