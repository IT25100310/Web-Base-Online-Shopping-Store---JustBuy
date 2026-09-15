package com.justbuy.dao;

import com.justbuy.model.*;
import com.justbuy.util.DBConnection;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class SellerDAO {

    public Seller getByUserId(int userId) throws SQLException {
        String sql = "SELECT * FROM Sellers WHERE user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) return mapSeller(rs);
        }
        return null;
    }

    public Seller getById(int sellerId) throws SQLException {
        String sql = "SELECT * FROM Sellers WHERE seller_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, sellerId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Seller s = mapSeller(rs);
                s.setUser(new UserDAO().getById(s.getUserId()));
                return s;
            }
        }
        return null;
    }

    public int create(Seller seller) throws SQLException {
        String sql = "INSERT INTO Sellers (user_id, business_name, business_description, business_address, business_phone, business_email, logo, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, seller.getUserId());
            ps.setString(2, seller.getBusinessName());
            ps.setString(3, seller.getBusinessDescription());
            ps.setString(4, seller.getBusinessAddress());
            ps.setString(5, seller.getBusinessPhone());
            ps.setString(6, seller.getBusinessEmail());
            ps.setString(7, seller.getLogo());
            ps.setString(8, seller.getStatus());
            ps.executeUpdate();
            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) return rs.getInt(1);
        }
        return -1;
    }

    public void update(Seller seller) throws SQLException {
        String sql = "UPDATE Sellers SET business_name = ?, business_description = ?, business_address = ?, business_phone = ?, business_email = ?, logo = ? WHERE seller_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, seller.getBusinessName());
            ps.setString(2, seller.getBusinessDescription());
            ps.setString(3, seller.getBusinessAddress());
            ps.setString(4, seller.getBusinessPhone());
            ps.setString(5, seller.getBusinessEmail());
            ps.setString(6, seller.getLogo());
            ps.setInt(7, seller.getSellerId());
            ps.executeUpdate();
        }
    }

    public List<Seller> getAll() throws SQLException {
        List<Seller> list = new ArrayList<>();
        String sql = "SELECT s.*, u.email, u.full_name, u.phone FROM Sellers s JOIN Users u ON s.user_id = u.user_id ORDER BY s.registration_date DESC";
        try (Connection conn = DBConnection.getConnection();
             Statement st = conn.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                Seller s = mapSeller(rs);
                s.setUser(new UserDAO().getById(s.getUserId()));
                list.add(s);
            }
        }
        return list;
    }

    public List<Seller> getByStatus(String status) throws SQLException {
        List<Seller> list = new ArrayList<>();
        String sql = "SELECT s.*, u.email, u.full_name, u.phone FROM Sellers s JOIN Users u ON s.user_id = u.user_id WHERE s.status = ? ORDER BY s.registration_date DESC";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                Seller s = mapSeller(rs);
                s.setUser(new UserDAO().getById(s.getUserId()));
                list.add(s);
            }
        }
        return list;
    }

    public void updateStatus(int sellerId, String status, int approvedBy) throws SQLException {
        String sql = "UPDATE Sellers SET status = ?, approved_at = GETDATE(), approved_by = ? WHERE seller_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, approvedBy);
            ps.setInt(3, sellerId);
            ps.executeUpdate();
        }
    }

    private Seller mapSeller(ResultSet rs) throws SQLException {
        Seller s = new Seller();
        s.setSellerId(rs.getInt("seller_id"));
        s.setUserId(rs.getInt("user_id"));
        s.setBusinessName(rs.getString("business_name"));
        s.setBusinessDescription(rs.getString("business_description"));
        s.setBusinessAddress(rs.getString("business_address"));
        s.setBusinessPhone(rs.getString("business_phone"));
        s.setBusinessEmail(rs.getString("business_email"));
        s.setLogo(rs.getString("logo"));
        s.setStatus(rs.getString("status"));
        s.setRegistrationDate(rs.getTimestamp("registration_date"));
        s.setApprovedAt(rs.getTimestamp("approved_at"));
        s.setApprovedBy(rs.getInt("approved_by"));
        if (rs.wasNull()) s.setApprovedBy(null);
        return s;
    }
}