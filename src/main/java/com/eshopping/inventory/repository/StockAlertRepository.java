package com.eshopping.inventory.repository;

import com.eshopping.inventory.model.AlertStatus;
import com.eshopping.inventory.model.StockAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockAlertRepository extends JpaRepository<StockAlert, Long> {
    Optional<StockAlert> findFirstByItemIdAndStatus(Long itemId, AlertStatus status);
    List<StockAlert> findByStatusOrderByCreatedAtDesc(AlertStatus status);
    long countByStatus(AlertStatus status);
}
