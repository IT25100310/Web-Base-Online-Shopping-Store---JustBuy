package com.justbuy.dao;

import com.justbuy.model.*;
import com.justbuy.util.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class CategoryDAO {

    public List<Category> getAll() throws SQLException {
        List<Category> list = new ArrayList<>();
        String sql = "SELECT * FROM Categories WHERE is_active = 1 ORDER BY name";
        try (Connection conn = DBConnection.getConnection();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) list.add(mapCategory(rs));
        }
        return list;
    }

    public List<Category> getParentCategories() throws SQLException {
        List<Category> list = new ArrayList<>();
        String sql = "SELECT * FROM Categories WHERE parent_category_id IS NULL AND is_active = 1 ORDER BY name";
        try (Connection conn = DBConnection.getConnection();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) list.add(mapCategory(rs));
        }
        return list;
    }

    public List<Category> getSubcategories(int parentId) throws SQLException {
        List<Category> list = new ArrayList<>();
        String sql = "SELECT * FROM Categories WHERE parent_category_id = ? AND is_active = 1 ORDER BY name";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, parentId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) list.add(mapCategory(rs));
        }
        return list;
    }

    public Category getById(int id) throws SQLException {
        String sql = "SELECT * FROM Categories WHERE category_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapCategory(rs);
        }
        return null;
    }

    public int create(Category c) throws SQLException {
        String sql = "INSERT INTO Categories (name, description, image_url, parent_category_id, is_active) VALUES (?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setString(1, c.getName());
            ps.setString(2, c.getDescription());
            ps.setString(3, c.getImageUrl());
            if (c.getParentCategoryId() != null) ps.setInt(4, c.getParentCategoryId()); else ps.setNull(4, Types.INTEGER);
            ps.setBoolean(5, c.isActive());
            ps.executeUpdate();
            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) return rs.getInt(1);
        }
        return -1;
    }

    public void update(Category c) throws SQLException {
        String sql = "UPDATE Categories SET name = ?, description = ?, image_url = ?, parent_category_id = ?, is_active = ? WHERE category_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, c.getName());
            ps.setString(2, c.getDescription());
            ps.setString(3, c.getImageUrl());
            if (c.getParentCategoryId() != null) ps.setInt(4, c.getParentCategoryId()); else ps.setNull(4, Types.INTEGER);
            ps.setBoolean(5, c.isActive());
            ps.setInt(6, c.getCategoryId());
            ps.executeUpdate();
        }
    }

    public void delete(int id) throws SQLException {
        String sql = "UPDATE Categories SET is_active = 0 WHERE category_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, id);
            ps.executeUpdate();
        }
    }

    private Category mapCategory(ResultSet rs) throws SQLException {
        Category c = new Category();
        c.setCategoryId(rs.getInt("category_id"));
        c.setName(rs.getString("name"));
        c.setDescription(rs.getString("description"));
        c.setImageUrl(rs.getString("image_url"));
        int pid = rs.getInt("parent_category_id");
        if (!rs.wasNull()) c.setParentCategoryId(pid);
        c.setActive(rs.getBoolean("is_active"));
        c.setCreatedAt(rs.getTimestamp("created_at"));
        return c;
    }
}