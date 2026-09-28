package com.eshopping.inventory.repository;

import com.eshopping.inventory.model.InventoryTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryTransactionRepository extends JpaRepository<InventoryTransaction, Long> {
    List<InventoryTransaction> findTop15ByOrderByCreatedAtDesc();
    List<InventoryTransaction> findByItemIdOrderByCreatedAtDesc(Long itemId);
}
