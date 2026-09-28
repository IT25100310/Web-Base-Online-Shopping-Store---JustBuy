package com.eshopping.inventory.controller;

import com.eshopping.inventory.model.InventoryItem;
import com.eshopping.inventory.service.InventoryService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Controller
@RequestMapping("/reports")
public class ReportController {
    private final InventoryService inventoryService;

    public ReportController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public String report(Model model) {
        model.addAttribute("summary", inventoryService.dashboardSummary());
        model.addAttribute("vendorUnits", inventoryService.unitsByVendor());
        model.addAttribute("categoryUnits", inventoryService.unitsByCategory());
        model.addAttribute("items", inventoryService.search(null, null, false));
        return "reports/inventory";
    }

    @GetMapping("/inventory.csv")
    public void csv(HttpServletResponse response) throws IOException {
        response.setContentType("text/csv");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setHeader("Content-Disposition", "attachment; filename=inventory-report.csv");
        StringBuilder csv = new StringBuilder("SKU,Product,Vendor,Category,Quantity,Reorder Threshold,Location,Unit Price,Status\n");
        for (InventoryItem item : inventoryService.search(null, null, true)) {
            csv.append(cell(item.getSku())).append(',')
                    .append(cell(item.getProductName())).append(',')
                    .append(cell(item.getVendorName())).append(',')
                    .append(cell(item.getCategory())).append(',')
                    .append(item.getQuantity()).append(',')
                    .append(item.getReorderThreshold()).append(',')
                    .append(cell(item.getLocation().getName())).append(',')
                    .append(item.getUnitPrice()).append(',')
                    .append(item.getStatus()).append('\n');
        }
        response.getWriter().write(csv.toString());
    }

    private String cell(String value) {
        if (value == null) return "";
        return '"' + value.replace("\"", "\"\"") + '"';
    }
}
