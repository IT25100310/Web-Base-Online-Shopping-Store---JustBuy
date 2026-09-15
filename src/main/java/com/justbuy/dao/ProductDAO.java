package com.justbuy.dao;

import com.justbuy.model.*;
import com.justbuy.util.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ProductDAO {

    public Product getById(int id) throws SQLException {
        String sql = "EXEC sp_GetProductDetails ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Product p = mapProduct(rs);
                p.setImages(getProductImages(id));
                return p;
            }
        }
        return null;
    }

    public List<Product> getAll() throws SQLException {
        List<Product> list = new ArrayList<>();
        String sql = "SELECT p.*, c.name as category_name, s.business_name as seller_name, " +
                "(SELECT TOP 1 image_url FROM ProductImages WHERE product_id = p.product_id AND is_primary = 1) as primary_image, " +
                "(SELECT AVG(CAST(rating AS DECIMAL(3,1))) FROM Reviews WHERE product_id = p.product_id) as avg_rating, " +
                "(SELECT COUNT(*) FROM Reviews WHERE product_id = p.product_id) as review_count " +
                "FROM Products p JOIN Categories c ON p.category_id = c.category_id JOIN Sellers s ON p.seller_id = s.seller_id " +
                "WHERE p.is_active = 1 ORDER BY p.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) list.add(mapProduct(rs));
        }
        return list;
    }

    public List<Product> getFeatured() throws SQLException {
        List<Product> list = new ArrayList<>();
        String sql = "SELECT p.*, c.name as category_name, s.business_name as seller_name, " +
                "(SELECT TOP 1 image_url FROM ProductImages WHERE product_id = p.product_id AND is_primary = 1) as primary_image, " +
                "(SELECT AVG(CAST(rating AS DECIMAL(3,1))) FROM Reviews WHERE product_id = p.product_id) as avg_rating, " +
                "(SELECT COUNT(*) FROM Reviews WHERE product_id = p.product_id) as review_count " +
                "FROM Products p JOIN Categories c ON p.category_id = c.category_id JOIN Sellers s ON p.seller_id = s.seller_id " +
                "WHERE p.is_active = 1 AND p.is_featured = 1 ORDER BY p.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) list.add(mapProduct(rs));
        }
        return list;
    }

    public List<Product> search(String term, Integer categoryId, Double minPrice, Double maxPrice, Integer sellerId, Integer minRating, String sortBy) throws SQLException {
        List<Product> list = new ArrayList<>();
        String sql = "EXEC sp_SearchProducts ?, ?, ?, ?, ?, ?, ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, term);
            if (categoryId != null) ps.setInt(2, categoryId); else ps.setNull(2, Types.INTEGER);
            if (minPrice != null) ps.setDouble(3, minPrice); else ps.setNull(3, Types.DECIMAL);
            if (maxPrice != null) ps.setDouble(4, maxPrice); else ps.setNull(4, Types.DECIMAL);
            if (sellerId != null) ps.setInt(5, sellerId); else ps.setNull(5, Types.INTEGER);
            if (minRating != null) ps.setInt(6, minRating); else ps.setNull(6, Types.INTEGER);
            ps.setString(7, sortBy != null ? sortBy : "newest");
            ResultSet rs = ps.executeQuery();
            while (rs.next()) list.add(mapProduct(rs));
        }
        return list;
    }

    public List<Product> getBySeller(int sellerId) throws SQLException {
        List<Product> list = new ArrayList<>();
        String sql = "EXEC sp_GetSellerProducts ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, sellerId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) list.add(mapProduct(rs));
        }
        return list;
    }

    public List<Product> getByCategory(int categoryId) throws SQLException {
        List<Product> list = new ArrayList<>();
        String sql = "SELECT p.*, c.name as category_name, s.business_name as seller_name, " +
                "(SELECT TOP 1 image_url FROM ProductImages WHERE product_id = p.product_id AND is_primary = 1) as primary_image, " +
                "(SELECT AVG(CAST(rating AS DECIMAL(3,1))) FROM Reviews WHERE product_id = p.product_id) as avg_rating, " +
                "(SELECT COUNT(*) FROM Reviews WHERE product_id = p.product_id) as review_count " +
                "FROM Products p JOIN Categories c ON p.category_id = c.category_id JOIN Sellers s ON p.seller_id = s.seller_id " +
                "WHERE p.is_active = 1 AND p.category_id = ? ORDER BY p.created_at DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, categoryId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) list.add(mapProduct(rs));
        }
        return list;
    }

    public int create(Product p) throws SQLException {
        String sql = "INSERT INTO Products (seller_id, category_id, name, description, price, discount_price, stock_quantity, low_stock_threshold, sku, weight, dimensions, is_active, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, p.getSellerId());
            ps.setInt(2, p.getCategoryId());
            ps.setString(3, p.getName());
            ps.setString(4, p.getDescription());
            ps.setDouble(5, p.getPrice());
            if (p.getDiscountPrice() != null) ps.setDouble(6, p.getDiscountPrice()); else ps.setNull(6, Types.DECIMAL);
            ps.setInt(7, p.getStockQuantity());
            ps.setInt(8, p.getLowStockThreshold());
            ps.setString(9, p.getSku());
            if (p.getWeight() != null) ps.setDouble(10, p.getWeight()); else ps.setNull(10, Types.DECIMAL);
            ps.setString(11, p.getDimensions());
            ps.setBoolean(12, p.isActive());
            ps.setBoolean(13, p.isFeatured());
            ps.executeUpdate();
            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) return rs.getInt(1);
        }
        return -1;
    }

    public void update(Product p) throws SQLException {
        String sql = "UPDATE Products SET category_id = ?, name = ?, description = ?, price = ?, discount_price = ?, stock_quantity = ?, low_stock_threshold = ?, sku = ?, weight = ?, dimensions = ?, is_active = ?, is_featured = ?, updated_at = GETDATE() WHERE product_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, p.getCategoryId());
            ps.setString(2, p.getName());
            ps.setString(3, p.getDescription());
            ps.setDouble(4, p.getPrice());
            if (p.getDiscountPrice() != null) ps.setDouble(5, p.getDiscountPrice()); else ps.setNull(5, Types.DECIMAL);
            ps.setInt(6, p.getStockQuantity());
            ps.setInt(7, p.getLowStockThreshold());
            ps.setString(8, p.getSku());
            if (p.getWeight() != null) ps.setDouble(9, p.getWeight()); else ps.setNull(9, Types.DECIMAL);
            ps.setString(10, p.getDimensions());
            ps.setBoolean(11, p.isActive());
            ps.setBoolean(12, p.isFeatured());
            ps.setInt(13, p.getProductId());
            ps.executeUpdate();
        }
    }

    public void updateStock(int productId, int quantity) throws SQLException {
        String sql = "UPDATE Products SET stock_quantity = stock_quantity + ? WHERE product_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, quantity);
            ps.setInt(2, productId);
            ps.executeUpdate();
        }
    }

    public void delete(int id) throws SQLException {
        String sql = "UPDATE Products SET is_active = 0 WHERE product_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    public void addImage(ProductImage img) throws SQLException {
        String sql = "INSERT INTO ProductImages (product_id, image_url, is_primary, sort_order) VALUES (?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, img.getProductId());
            ps.setString(2, img.getImageUrl());
            ps.setBoolean(3, img.isPrimary());
            ps.setInt(4, img.getSortOrder());
            ps.executeUpdate();
        }
    }

    public List<ProductImage> getProductImages(int productId) throws SQLException {
        List<ProductImage> list = new ArrayList<>();
        String sql = "SELECT * FROM ProductImages WHERE product_id = ? ORDER BY is_primary DESC, sort_order ASC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, productId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                ProductImage img = new ProductImage();
                img.setImageId(rs.getInt("image_id"));
                img.setProductId(rs.getInt("product_id"));
                img.setImageUrl(rs.getString("image_url"));
                img.setPrimary(rs.getBoolean("is_primary"));
                img.setSortOrder(rs.getInt("sort_order"));
                list.add(img);
            }
        }
        return list;
    }

    private Product mapProduct(ResultSet rs) throws SQLException {
        Product p = new Product();
        p.setProductId(rs.getInt("product_id"));
        p.setSellerId(rs.getInt("seller_id"));
        p.setCategoryId(rs.getInt("category_id"));
        p.setName(rs.getString("name"));
        p.setDescription(rs.getString("description"));
        p.setPrice(rs.getDouble("price"));
        double dp = rs.getDouble("discount_price");
        if (!rs.wasNull()) p.setDiscountPrice(dp);
        p.setStockQuantity(rs.getInt("stock_quantity"));
        p.setLowStockThreshold(rs.getInt("low_stock_threshold"));
        p.setSku(rs.getString("sku"));
        double w = rs.getDouble("weight");
        if (!rs.wasNull()) p.setWeight(w);
        p.setDimensions(rs.getString("dimensions"));
        p.setActive(rs.getBoolean("is_active"));
        p.setFeatured(rs.getBoolean("is_featured"));
        p.setCreatedAt(rs.getTimestamp("created_at"));
        p.setUpdatedAt(rs.getTimestamp("updated_at"));

        try { p.setCategoryName(rs.getString("category_name")); } catch (SQLException e) {}
        try { p.setSellerName(rs.getString("seller_name")); } catch (SQLException e) {}
        try { p.setPrimaryImage(rs.getString("primary_image")); } catch (SQLException e) {}
        try {
            double ar = rs.getDouble("avg_rating");
            if (!rs.wasNull()) p.setAvgRating(ar);
        } catch (SQLException e) {}
        try { p.setReviewCount(rs.getInt("review_count")); } catch (SQLException e) {}

        return p;
    }
}