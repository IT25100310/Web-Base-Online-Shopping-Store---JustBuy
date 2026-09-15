package com.eshopping.inventory.dto;

public class AvailabilityResponse {
    private String sku;
    private String productName;
    private int availableQuantity;
    private int requestedQuantity;
    private boolean available;
    private String status;

    public AvailabilityResponse(String sku, String productName, int availableQuantity, int requestedQuantity, boolean available, String status) {
        this.sku = sku;
        this.productName = productName;
        this.availableQuantity = availableQuantity;
        this.requestedQuantity = requestedQuantity;
        this.available = available;
        this.status = status;
    }

    public String getSku() { return sku; }
    public String getProductName() { return productName; }
    public int getAvailableQuantity() { return availableQuantity; }
    public int getRequestedQuantity() { return requestedQuantity; }
    public boolean isAvailable() { return available; }
    public String getStatus() { return status; }
}
