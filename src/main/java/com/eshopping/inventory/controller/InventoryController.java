package com.eshopping.inventory.controller;

import com.eshopping.inventory.dto.InventoryItemForm;
import com.eshopping.inventory.dto.StockAdjustmentForm;
import com.eshopping.inventory.exception.InventoryException;
import com.eshopping.inventory.model.InventoryItem;
import com.eshopping.inventory.model.TransactionType;
import com.eshopping.inventory.service.InventoryService;
import com.eshopping.inventory.service.StockLocationService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import java.util.Arrays;
import java.util.List;

@Controller
@RequestMapping("/inventory")
public class InventoryController {
    private final InventoryService inventoryService;
    private final StockLocationService locationService;

    public InventoryController(InventoryService inventoryService, StockLocationService locationService) {
        this.inventoryService = inventoryService;
        this.locationService = locationService;
    }

    @GetMapping
    public String list(@RequestParam(required = false) String q,
                       @RequestParam(required = false) String vendor,
                       @RequestParam(defaultValue = "false") boolean includeDiscontinued,
                       Model model) {
        model.addAttribute("items", inventoryService.search(q, vendor, includeDiscontinued));
        model.addAttribute("vendors", inventoryService.vendors());
        model.addAttribute("q", q == null ? "" : q);
        model.addAttribute("selectedVendor", vendor == null ? "" : vendor);
        model.addAttribute("includeDiscontinued", includeDiscontinued);
        return "inventory/list";
    }

    @GetMapping("/new")
    public String newItem(Model model) {
        InventoryItemForm form = new InventoryItemForm();
        form.setQuantity(0);
        form.setReorderThreshold(5);
        form.setUnitPrice(java.math.BigDecimal.ZERO);
        prepareForm(model, form, "Add Inventory Item");
        return "inventory/form";
    }

    @PostMapping
    public String create(@Valid @ModelAttribute("form") InventoryItemForm form,
                         BindingResult bindingResult,
                         Model model,
                         RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            prepareForm(model, form, "Add Inventory Item");
            return "inventory/form";
        }
        try {
            InventoryItem saved = inventoryService.save(form);
            redirectAttributes.addFlashAttribute("success", "Inventory item " + saved.getSku() + " created successfully.");
            return "redirect:/inventory";
        } catch (InventoryException ex) {
            bindingResult.reject("inventory", ex.getMessage());
            prepareForm(model, form, "Add Inventory Item");
            return "inventory/form";
        }
    }

    @GetMapping("/{id}/edit")
    public String edit(@PathVariable Long id, Model model) {
        prepareForm(model, inventoryService.toForm(inventoryService.get(id)), "Edit Inventory Item");
        return "inventory/form";
    }

    @PostMapping("/{id}")
    public String update(@PathVariable Long id,
                         @Valid @ModelAttribute("form") InventoryItemForm form,
                         BindingResult bindingResult,
                         Model model,
                         RedirectAttributes redirectAttributes) {
        form.setId(id);
        if (bindingResult.hasErrors()) {
            prepareForm(model, form, "Edit Inventory Item");
            return "inventory/form";
        }
        try {
            InventoryItem saved = inventoryService.save(form);
            redirectAttributes.addFlashAttribute("success", "Inventory item " + saved.getSku() + " updated.");
            return "redirect:/inventory";
        } catch (InventoryException ex) {
            bindingResult.reject("inventory", ex.getMessage());
            prepareForm(model, form, "Edit Inventory Item");
            return "inventory/form";
        }
    }

    @GetMapping("/{id}/adjust")
    public String adjustForm(@PathVariable Long id, Model model) {
        model.addAttribute("item", inventoryService.get(id));
        model.addAttribute("form", new StockAdjustmentForm());
        model.addAttribute("types", adjustableTypes());
        return "inventory/adjust";
    }

    @PostMapping("/{id}/adjust")
    public String adjust(@PathVariable Long id,
                         @Valid @ModelAttribute("form") StockAdjustmentForm form,
                         BindingResult bindingResult,
                         Model model,
                         RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("item", inventoryService.get(id));
            model.addAttribute("types", adjustableTypes());
            return "inventory/adjust";
        }
        try {
            InventoryItem item = inventoryService.adjustStock(id, form);
            redirectAttributes.addFlashAttribute("success", "Stock updated. New quantity: " + item.getQuantity());
            return "redirect:/inventory";
        } catch (InventoryException ex) {
            bindingResult.reject("inventory", ex.getMessage());
            model.addAttribute("item", inventoryService.get(id));
            model.addAttribute("types", adjustableTypes());
            return "inventory/adjust";
        }
    }

    @PostMapping("/{id}/discontinue")
    public String discontinue(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        inventoryService.discontinue(id);
        redirectAttributes.addFlashAttribute("success", "Product marked as discontinued.");
        return "redirect:/inventory";
    }

    @PostMapping("/{id}/reactivate")
    public String reactivate(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        inventoryService.reactivate(id);
        redirectAttributes.addFlashAttribute("success", "Product reactivated.");
        return "redirect:/inventory?includeDiscontinued=true";
    }

    @GetMapping("/{id}")
    public String details(@PathVariable Long id, Model model) {
        model.addAttribute("item", inventoryService.get(id));
        model.addAttribute("transactions", inventoryService.transactionsFor(id));
        return "inventory/details";
    }

    @GetMapping("/audit")
    public String audit(Model model) {
        model.addAttribute("transactions", inventoryService.allTransactions());
        return "inventory/audit";
    }

    private void prepareForm(Model model, InventoryItemForm form, String title) {
        model.addAttribute("form", form);
        model.addAttribute("title", title);
        model.addAttribute("locations", locationService.findActive());
        model.addAttribute("actionUrl", form.getId() == null ? "/inventory" : "/inventory/" + form.getId());
    }

    private List<TransactionType> adjustableTypes() {
        return Arrays.stream(TransactionType.values())
                .filter(type -> type != TransactionType.INITIAL_STOCK)
                .toList();
    }
}
