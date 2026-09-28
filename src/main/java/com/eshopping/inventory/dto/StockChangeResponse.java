package com.eshopping.inventory.dto;

public class StockChangeResponse {
    private final String sku;
    private final int quantity;
    private final String message;

    public StockChangeResponse(String sku, int quantity, String message) {
        this.sku = sku;
        this.quantity = quantity;
        this.message = message;
    }

    public String getSku() { return sku; }
    public int getQuantity() { return quantity; }
    public String getMessage() { return message; }
}
