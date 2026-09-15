package com.eshopping.inventory.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class InventoryItemForm {
    private Long id;

    @NotBlank(message = "SKU is required")
    @Pattern(regexp = "[A-Za-z0-9_-]{2,40}", message = "Use only letters, numbers, _ or -")
    private String sku;

    @NotBlank(message = "Product name is required")
    @Size(min = 2, max = 120)
    private String productName;

    @NotBlank(message = "Category is required")
    @Size(max = 80)
    private String category;

    @Size(max = 60)
    private String externalProductId;

    @NotBlank(message = "Vendor ID is required")
    @Size(max = 60)
    private String vendorId;

    @NotBlank(message = "Vendor name is required")
    @Size(max = 120)
    private String vendorName;

    @NotNull(message = "Quantity is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer quantity;

    @NotNull(message = "Reorder threshold is required")
    @Min(value = 0, message = "Reorder threshold cannot be negative")
    private Integer reorderThreshold;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.00", inclusive = true, message = "Unit price cannot be negative")
    private BigDecimal unitPrice;

    @NotNull(message = "Stock location is required")
    private Long locationId;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getSku() { return sku; }
    public void setSku(String sku) { this.sku = sku; }
    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getExternalProductId() { return externalProductId; }
    public void setExternalProductId(String externalProductId) { this.externalProductId = externalProductId; }
    public String getVendorId() { return vendorId; }
    public void setVendorId(String vendorId) { this.vendorId = vendorId; }
    public String getVendorName() { return vendorName; }
    public void setVendorName(String vendorName) { this.vendorName = vendorName; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public Integer getReorderThreshold() { return reorderThreshold; }
    public void setReorderThreshold(Integer reorderThreshold) { this.reorderThreshold = reorderThreshold; }
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }
}
