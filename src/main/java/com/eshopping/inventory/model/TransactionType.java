package com.eshopping.inventory.model;

public enum TransactionType {
    INITIAL_STOCK("Initial stock"),
    RESTOCK("Restock"),
    MANUAL_INCREASE("Manual increase"),
    MANUAL_DECREASE("Manual decrease"),
    ORDER_DEDUCTION("Order placed - deduct stock"),
    ORDER_CANCELLATION("Order cancelled - restore stock"),
    RETURN_RESTOCK("Returned item - restore stock");

    private final String label;

    TransactionType(String label) {
        this.label = label;
    }

    public String getLabel() {
        return label;
    }

    public boolean increasesStock() {
        return this == RESTOCK || this == MANUAL_INCREASE || this == ORDER_CANCELLATION || this == RETURN_RESTOCK;
    }

    public boolean decreasesStock() {
        return this == MANUAL_DECREASE || this == ORDER_DEDUCTION;
    }
}
