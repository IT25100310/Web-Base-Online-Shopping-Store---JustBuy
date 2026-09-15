package com.eshopping.inventory.repository;

import com.eshopping.inventory.model.StockLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StockLocationRepository extends JpaRepository<StockLocation, Long> {
    Optional<StockLocation> findByCodeIgnoreCase(String code);
    boolean existsByCodeIgnoreCase(String code);
    List<StockLocation> findByActiveTrueOrderByNameAsc();
    List<StockLocation> findAllByOrderByNameAsc();
}
