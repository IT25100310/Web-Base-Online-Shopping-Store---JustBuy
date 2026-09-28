package com.eshopping.inventory.controller;

import com.eshopping.inventory.service.InventoryService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/alerts")
public class AlertController {
    private final InventoryService inventoryService;

    public AlertController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public String list(Model model) {
        model.addAttribute("alerts", inventoryService.openAlerts());
        return "alerts/list";
    }

    @PostMapping("/{id}/resolve")
    public String resolve(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        inventoryService.resolveAlert(id);
        redirectAttributes.addFlashAttribute("success", "Alert marked as reviewed.");
        return "redirect:/alerts";
    }
}
