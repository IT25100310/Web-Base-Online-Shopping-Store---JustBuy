package com.justbuy.repository;

import com.justbuy.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);
    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Order> findDistinctByItemsSellerIdOrderByCreatedAtDesc(Long sellerId);
    List<Order> findByDriverIdOrderByCreatedAtDesc(Long driverId);

    @Query("SELECT DISTINCT o FROM Order o JOIN o.items i WHERE i.productId IN :productIds ORDER BY o.createdAt DESC")
    List<Order> findDistinctByItemProductIds(@Param("productIds") Set<Long> productIds);
}
