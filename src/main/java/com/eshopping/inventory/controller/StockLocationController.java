package com.eshopping.inventory.controller;

import com.eshopping.inventory.dto.StockLocationForm;
import com.eshopping.inventory.exception.InventoryException;
import com.eshopping.inventory.service.StockLocationService;
import jakarta.validation.Valid;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/locations")
public class StockLocationController {
    private final StockLocationService locationService;

    public StockLocationController(StockLocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping
    public String list(Model model) {
        model.addAttribute("locations", locationService.findAll());
        return "locations/list";
    }

    @GetMapping("/new")
    public String newLocation(Model model) {
        model.addAttribute("form", new StockLocationForm());
        model.addAttribute("title", "Add Stock Location");
        model.addAttribute("actionUrl", "/locations");
        return "locations/form";
    }

    @PostMapping
    public String create(@Valid @ModelAttribute("form") StockLocationForm form,
                         BindingResult bindingResult, Model model, RedirectAttributes redirectAttributes) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("title", "Add Stock Location");
            model.addAttribute("actionUrl", "/locations");
            return "locations/form";
        }
        try {
            locationService.save(form);
            redirectAttributes.addFlashAttribute("success", "Stock location saved.");
            return "redirect:/locations";
        } catch (InventoryException ex) {
            bindingResult.reject("location", ex.getMessage());
            model.addAttribute("title", "Add Stock Location");
            model.addAttribute("actionUrl", "/locations");
            return "locations/form";
        }
    }

    @GetMapping("/{id}/edit")
    public String edit(@PathVariable Long id, Model model) {
        model.addAttribute("form", locationService.toForm(locationService.get(id)));
        model.addAttribute("title", "Edit Stock Location");
        model.addAttribute("actionUrl", "/locations/" + id);
        return "locations/form";
    }

    @PostMapping("/{id}")
    public String update(@PathVariable Long id, @Valid @ModelAttribute("form") StockLocationForm form,
                         BindingResult bindingResult, Model model, RedirectAttributes redirectAttributes) {
        form.setId(id);
        if (bindingResult.hasErrors()) {
            model.addAttribute("title", "Edit Stock Location");
            model.addAttribute("actionUrl", "/locations/" + id);
            return "locations/form";
        }
        try {
            locationService.save(form);
            redirectAttributes.addFlashAttribute("success", "Stock location updated.");
            return "redirect:/locations";
        } catch (InventoryException ex) {
            bindingResult.reject("location", ex.getMessage());
            model.addAttribute("title", "Edit Stock Location");
            model.addAttribute("actionUrl", "/locations/" + id);
            return "locations/form";
        }
    }

    @PostMapping("/{id}/deactivate")
    public String deactivate(@PathVariable Long id, RedirectAttributes redirectAttributes) {
        try {
            locationService.deactivate(id);
            redirectAttributes.addFlashAttribute("success", "Location deactivated.");
        } catch (InventoryException ex) {
            redirectAttributes.addFlashAttribute("error", ex.getMessage());
        }
        return "redirect:/locations";
    }
}
