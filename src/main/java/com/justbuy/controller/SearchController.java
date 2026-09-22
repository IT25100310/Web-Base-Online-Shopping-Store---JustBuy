package com.justbuy.controller;

import com.justbuy.model.Product;
import com.justbuy.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SearchController {

    private final ProductService productService;

    // Trending searches (static for now)
    private static final List<String> TRENDING = List.of(
        "wireless earbuds", "minimalist watch", "linen shirt", "ceramic mug",
        "desk lamp", "sneakers", "tote bag", "sunglasses", "perfume", "skincare"
    );

    @GetMapping
    public ResponseEntity<Map<String, Object>> search(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "popular") String sort) {

        Page<Product> results = productService.search(q, page, size, sort);

        Map<String, Object> response = new HashMap<>();
        response.put("products", results.getContent());
        response.put("total", results.getTotalElements());
        response.put("totalPages", results.getTotalPages());
        response.put("currentPage", page);
        response.put("query", q);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trending")
    public ResponseEntity<List<String>> getTrending() {
        return ResponseEntity.ok(TRENDING);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getSuggestions(@RequestParam String q) {
        List<String> suggestions = TRENDING.stream()
                .filter(t -> t.toLowerCase().contains(q.toLowerCase()))
                .limit(5)
                .toList();
        return ResponseEntity.ok(suggestions);
    }
}
