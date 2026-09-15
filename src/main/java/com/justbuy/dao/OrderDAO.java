package com.justbuy.dao;

import com.justbuy.model.*;
import com.justbuy.util.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class OrderDAO {

    public Order getById(int orderId) throws SQLException {
        String sql = "EXEC sp_GetOrderDetails ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, orderId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Order o = mapOrder(rs);
                o.setItems(getOrderItems(orderId));
                return o;
            }
        }
        return null;
    }

    public List<Order> getByCustomer(int customerId) throws SQLException {
        List<Order> list = new ArrayList<>();
        String sql = "SELECT o.*, u.full_name as customer_name, u.email as customer_email FROM Orders o " +
                "JOIN Customers c ON o.customer_id = c.customer_id JOIN Users u ON c.user_id = u.user_id " +
                "WHERE o.customer_id = ? ORDER BY o.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, customerId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Order o = mapOrder(rs);
                o.setItems(getOrderItems(o.getOrderId()));
                list.add(o);
            }
        }
        return list;
    }

    public List<Order> getAll() throws SQLException {
        List<Order> list = new ArrayList<>();
        String sql = "EXEC sp_GetAllOrders";
        try (Connection conn = DBConnection.getConnection();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                Order o = mapOrder(rs);
                o.setItems(getOrderItems(o.getOrderId()));
                list.add(o);
            }
        }
        return list;
    }

    public int create(Order order) throws SQLException {
        String sql = "EXEC sp_CreateOrder ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?";
        try (Connection conn = DBConnection.getConnection();
             CallableStatement cs = conn.prepareCall(sql)) {
            cs.setInt(1, order.getCustomerId());
            cs.setString(2, order.getOrderNumber());
            cs.setDouble(3, order.getTotalAmount());
            cs.setDouble(4, order.getDiscountAmount());
            cs.setDouble(5, order.getDeliveryCharge());
            cs.setDouble(6, order.getFinalAmount());
            cs.setString(7, order.getShippingAddress());
            cs.setString(8, order.getShippingCity());
            cs.setString(9, order.getShippingState());
            cs.setString(10, order.getShippingZip());
            cs.setString(11, order.getShippingCountry());
            cs.setString(12, order.getPaymentMethod());
            cs.setString(13, order.getNotes());
            ResultSet rs = cs.executeQuery();
            if (rs.next()) return rs.getInt("order_id");
        }
        return -1;
    }

    public void addOrderItem(OrderItem item) throws SQLException {
        String sql = "INSERT INTO OrderItems (order_id, product_id, seller_id, quantity, unit_price, total_price, status) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, item.getOrderId());
            ps.setInt(2, item.getProductId());
            ps.setInt(3, item.getSellerId());
            ps.setInt(4, item.getQuantity());
            ps.setDouble(5, item.getUnitPrice());
            ps.setDouble(6, item.getTotalPrice());
            ps.setString(7, item.getStatus());
            ps.executeUpdate();
        }
    }

    public void updateStatus(int orderId, String status) throws SQLException {
        String sql = "UPDATE Orders SET status = ?, updated_at = GETDATE() WHERE order_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, orderId);
            ps.executeUpdate();
        }
    }

    public void cancelOrder(int orderId, String reason) throws SQLException {
        String sql = "EXEC sp_CancelOrder ?, ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, orderId);
            ps.setString(2, reason);
            ps.execute();
        }
    }

    public List<OrderItem> getOrderItems(int orderId) throws SQLException {
        List<OrderItem> list = new ArrayList<>();
        String sql = "EXEC sp_GetOrderItems ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, orderId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                OrderItem item = new OrderItem();
                item.setOrderItemId(rs.getInt("order_item_id"));
                item.setOrderId(rs.getInt("order_id"));
                item.setProductId(rs.getInt("product_id"));
                item.setSellerId(rs.getInt("seller_id"));
                item.setQuantity(rs.getInt("quantity"));
                item.setUnitPrice(rs.getDouble("unit_price"));
                item.setTotalPrice(rs.getDouble("total_price"));
                item.setStatus(rs.getString("status"));
                item.setProductName(rs.getString("product_name"));
                item.setProductSku(rs.getString("sku"));
                item.setProductImage(rs.getString("product_image"));
                item.setSellerName(rs.getString("seller_name"));
                list.add(item);
            }
        }
        return list;
    }

    private Order mapOrder(ResultSet rs) throws SQLException {
        Order o = new Order();
        o.setOrderId(rs.getInt("order_id"));
        o.setCustomerId(rs.getInt("customer_id"));
        o.setOrderNumber(rs.getString("order_number"));
        o.setTotalAmount(rs.getDouble("total_amount"));
        o.setDiscountAmount(rs.getDouble("discount_amount"));
        o.setDeliveryCharge(rs.getDouble("delivery_charge"));
        o.setFinalAmount(rs.getDouble("final_amount"));
        o.setShippingAddress(rs.getString("shipping_address"));
        o.setShippingCity(rs.getString("shipping_city"));
        o.setShippingState(rs.getString("shipping_state"));
        o.setShippingZip(rs.getString("shipping_zip"));
        o.setShippingCountry(rs.getString("shipping_country"));
        o.setPaymentMethod(rs.getString("payment_method"));
        o.setNotes(rs.getString("notes"));
        o.setStatus(rs.getString("status"));
        o.setCreatedAt(rs.getTimestamp("created_at"));
        o.setUpdatedAt(rs.getTimestamp("updated_at"));

        // Only present when joined with Customers/Users (e.g. getByCustomer)
        try {
            o.setCustomerName(rs.getString("customer_name"));
            o.setCustomerEmail(rs.getString("customer_email"));
        } catch (SQLException ignored) {
            // columns not present in this result set (e.g. sp_GetOrderDetails / sp_GetAllOrders)
        }

        return o;
    }
}