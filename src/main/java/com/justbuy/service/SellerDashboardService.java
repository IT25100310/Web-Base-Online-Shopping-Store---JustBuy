package com.justbuy.service;

import com.justbuy.model.Order;
import com.justbuy.model.OrderItem;
import com.justbuy.model.Product;
import com.justbuy.model.Review;
import com.justbuy.model.Seller;
import com.justbuy.repository.OrderRepository;
import com.justbuy.repository.ProductRepository;
import com.justbuy.repository.ReviewRepository;
import com.justbuy.repository.SellerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SellerDashboardService {
    private static final BigDecimal COMMISSION = new BigDecimal("0.10");
    private final SellerRepository sellerRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard(Long sellerId) {
        Seller seller = sellerRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("Seller account not found."));
        List<Product> products = productRepository.findBySellerId(sellerId);
        Set<Long> productIds = products.stream().map(Product::getId).filter(Objects::nonNull).collect(Collectors.toSet());
        List<Order> orders = productIds.isEmpty() ? List.of() : orderRepository.findDistinctByItemProductIds(productIds);
        List<Review> reviews = productIds.isEmpty() ? List.of() : reviewRepository.findByProductIdInOrderByCreatedAtDesc(productIds);
        Set<String> productNames = products.stream().map(Product::getName).filter(Objects::nonNull).collect(Collectors.toSet());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("seller", sellerMap(seller));
        result.put("series", series(orders, productIds));
        result.put("productCount", products.size());
        result.put("pendingOrders", countStatus(orders, "PENDING") + countStatus(orders, "CONFIRMED"));
        result.put("pendingDeliveries", countStatus(orders, "PROCESSING") + countStatus(orders, "SHIPPED") + countStatus(orders, "IN_TRANSIT") + countStatus(orders, "OUT_FOR_DELIVERY"));
        result.put("newReviews", reviews.stream().filter(r -> r.getCreatedAt() != null && r.getCreatedAt().isAfter(LocalDateTime.now().minusDays(30))).count());
        result.put("pendingWithdrawals", Map.of("count", 0, "amount", 0));
        result.put("categories", categoryTotals(products, orders, productIds));
        result.put("topProducts", topProducts(products, orders, productIds));
        result.put("products", products.stream().map(this::productMap).toList());
        result.put("recentOrders", orders.stream().limit(6).map(o -> orderMap(o, productIds)).toList());
        result.put("orders", orders.stream().map(o -> orderMap(o, productIds)).toList());
        result.put("deliveries", orders.stream().filter(o -> !List.of("PENDING", "CANCELLED").contains(String.valueOf(o.getStatus()).toUpperCase())).map(o -> deliveryMap(o, productIds)).toList());
        result.put("lowStock", products.stream().filter(p -> p.getStock() == null || p.getStock() <= 10).sorted(Comparator.comparing(p -> Optional.ofNullable(p.getStock()).orElse(0))).map(this::lowStockMap).toList());
        result.put("reviews", reviews.stream().limit(10).map(this::reviewMap).toList());
        result.put("messages", List.of());
        result.put("notifications", notifications(orders, products, reviews));
        result.put("productNames", productNames);
        return result;
    }

    private Map<String, Object> sellerMap(Seller seller) {
        Map<String, Object> m = new LinkedHashMap<>();
        if (seller.getId() != null) m.put("id", seller.getId());
        if (seller.getName() != null) m.put("name", seller.getName());
        if (seller.getEmail() != null) m.put("email", seller.getEmail());
        if (seller.getLogoUrl() != null) m.put("logoUrl", seller.getLogoUrl());
        if (seller.getRating() != null) m.put("rating", seller.getRating());
        if (seller.getReviewCount() != null) m.put("reviewCount", seller.getReviewCount());
        if (seller.getLocation() != null) m.put("location", seller.getLocation());
        if (seller.getStatus() != null) m.put("status", seller.getStatus());
        if (seller.getVerified() != null) m.put("verified", seller.getVerified());
        return m;
    }

    private Map<String, Object> series(List<Order> orders, Set<Long> productIds) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("day", seriesFor(orders, productIds, 14, ChronoUnit.DAYS));
        result.put("week", seriesFor(orders, productIds, 12, ChronoUnit.WEEKS));
        result.put("month", seriesFor(orders, productIds, 12, ChronoUnit.MONTHS));
        return result;
    }

    private Map<String, Object> seriesFor(List<Order> orders, Set<Long> productIds, int count, ChronoUnit unit) {
        List<BigDecimal> sales = new ArrayList<>();
        List<Integer> orderCounts = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int index = count - 1; index >= 0; index--) {
            LocalDate start;
            LocalDate end;
            if (unit == ChronoUnit.DAYS) {
                start = today.minusDays(index); end = start.plusDays(1);
            } else if (unit == ChronoUnit.WEEKS) {
                start = today.minusWeeks(index).minusDays(6); end = today.minusWeeks(index).plusDays(1);
            } else {
                YearMonth month = YearMonth.now().minusMonths(index); start = month.atDay(1); end = month.plusMonths(1).atDay(1);
            }
            List<Order> bucket = orders.stream().filter(o -> inRange(o, start, end)).toList();
            sales.add(bucket.stream().map(o -> sellerSubtotal(o, productIds)).reduce(BigDecimal.ZERO, BigDecimal::add));
            orderCounts.add(bucket.size());
        }
        return Map.of("sales", sales, "orders", orderCounts);
    }

    private List<Map<String, Object>> categoryTotals(List<Product> products, List<Order> orders, Set<Long> productIds) {
        Map<String, BigDecimal> totals = new LinkedHashMap<>();
        for (Product product : products) {
            String category = product.getCategory() == null ? "Uncategorized" : product.getCategory().getName();
            BigDecimal revenue = orders.stream().map(o -> o.getItems().stream()
                            .filter(i -> Objects.equals(i.getProductId(), product.getId()))
                            .map(i -> itemRevenue(o, i)).reduce(BigDecimal.ZERO, BigDecimal::add))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            totals.merge(category, revenue, BigDecimal::add);
        }
        return totals.entrySet().stream().sorted(Map.Entry.<String, BigDecimal>comparingByValue().reversed()).map(e -> {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("name", e.getKey()); row.put("value", e.getValue());
            return row;
        }).toList();
    }

    private List<Map<String, Object>> topProducts(List<Product> products, List<Order> orders, Set<Long> productIds) {
        List<Map<String, Object>> result = new ArrayList<>();
        for (Product product : products) {
            int units = orders.stream().filter(o -> !"CANCELLED".equalsIgnoreCase(o.getStatus())).flatMap(o -> o.getItems().stream()).filter(i -> Objects.equals(i.getProductId(), product.getId())).mapToInt(i -> Optional.ofNullable(i.getQuantity()).orElse(0)).sum();
            BigDecimal revenue = orders.stream().map(o -> o.getItems().stream().filter(i -> Objects.equals(i.getProductId(), product.getId())).map(i -> itemRevenue(o, i)).reduce(BigDecimal.ZERO, BigDecimal::add)).reduce(BigDecimal.ZERO, BigDecimal::add);
            result.add(Map.of("name", product.getName(), "units", units, "revenue", revenue, "img", Optional.ofNullable(product.getThumbnailUrl()).orElse("product")));
        }
        return result.stream().sorted((a, b) -> ((BigDecimal) b.get("revenue")).compareTo((BigDecimal) a.get("revenue"))).limit(5).toList();
    }

    private Map<String, Object> orderMap(Order order, Set<Long> productIds) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", order.getId()); m.put("orderNumber", order.getOrderNumber()); m.put("customer", order.getCustomerName());
        m.put("email", order.getCustomerEmail()); m.put("address", order.getShippingAddress()); m.put("total", sellerSubtotal(order, productIds));
        m.put("status", order.getStatus()); m.put("createdAt", order.getCreatedAt()); m.put("time", order.getCreatedAt() == null ? "" : order.getCreatedAt().toString());
        m.put("items", order.getItems().stream().filter(i -> productIds.contains(i.getProductId())).map(i -> Map.of("name", i.getProductName(), "qty", Optional.ofNullable(i.getQuantity()).orElse(0), "price", Optional.ofNullable(i.getPrice()).orElse(BigDecimal.ZERO))).toList());
        return m;
    }

    private Map<String, Object> lowStockMap(Product p) { return Map.of("name", p.getName(), "variant", p.getCategory() == null ? "" : p.getCategory().getName(), "stock", Optional.ofNullable(p.getStock()).orElse(0)); }
    private Map<String, Object> productMap(Product p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", "PRD-" + p.getId()); m.put("backendId", p.getId()); m.put("sku", "PRD-" + p.getId());
        m.put("name", p.getName()); m.put("category", p.getCategory() == null ? "Uncategorized" : p.getCategory().getName());
        m.put("price", Optional.ofNullable(p.getPrice()).orElse(BigDecimal.ZERO)); m.put("stock", Optional.ofNullable(p.getStock()).orElse(0));
        m.put("status", Boolean.FALSE.equals(p.getFeatured()) && Boolean.FALSE.equals(p.getFlashDeal()) ? "active" : "active");
        m.put("img", Optional.ofNullable(p.getThumbnailUrl()).orElse("product"));
        return m;
    }
    private Map<String, Object> deliveryMap(Order o, Set<Long> productIds) {
        Map<String, Object> m = new LinkedHashMap<>();
        String status = String.valueOf(o.getStatus()).toUpperCase();
        String deliveryStatus = "DELIVERED".equals(status) || "COMPLETED".equals(status) ? "delivered" : "SHIPPED".equals(status) ? "shipped" : "processing";
        m.put("id", "DL-" + o.getId()); m.put("orderId", o.getOrderNumber()); m.put("customer", o.getCustomerName());
        m.put("address", o.getShippingAddress()); m.put("carrier", "JustBuy Logistics"); m.put("tracking", o.getTrackingNumber()); m.put("status", deliveryStatus); m.put("updatedAt", o.getUpdatedAt());
        return m;
    }
    private Map<String, Object> reviewMap(Review r) { return Map.of("product", r.getProduct() == null ? "" : r.getProduct().getName(), "rating", Optional.ofNullable(r.getRating()).orElse(0), "text", Optional.ofNullable(r.getComment()).orElse(""), "who", Optional.ofNullable(r.getAuthorName()).orElse("Customer"), "time", r.getCreatedAt() == null ? "" : r.getCreatedAt().toString()); }
    private List<Map<String, Object>> notifications(List<Order> orders, List<Product> products, List<Review> reviews) {
        List<Map<String, Object>> result = new ArrayList<>();
        orders.stream().filter(o -> "PENDING".equalsIgnoreCase(o.getStatus()) || "CONFIRMED".equalsIgnoreCase(o.getStatus())).limit(5).forEach(o -> result.add(Map.of("icon", "🛒", "text", "Order " + o.getOrderNumber() + " needs processing", "time", String.valueOf(o.getCreatedAt()), "unread", true)));
        products.stream().filter(p -> p.getStock() == null || p.getStock() <= 10).limit(5).forEach(p -> result.add(Map.of("icon", "📦", "text", p.getName() + " has low stock", "time", String.valueOf(p.getUpdatedAt()), "unread", true)));
        reviews.stream().limit(5).forEach(r -> result.add(Map.of("icon", "⭐", "text", "New review for " + (r.getProduct() == null ? "product" : r.getProduct().getName()), "time", String.valueOf(r.getCreatedAt()), "unread", true)));
        return result;
    }

    private long countStatus(List<Order> orders, String status) { return orders.stream().filter(o -> status.equalsIgnoreCase(o.getStatus())).count(); }
    private boolean inRange(Order o, LocalDate start, LocalDate end) { return o.getCreatedAt() != null && !o.getCreatedAt().toLocalDate().isBefore(start) && o.getCreatedAt().toLocalDate().isBefore(end) && !"CANCELLED".equalsIgnoreCase(o.getStatus()); }
    private BigDecimal sellerSubtotal(Order o, Set<Long> productIds) { return o.getItems().stream().filter(i -> productIds.contains(i.getProductId())).map(i -> itemRevenue(o, i)).reduce(BigDecimal.ZERO, BigDecimal::add); }
    private BigDecimal itemRevenue(Order o, OrderItem i) { return "CANCELLED".equalsIgnoreCase(o.getStatus()) ? BigDecimal.ZERO : Optional.ofNullable(i.getSubtotal()).orElse(Optional.ofNullable(i.getPrice()).orElse(BigDecimal.ZERO).multiply(BigDecimal.valueOf(Optional.ofNullable(i.getQuantity()).orElse(0)))); }
}
