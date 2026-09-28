package com.eshopping.inventory.service;

import com.eshopping.inventory.dto.*;
import com.eshopping.inventory.exception.InventoryException;
import com.eshopping.inventory.model.*;
import com.eshopping.inventory.repository.InventoryItemRepository;
import com.eshopping.inventory.repository.InventoryTransactionRepository;
import com.eshopping.inventory.repository.StockAlertRepository;
import com.eshopping.inventory.repository.StockLocationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class InventoryService {
    private final InventoryItemRepository itemRepository;
    private final InventoryTransactionRepository transactionRepository;
    private final StockAlertRepository alertRepository;
    private final StockLocationRepository locationRepository;

    public InventoryService(InventoryItemRepository itemRepository,
                            InventoryTransactionRepository transactionRepository,
                            StockAlertRepository alertRepository,
                            StockLocationRepository locationRepository) {
        this.itemRepository = itemRepository;
        this.transactionRepository = transactionRepository;
        this.alertRepository = alertRepository;
        this.locationRepository = locationRepository;
    }

    public List<InventoryItem> search(String query, String vendor, boolean includeDiscontinued) {
        String q = normalize(query);
        String v = normalize(vendor);
        return itemRepository.findAll().stream()
                .filter(item -> includeDiscontinued || item.getStatus() == InventoryStatus.ACTIVE)
                .filter(item -> q == null || contains(item.getSku(), q) || contains(item.getProductName(), q) || contains(item.getCategory(), q))
                .filter(item -> v == null || contains(item.getVendorName(), v) || contains(item.getVendorId(), v))
                .sorted(Comparator.comparing(InventoryItem::getProductName, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());
    }

    public List<String> vendors() {
        return itemRepository.findAll().stream()
                .map(InventoryItem::getVendorName)
                .filter(Objects::nonNull)
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
    }

    public InventoryItem get(Long id) {
        return itemRepository.findById(id).orElseThrow(() -> new InventoryException("Inventory item not found."));
    }

    public InventoryItem getBySku(String sku) {
        return itemRepository.findBySkuIgnoreCase(sku)
                .orElseThrow(() -> new InventoryException("No inventory item found for SKU " + sku + "."));
    }

    public InventoryItemForm toForm(InventoryItem item) {
        InventoryItemForm form = new InventoryItemForm();
        form.setId(item.getId());
        form.setSku(item.getSku());
        form.setProductName(item.getProductName());
        form.setCategory(item.getCategory());
        form.setExternalProductId(item.getExternalProductId());
        form.setVendorId(item.getVendorId());
        form.setVendorName(item.getVendorName());
        form.setQuantity(item.getQuantity());
        form.setReorderThreshold(item.getReorderThreshold());
        form.setUnitPrice(item.getUnitPrice());
        form.setLocationId(item.getLocation().getId());
        return form;
    }

    @Transactional
    public InventoryItem save(InventoryItemForm form) {
        String sku = form.getSku().trim().toUpperCase();
        StockLocation location = locationRepository.findById(form.getLocationId())
                .orElseThrow(() -> new InventoryException("Selected stock location does not exist."));
        if (!location.isActive()) {
            throw new InventoryException("Selected stock location is inactive.");
        }

        InventoryItem item;
        int previousQuantity = 0;
        boolean newItem = form.getId() == null;
        if (newItem) {
            if (itemRepository.existsBySkuIgnoreCase(sku)) {
                throw new InventoryException("SKU already exists. Use a unique SKU.");
            }
            item = new InventoryItem();
            item.setStatus(InventoryStatus.ACTIVE);
        } else {
            item = get(form.getId());
            previousQuantity = item.getQuantity();
            itemRepository.findBySkuIgnoreCase(sku)
                    .filter(other -> !other.getId().equals(item.getId()))
                    .ifPresent(other -> { throw new InventoryException("SKU already exists. Use a unique SKU."); });
        }

        item.setSku(sku);
        item.setProductName(form.getProductName().trim());
        item.setCategory(form.getCategory().trim());
        item.setExternalProductId(clean(form.getExternalProductId()));
        item.setVendorId(form.getVendorId().trim());
        item.setVendorName(form.getVendorName().trim());
        item.setQuantity(form.getQuantity());
        item.setReorderThreshold(form.getReorderThreshold());
        item.setUnitPrice(form.getUnitPrice());
        item.setLocation(location);

        InventoryItem saved = itemRepository.save(item);

        if (newItem) {
            recordTransaction(saved, TransactionType.INITIAL_STOCK, saved.getQuantity(), 0, saved.getQuantity(),
                    "Initial quantity added with inventory item", null, "System");
        } else if (previousQuantity != saved.getQuantity()) {
            int difference = saved.getQuantity() - previousQuantity;
            TransactionType type = difference > 0 ? TransactionType.MANUAL_INCREASE : TransactionType.MANUAL_DECREASE;
            recordTransaction(saved, type, difference, previousQuantity, saved.getQuantity(),
                    "Quantity changed from product edit form", null, "Inventory User");
        }

        evaluateLowStock(saved);
        return saved;
    }

    @Transactional
    public InventoryItem adjustStock(Long itemId, StockAdjustmentForm form) {
        if (form.getType() == null || form.getType() == TransactionType.INITIAL_STOCK) {
            throw new InventoryException("Select a valid stock adjustment type.");
        }
        return adjust(get(itemId), form.getType(), form.getQuantity(), form.getReferenceId(), form.getReason(), form.getPerformedBy());
    }

    @Transactional
    public InventoryItem applyExternalChange(String sku, int quantity, TransactionType type, String referenceId, String performedBy) {
        return adjust(getBySku(sku), type, quantity, referenceId,
                "Stock change received through inventory API", performedBy);
    }

    private InventoryItem adjust(InventoryItem item, TransactionType type, int quantity, String referenceId, String reason, String performedBy) {
        if (item.getStatus() != InventoryStatus.ACTIVE) {
            throw new InventoryException("Stock cannot be adjusted for a discontinued product.");
        }
        if (quantity <= 0) {
            throw new InventoryException("Quantity must be greater than zero.");
        }

        int before = item.getQuantity();
        int after;
        int signedChange;
        if (type.increasesStock()) {
            after = before + quantity;
            signedChange = quantity;
        } else if (type.decreasesStock()) {
            if (before < quantity) {
                throw new InventoryException("Insufficient stock. Available quantity is " + before + ".");
            }
            after = before - quantity;
            signedChange = -quantity;
        } else {
            throw new InventoryException("Unsupported stock adjustment type.");
        }

        item.setQuantity(after);
        InventoryItem saved = itemRepository.save(item);
        recordTransaction(saved, type, signedChange, before, after, clean(reason), clean(referenceId),
                clean(performedBy) == null ? "System" : clean(performedBy));
        evaluateLowStock(saved);
        return saved;
    }

    @Transactional
    public void discontinue(Long id) {
        InventoryItem item = get(id);
        item.setStatus(InventoryStatus.DISCONTINUED);
        itemRepository.save(item);
        resolveOpenAlert(item);
    }

    @Transactional
    public void reactivate(Long id) {
        InventoryItem item = get(id);
        item.setStatus(InventoryStatus.ACTIVE);
        itemRepository.save(item);
        evaluateLowStock(item);
    }

    public AvailabilityResponse availability(String sku, int requestedQuantity) {
        if (requestedQuantity < 1) requestedQuantity = 1;
        Optional<InventoryItem> optional = itemRepository.findBySkuIgnoreCase(sku);
        if (optional.isEmpty()) {
            return new AvailabilityResponse(sku, "Unknown product", 0, requestedQuantity, false, "NOT_FOUND");
        }
        InventoryItem item = optional.get();
        boolean available = item.getStatus() == InventoryStatus.ACTIVE && item.getQuantity() >= requestedQuantity;
        return new AvailabilityResponse(item.getSku(), item.getProductName(), item.getQuantity(), requestedQuantity,
                available, item.getStatus().name());
    }

    public DashboardSummary dashboardSummary() {
        List<InventoryItem> active = itemRepository.findByStatusOrderByProductNameAsc(InventoryStatus.ACTIVE);
        long low = active.stream().filter(InventoryItem::isLowStock).count();
        long out = active.stream().filter(InventoryItem::isOutOfStock).count();
        long units = active.stream().mapToLong(InventoryItem::getQuantity).sum();
        BigDecimal value = active.stream().map(InventoryItem::getStockValue).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new DashboardSummary(active.size(), low, out, units, value);
    }

    public List<StockAlert> openAlerts() {
        return alertRepository.findByStatusOrderByCreatedAtDesc(AlertStatus.OPEN);
    }

    public List<InventoryTransaction> recentTransactions() {
        return transactionRepository.findTop15ByOrderByCreatedAtDesc();
    }

    public List<InventoryTransaction> transactionsFor(Long itemId) {
        return transactionRepository.findByItemIdOrderByCreatedAtDesc(itemId);
    }

    public List<InventoryTransaction> allTransactions() {
        List<InventoryTransaction> all = transactionRepository.findAll();
        all.sort(Comparator.comparing(InventoryTransaction::getCreatedAt).reversed());
        return all;
    }

    public Map<String, Long> unitsByVendor() {
        return itemRepository.findByStatusOrderByProductNameAsc(InventoryStatus.ACTIVE).stream()
                .collect(Collectors.groupingBy(InventoryItem::getVendorName, TreeMap::new,
                        Collectors.summingLong(InventoryItem::getQuantity)));
    }

    public Map<String, Long> unitsByCategory() {
        return itemRepository.findByStatusOrderByProductNameAsc(InventoryStatus.ACTIVE).stream()
                .collect(Collectors.groupingBy(InventoryItem::getCategory, TreeMap::new,
                        Collectors.summingLong(InventoryItem::getQuantity)));
    }

    @Transactional
    public void resolveAlert(Long alertId) {
        StockAlert alert = alertRepository.findById(alertId).orElseThrow(() -> new InventoryException("Alert not found."));
        if (alert.getStatus() == AlertStatus.OPEN) {
            alert.setStatus(AlertStatus.RESOLVED);
            alert.setResolvedAt(LocalDateTime.now());
            alertRepository.save(alert);
        }
    }

    private void evaluateLowStock(InventoryItem item) {
        if (item.getStatus() != InventoryStatus.ACTIVE) {
            resolveOpenAlert(item);
            return;
        }
        if (item.getQuantity() <= item.getReorderThreshold()) {
            Optional<StockAlert> existing = alertRepository.findFirstByItemIdAndStatus(item.getId(), AlertStatus.OPEN);
            if (existing.isEmpty()) {
                StockAlert alert = new StockAlert();
                alert.setItem(item);
                alert.setQuantityAtAlert(item.getQuantity());
                alert.setReorderThreshold(item.getReorderThreshold());
                alert.setStatus(AlertStatus.OPEN);
                alertRepository.save(alert);
            }
        } else {
            resolveOpenAlert(item);
        }
    }

    private void resolveOpenAlert(InventoryItem item) {
        alertRepository.findFirstByItemIdAndStatus(item.getId(), AlertStatus.OPEN).ifPresent(alert -> {
            alert.setStatus(AlertStatus.RESOLVED);
            alert.setResolvedAt(LocalDateTime.now());
            alertRepository.save(alert);
        });
    }

    private void recordTransaction(InventoryItem item, TransactionType type, int quantityChanged,
                                   int before, int after, String reason, String referenceId, String performedBy) {
        InventoryTransaction tx = new InventoryTransaction();
        tx.setItem(item);
        tx.setType(type);
        tx.setQuantityChanged(quantityChanged);
        tx.setPreviousQuantity(before);
        tx.setNewQuantity(after);
        tx.setReason(reason);
        tx.setReferenceId(referenceId);
        tx.setPerformedBy(performedBy);
        transactionRepository.save(tx);
    }

    private String normalize(String text) {
        return text == null || text.isBlank() ? null : text.trim().toLowerCase(Locale.ROOT);
    }

    private boolean contains(String value, String query) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(query);
    }

    private String clean(String text) {
        return text == null || text.isBlank() ? null : text.trim();
    }
}
