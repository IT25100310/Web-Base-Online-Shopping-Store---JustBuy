package com.justbuy.repository;

import com.justbuy.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    java.util.Optional<Product> findByIdForUpdate(@Param("id") Long id);

    List<Product> findByFeaturedTrue();

    List<Product> findByFlashDealTrue();

    List<Product> findByCategoryId(Long categoryId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
            "LOWER(p.name) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
            "LOWER(p.tags) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Product> searchProducts(@Param("q") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.seller.id = :sellerId")
    List<Product> findBySellerId(@Param("sellerId") Long sellerId, Pageable pageable);

    List<Product> findBySellerId(Long sellerId);

    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice")
    List<Product> findByPriceRange(@Param("minPrice") BigDecimal minPrice,
                                   @Param("maxPrice") BigDecimal maxPrice,
                                   Pageable pageable);

    @Query("SELECT p FROM Product p ORDER BY p.soldCount DESC")
    List<Product> findBestSellers(Pageable pageable);

    @Query("SELECT p FROM Product p ORDER BY p.createdAt DESC")
    List<Product> findNewArrivals(Pageable pageable);

    List<Product> findByCategoryIdAndIdNot(Long categoryId, Long productId, Pageable pageable);

    boolean existsByCategoryId(Long categoryId);
}
