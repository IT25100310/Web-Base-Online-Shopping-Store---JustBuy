package com.eshopping.inventory;

import com.eshopping.inventory.dto.InventoryItemForm;
import com.eshopping.inventory.dto.StockAdjustmentForm;
import com.eshopping.inventory.exception.InventoryException;
import com.eshopping.inventory.model.StockLocation;
import com.eshopping.inventory.model.TransactionType;
import com.eshopping.inventory.repository.StockLocationRepository;
import com.eshopping.inventory.service.InventoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
class InventoryServiceTest {
    @Autowired private InventoryService service;
    @Autowired private StockLocationRepository locationRepository;

    private Long itemId;

    @BeforeEach
    void setUp() {
        if (locationRepository.count() == 0) {
            StockLocation location = new StockLocation();
            location.setCode("TEST-WH");
            location.setName("Test Warehouse");
            location.setActive(true);
            locationRepository.save(location);
        }
        if (service.search("TST-001", null, true).isEmpty()) {
            InventoryItemForm form = new InventoryItemForm();
            form.setSku("TST-001");
            form.setProductName("Test Product");
            form.setCategory("Test");
            form.setVendorId("VTEST");
            form.setVendorName("Test Vendor");
            form.setQuantity(10);
            form.setReorderThreshold(3);
            form.setUnitPrice(new BigDecimal("100.00"));
            form.setLocationId(locationRepository.findAll().get(0).getId());
            itemId = service.save(form).getId();
        } else {
            itemId = service.getBySku("TST-001").getId();
        }
    }

    @Test
    void orderDeductionChangesQuantity() {
        int before = service.get(itemId).getQuantity();
        StockAdjustmentForm form = new StockAdjustmentForm();
        form.setType(TransactionType.ORDER_DEDUCTION);
        form.setQuantity(2);
        form.setReferenceId("ORD-TEST");
        form.setPerformedBy("JUnit");
        int after = service.adjustStock(itemId, form).getQuantity();
        assertEquals(before - 2, after);
    }

    @Test
    void insufficientStockIsRejected() {
        StockAdjustmentForm form = new StockAdjustmentForm();
        form.setType(TransactionType.ORDER_DEDUCTION);
        form.setQuantity(100000);
        assertThrows(InventoryException.class, () -> service.adjustStock(itemId, form));
    }

    @Test
    void cancellationRestoresStock() {
        int before = service.get(itemId).getQuantity();
        StockAdjustmentForm form = new StockAdjustmentForm();
        form.setType(TransactionType.ORDER_CANCELLATION);
        form.setQuantity(3);
        int after = service.adjustStock(itemId, form).getQuantity();
        assertEquals(before + 3, after);
    }
}
