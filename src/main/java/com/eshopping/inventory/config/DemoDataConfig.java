package com.eshopping.inventory.config;

import com.eshopping.inventory.dto.InventoryItemForm;
import com.eshopping.inventory.model.StockLocation;
import com.eshopping.inventory.repository.InventoryItemRepository;
import com.eshopping.inventory.repository.StockLocationRepository;
import com.eshopping.inventory.service.InventoryService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.math.BigDecimal;

@Configuration
public class DemoDataConfig {

    @Bean
    @Profile({"demo", "default"})
    CommandLineRunner demoData(StockLocationRepository locationRepository,
                               InventoryItemRepository itemRepository,
                               InventoryService inventoryService) {
        return args -> {
            if (locationRepository.count() == 0) {
                createLocation(locationRepository, "MAIN-WH", "Main Warehouse", "Primary warehouse for seller inventory");
                createLocation(locationRepository, "STORE-A", "Store A", "Retail pickup stock location");
                createLocation(locationRepository, "RETURNS", "Returns Area", "Temporary area for returned products");
            }
            if (itemRepository.count() == 0) {
                StockLocation main = locationRepository.findByCodeIgnoreCase("MAIN-WH").orElseThrow();
                StockLocation store = locationRepository.findByCodeIgnoreCase("STORE-A").orElseThrow();
                add(inventoryService, main, "MOU-101", "Wireless Mouse", "Electronics", "V001", "TechWave", 18, 5, "3490.00");
                add(inventoryService, main, "KEY-210", "Mechanical Keyboard", "Electronics", "V001", "TechWave", 4, 5, "12990.00");
                add(inventoryService, store, "LMP-305", "Table Lamp with Fan", "Home & Study", "V002", "HomeHub", 8, 3, "7990.00");
                add(inventoryService, main, "USB-090", "USB-C Hub", "Electronics", "V003", "StudyMart", 0, 4, "6490.00");
                add(inventoryService, store, "NTE-500", "Premium Notebook", "Stationery", "V003", "StudyMart", 32, 10, "890.00");
                add(inventoryService, main, "PHN-440", "Phone Stand", "Accessories", "V002", "HomeHub", 12, 5, "1490.00");
            }
        };
    }

    private void createLocation(StockLocationRepository repo, String code, String name, String description) {
        StockLocation location = new StockLocation();
        location.setCode(code);
        location.setName(name);
        location.setDescription(description);
        location.setActive(true);
        repo.save(location);
    }

    private void add(InventoryService service, StockLocation location, String sku, String name, String category,
                     String vendorId, String vendorName, int qty, int threshold, String price) {
        InventoryItemForm form = new InventoryItemForm();
        form.setSku(sku);
        form.setProductName(name);
        form.setCategory(category);
        form.setVendorId(vendorId);
        form.setVendorName(vendorName);
        form.setQuantity(qty);
        form.setReorderThreshold(threshold);
        form.setUnitPrice(new BigDecimal(price));
        form.setLocationId(location.getId());
        service.save(form);
    }
}
