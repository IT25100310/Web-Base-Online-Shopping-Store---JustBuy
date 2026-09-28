package com.eshopping.inventory.controller;

import com.eshopping.inventory.dto.AvailabilityResponse;
import com.eshopping.inventory.service.InventoryService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class AvailabilityController {
    private final InventoryService inventoryService;

    public AvailabilityController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/availability")
    public String availability(@RequestParam(required = false) String sku,
                               @RequestParam(defaultValue = "1") int quantity,
                               Model model) {
        if (sku != null && !sku.isBlank()) {
            AvailabilityResponse result = inventoryService.availability(sku.trim(), quantity);
            model.addAttribute("result", result);
        }
        model.addAttribute("sku", sku == null ? "" : sku);
        model.addAttribute("quantity", Math.max(quantity, 1));
        return "availability";
    }
}
