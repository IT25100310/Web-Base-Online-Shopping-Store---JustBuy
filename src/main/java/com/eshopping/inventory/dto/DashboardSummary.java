package com.eshopping.inventory.dto;

import java.math.BigDecimal;

public class DashboardSummary {
    private final long activeProducts;
    private final long lowStockItems;
    private final long outOfStockItems;
    private final long totalUnits;
    private final BigDecimal totalStockValue;

    public DashboardSummary(long activeProducts, long lowStockItems, long outOfStockItems, long totalUnits, BigDecimal totalStockValue) {
        this.activeProducts = activeProducts;
        this.lowStockItems = lowStockItems;
        this.outOfStockItems = outOfStockItems;
        this.totalUnits = totalUnits;
        this.totalStockValue = totalStockValue;
    }

    public long getActiveProducts() { return activeProducts; }
    public long getLowStockItems() { return lowStockItems; }
    public long getOutOfStockItems() { return outOfStockItems; }
    public long getTotalUnits() { return totalUnits; }
    public BigDecimal getTotalStockValue() { return totalStockValue; }
}
