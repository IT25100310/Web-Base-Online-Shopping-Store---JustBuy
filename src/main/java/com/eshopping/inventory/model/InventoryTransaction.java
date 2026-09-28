package com.eshopping.inventory.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_transactions")
public class InventoryTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "inventory_item_id", nullable = false)
    private InventoryItem item;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TransactionType type;

    @Column(nullable = false)
    private int quantityChanged;

    @Column(nullable = false)
    private int previousQuantity;

    @Column(nullable = false)
    private int newQuantity;

    @Column(length = 80)
    private String referenceId;

    @Column(length = 255)
    private String reason;

    @Column(nullable = false, length = 100)
    private String performedBy;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    void prePersist() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public InventoryItem getItem() { return item; }
    public void setItem(InventoryItem item) { this.item = item; }
    public TransactionType getType() { return type; }
    public void setType(TransactionType type) { this.type = type; }
    public int getQuantityChanged() { return quantityChanged; }
    public void setQuantityChanged(int quantityChanged) { this.quantityChanged = quantityChanged; }
    public int getPreviousQuantity() { return previousQuantity; }
    public void setPreviousQuantity(int previousQuantity) { this.previousQuantity = previousQuantity; }
    public int getNewQuantity() { return newQuantity; }
    public void setNewQuantity(int newQuantity) { this.newQuantity = newQuantity; }
    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public String getPerformedBy() { return performedBy; }
    public void setPerformedBy(String performedBy) { this.performedBy = performedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
