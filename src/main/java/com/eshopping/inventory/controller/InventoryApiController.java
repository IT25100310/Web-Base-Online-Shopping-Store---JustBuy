package com.eshopping.inventory.controller;

import com.eshopping.inventory.dto.*;
import com.eshopping.inventory.exception.InventoryException;
import com.eshopping.inventory.model.InventoryItem;
import com.eshopping.inventory.model.TransactionType;
import com.eshopping.inventory.service.InventoryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
public class InventoryApiController {
    private final InventoryService inventoryService;

    public InventoryApiController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/availability/{sku}")
    public AvailabilityResponse availability(@PathVariable String sku,
                                             @RequestParam(defaultValue = "1") int quantity) {
        return inventoryService.availability(sku, quantity);
    }

    @PostMapping("/order")
    public ResponseEntity<?> deductForOrder(@Valid @RequestBody StockChangeRequest request) {
        return apply(request, TransactionType.ORDER_DEDUCTION, "Stock deducted for order.");
    }

    @PostMapping("/cancel")
    public ResponseEntity<?> restoreCancelledOrder(@Valid @RequestBody StockChangeRequest request) {
        return apply(request, TransactionType.ORDER_CANCELLATION, "Stock restored after order cancellation.");
    }

    @PostMapping("/return")
    public ResponseEntity<?> restoreReturnedItem(@Valid @RequestBody StockChangeRequest request) {
        return apply(request, TransactionType.RETURN_RESTOCK, "Returned item added back to stock.");
    }

    private ResponseEntity<?> apply(StockChangeRequest request, TransactionType type, String message) {
        try {
            InventoryItem item = inventoryService.applyExternalChange(
                    request.getSku(), request.getQuantity(), type, request.getReferenceId(), request.getPerformedBy());
            return ResponseEntity.ok(new StockChangeResponse(item.getSku(), item.getQuantity(), message));
        } catch (InventoryException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
        }
    }
}
