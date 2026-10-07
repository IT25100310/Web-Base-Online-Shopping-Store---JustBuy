package com.justbuy.service;

import com.justbuy.model.Product;
import com.justbuy.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepo;

    public List<Product> getFeatured() {
        return productRepo.findByFeaturedTrue();
    }

    public List<Product> getFlashDeals() {
        return productRepo.findByFlashDealTrue();
    }

    public List<Product> getBestSellers(int limit) {
        return productRepo.findBestSellers(PageRequest.of(0, limit));
    }

    public List<Product> getNewArrivals(int limit) {
        return productRepo.findNewArrivals(PageRequest.of(0, limit));
    }

    public Optional<Product> getById(Long id) {
        return productRepo.findById(id);
    }

    public Page<Product> search(String q, int page, int size, String sort) {
        Sort sorting = switch (sort) {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "rating" -> Sort.by("rating").descending();
            case "newest" -> Sort.by("createdAt").descending();
            default -> Sort.by("soldCount").descending();
        };
        return productRepo.searchProducts(q, PageRequest.of(page, size, sorting));
    }

    public List<Product> getByCategory(Long categoryId, int page, int size, String sort) {
        Sort sorting = switch (sort) {
            case "price_asc" -> Sort.by("price").ascending();
            case "price_desc" -> Sort.by("price").descending();
            case "rating" -> Sort.by("rating").descending();
            default -> Sort.by("soldCount").descending();
        };
        return productRepo.findByCategoryId(categoryId, PageRequest.of(page, size, sorting));
    }

    public List<Product> getByCategoryName(String category, int page, int size, String sort) {
        Sort sorting = switch (sort) {
            case "price_asc", "price-low" -> Sort.by("price").ascending();
            case "price_desc", "price-high" -> Sort.by("price").descending();
            case "rating" -> Sort.by("rating").descending();
            default -> Sort.by("soldCount").descending();
        };
        return productRepo.findByCategoryNameIgnoreCase(category, PageRequest.of(page, size, sorting));
    }

    public List<Product> getBySeller(Long sellerId, int page, int size) {
        return productRepo.findBySellerId(sellerId, PageRequest.of(page, size, Sort.by("createdAt").descending()));
    }

    public List<Product> getRelated(Long categoryId, Long productId, int limit) {
        return productRepo.findByCategoryIdAndIdNot(categoryId, productId, PageRequest.of(0, limit));
    }

    public List<Product> getAll(int page, int size) {
        return productRepo.findAll(PageRequest.of(page, size)).getContent();
    }
}
