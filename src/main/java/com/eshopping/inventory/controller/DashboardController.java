package com.eshopping.inventory.controller;

import com.eshopping.inventory.service.InventoryService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class DashboardController {
    private final InventoryService inventoryService;

    public DashboardController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/")
    public String dashboard(Model model) {
        model.addAttribute("summary", inventoryService.dashboardSummary());
        model.addAttribute("alerts", inventoryService.openAlerts());
        model.addAttribute("transactions", inventoryService.recentTransactions());
        return "dashboard";
    }
}
