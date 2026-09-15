package com.justbuy.dao;

import com.justbuy.model.*;
import com.justbuy.util.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CartDAO {

    public List<CartItem> getCartItems(int customerId) throws SQLException {
        List<CartItem> list = new ArrayList<>();
        String sql = "EXEC sp_GetCartItems ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, customerId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                CartItem item = new CartItem();
                item.setCartItemId(rs.getInt("cart_item_id"));
                item.setCartId(rs.getInt("cart_id"));
                item.setProductId(rs.getInt("product_id"));
                item.setQuantity(rs.getInt("quantity"));
                item.setProductName(rs.getString("name"));
                item.setPrice(rs.getDouble("price"));
                double dp = rs.getDouble("discount_price");
                if (!rs.wasNull()) item.setDiscountPrice(dp);
                item.setStockQuantity(rs.getInt("stock_quantity"));
                item.setPrimaryImage(rs.getString("primary_image"));
                item.setSellerName(rs.getString("seller_name"));
                list.add(item);
            }
        }
        return list;
    }

    public void addToCart(int customerId, int productId, int quantity) throws SQLException {
        String sql = "EXEC sp_AddToCart ?, ?, ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, customerId);
            ps.setInt(2, productId);
            ps.setInt(3, quantity);
            ps.execute();
        }
    }

    public void updateQuantity(int cartItemId, int quantity) throws SQLException {
        String sql = "UPDATE CartItems SET quantity = ? WHERE cart_item_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, quantity);
            ps.setInt(2, cartItemId);
            ps.executeUpdate();
        }
    }

    public void removeItem(int cartItemId) throws SQLException {
        String sql = "DELETE FROM CartItems WHERE cart_item_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, cartItemId);
            ps.executeUpdate();
        }
    }

    public void clearCart(int customerId) throws SQLException {
        String sql = "DELETE FROM ci FROM CartItems ci JOIN Cart c ON ci.cart_id = c.cart_id WHERE c.customer_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, customerId);
            ps.executeUpdate();
        }
    }
}