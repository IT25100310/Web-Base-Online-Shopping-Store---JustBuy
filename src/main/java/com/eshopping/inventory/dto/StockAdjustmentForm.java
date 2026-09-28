package com.eshopping.inventory.dto;

import com.eshopping.inventory.model.TransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class StockAdjustmentForm {
    @NotNull(message = "Select an operation")
    private TransactionType type;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @Size(max = 80)
    private String referenceId;

    @Size(max = 255)
    private String reason;

    @Size(max = 100)
    private String performedBy = "Demo User";

    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
}
