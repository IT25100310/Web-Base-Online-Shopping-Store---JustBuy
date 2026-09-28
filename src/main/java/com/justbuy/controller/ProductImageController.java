package com.justbuy.controller;

import com.justbuy.model.Product;
import com.justbuy.model.ProductImage;
import com.justbuy.repository.ProductImageRepository;
import com.justbuy.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductImageController {
    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;

    private final ProductRepository productRepository;
    private final ProductImageRepository imageRepository;

    @PostMapping("/{productId}/images")
    public ResponseEntity<?> upload(@PathVariable Long productId,
                                    @RequestParam("images") List<MultipartFile> images) throws IOException {
        Product product = productRepository.findById(productId).orElse(null);
        if (product == null) return ResponseEntity.notFound().build();
        if (images == null || images.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Choose at least one image."));

        List<ProductImage> savedImages = new ArrayList<>();
        int order = imageRepository.findByProductIdOrderByDisplayOrderAscIdAsc(productId).size();
        for (MultipartFile image : images) {
            if (image == null || image.isEmpty()) continue;
            if (image.getSize() > MAX_IMAGE_BYTES) {
                return ResponseEntity.badRequest().body(Map.of("message", "Each product image must be 5 MB or smaller."));
            }
            String contentType = image.getContentType() == null ? "" : image.getContentType().toLowerCase(Locale.ROOT);
            if (!contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body(Map.of("message", "Only image files are allowed."));
            }
            savedImages.add(imageRepository.save(ProductImage.builder()
                    .product(product)
                    .data(image.getBytes())
                    .contentType(contentType)
                    .displayOrder(order++)
                    .build()));
        }
        if (savedImages.isEmpty()) return ResponseEntity.badRequest().body(Map.of("message", "Choose at least one image."));

        List<String> urls = new ArrayList<>();
        if (product.getImageUrls() != null && !product.getImageUrls().isBlank()) {
            urls.addAll(List.of(product.getImageUrls().split(",")));
        }
        urls.addAll(savedImages.stream().map(image -> "/api/products/" + productId + "/images/" + image.getId()).toList());
        product.setImageUrls(urls.stream().map(String::trim).filter(url -> !url.isBlank()).distinct().collect(Collectors.joining(",")));
        if (product.getThumbnailUrl() == null || product.getThumbnailUrl().isBlank()) {
            product.setThumbnailUrl("/api/products/" + productId + "/images/" + savedImages.get(0).getId());
        }
        productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("imageUrls", urls, "thumbnailUrl", product.getThumbnailUrl()));
    }

    @GetMapping("/{productId}/images/{imageId}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long productId, @PathVariable Long imageId) {
        return imageRepository.findById(imageId)
                .filter(image -> image.getProduct() != null && productId.equals(image.getProduct().getId()))
                .map(image -> ResponseEntity.ok()
                        .header(HttpHeaders.CACHE_CONTROL, "max-age=3600")
                        .contentType(parseType(image.getContentType()))
                        .body(image.getData()))
                .orElse(ResponseEntity.notFound().build());
    }

    private MediaType parseType(String value) {
        try { return MediaType.parseMediaType(value); }
        catch (IllegalArgumentException ex) { return MediaType.APPLICATION_OCTET_STREAM; }
    }
}
