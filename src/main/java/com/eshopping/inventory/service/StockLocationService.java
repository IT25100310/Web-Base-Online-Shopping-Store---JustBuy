package com.eshopping.inventory.service;

import com.eshopping.inventory.dto.StockLocationForm;
import com.eshopping.inventory.exception.InventoryException;
import com.eshopping.inventory.model.StockLocation;
import com.eshopping.inventory.repository.InventoryItemRepository;
import com.eshopping.inventory.repository.StockLocationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockLocationService {
    private final StockLocationRepository locationRepository;
    private final InventoryItemRepository inventoryItemRepository;

    public StockLocationService(StockLocationRepository locationRepository, InventoryItemRepository inventoryItemRepository) {
        this.locationRepository = locationRepository;
        this.inventoryItemRepository = inventoryItemRepository;
    }

    public List<StockLocation> findAll() {
        return locationRepository.findAllByOrderByNameAsc();
    }

    public List<StockLocation> findActive() {
        return locationRepository.findByActiveTrueOrderByNameAsc();
    }

    public StockLocation get(Long id) {
        return locationRepository.findById(id).orElseThrow(() -> new InventoryException("Stock location not found."));
    }

    public StockLocationForm toForm(StockLocation location) {
        StockLocationForm form = new StockLocationForm();
        form.setId(location.getId());
        form.setCode(location.getCode());
        form.setName(location.getName());
        form.setDescription(location.getDescription());
        return form;
    }

    @Transactional
    public StockLocation save(StockLocationForm form) {
        String code = form.getCode().trim().toUpperCase();
        StockLocation location;
        if (form.getId() == null) {
            if (locationRepository.existsByCodeIgnoreCase(code)) {
                throw new InventoryException("A stock location with that code already exists.");
            }
            location = new StockLocation();
        } else {
            location = get(form.getId());
            locationRepository.findByCodeIgnoreCase(code)
                    .filter(other -> !other.getId().equals(location.getId()))
                    .ifPresent(other -> { throw new InventoryException("A stock location with that code already exists."); });
        }
        location.setCode(code);
        location.setName(form.getName().trim());
        location.setDescription(clean(form.getDescription()));
        location.setActive(true);
        return locationRepository.save(location);
    }

    @Transactional
    public void deactivate(Long id) {
        StockLocation location = get(id);
        boolean inUse = inventoryItemRepository.findAll().stream()
                .anyMatch(item -> item.getLocation().getId().equals(id) && item.getStatus().name().equals("ACTIVE"));
        if (inUse) {
            throw new InventoryException("This location is used by active inventory items. Move those items before deactivating it.");
        }
        location.setActive(false);
        locationRepository.save(location);
    }

    private String clean(String text) {
        return text == null || text.isBlank() ? null : text.trim();
    }
}
