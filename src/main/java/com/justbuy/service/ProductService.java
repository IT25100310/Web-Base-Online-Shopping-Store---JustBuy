package com.justbuy.service;

import com.justbuy.model.Product;
import com.justbuy.model.Category;
import com.justbuy.model.Seller;
import com.justbuy.repository.CategoryRepository;
import com.justbuy.repository.ProductRepository;
import com.justbuy.repository.SellerRepository;
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
    private final CategoryRepository categoryRepo;
    private final SellerRepository sellerRepo;

    public Product save(Product input) {
        validate(input);
        Product product = input.getId() == null
                ? new Product()
                : productRepo.findById(input.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + input.getId()));

        product.setName(input.getName().trim());
        product.setSlug(input.getSlug());
        product.setDescription(input.getDescription());
        product.setPrice(input.getPrice());
        product.setOriginalPrice(input.getOriginalPrice());
        product.setDiscountPercent(input.getDiscountPercent());
        product.setStock(input.getStock());
        product.setImageUrls(input.getImageUrls());
        product.setThumbnailUrl(input.getThumbnailUrl());
        product.setColors(input.getColors());
        product.setSizes(input.getSizes());
        product.setRating(input.getRating());
        product.setReviewCount(input.getReviewCount());
        product.setSoldCount(input.getSoldCount());
        product.setFeatured(Boolean.TRUE.equals(input.getFeatured()));
        product.setFlashDeal(Boolean.TRUE.equals(input.getFlashDeal()));
        product.setFreeShipping(Boolean.TRUE.equals(input.getFreeShipping()));
        product.setBadge(input.getBadge());
        product.setTags(input.getTags());
        product.setCategory(resolveCategory(input));
        product.setSeller(resolveSeller(input));
        return productRepo.save(product);
    }

    public void delete(Long id) {
        if (!productRepo.existsById(id)) {
            throw new IllegalArgumentException("Product not found: " + id);
        }
        productRepo.deleteById(id);
    }

    private void validate(Product product) {
        if (product == null || product.getName() == null || product.getName().isBlank()) {
            throw new IllegalArgumentException("Product name is required.");
        }
        if (product.getPrice() == null || product.getPrice().signum() < 0) {
            throw new IllegalArgumentException("Product price must be zero or greater.");
        }
        if (product.getStock() == null || product.getStock() < 0) {
            throw new IllegalArgumentException("Product stock must be zero or greater.");
        }
    }

    private Category resolveCategory(Product product) {
        if (product.getCategory() == null || product.getCategory().getId() == null) {
            throw new IllegalArgumentException("A valid category is required.");
        }
        return categoryRepo.findById(product.getCategory().getId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + product.getCategory().getId()));
    }

    private Seller resolveSeller(Product product) {
        if (product.getSeller() == null || product.getSeller().getId() == null) {
            throw new IllegalArgumentException("A valid seller is required.");
        }
        return sellerRepo.findById(product.getSeller().getId())
                .orElseThrow(() -> new IllegalArgumentException("Seller not found: " + product.getSeller().getId()));
    }

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
