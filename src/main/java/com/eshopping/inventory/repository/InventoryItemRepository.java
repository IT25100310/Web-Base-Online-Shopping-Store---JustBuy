package com.eshopping.inventory.repository;

import com.eshopping.inventory.model.InventoryItem;
import com.eshopping.inventory.model.InventoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findBySkuIgnoreCase(String sku);
    boolean existsBySkuIgnoreCase(String sku);
    List<InventoryItem> findByStatusOrderByProductNameAsc(InventoryStatus status);
    long countByStatus(InventoryStatus status);
    long countByStatusAndQuantity(InventoryStatus status, int quantity);
}
