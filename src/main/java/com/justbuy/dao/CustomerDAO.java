package com.justbuy.dao;

import com.justbuy.model.*;
import com.justbuy.util.DBConnection;
import java.sql.*;

public class CustomerDAO {

    public Customer getByUserId(int userId) throws SQLException {
        String sql = "SELECT c.*, u.* FROM Customers c JOIN Users u ON c.user_id = u.user_id WHERE c.user_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, userId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Customer c = mapCustomer(rs);
                User u = new UserDAO().getById(userId);
                c.setUser(u);
                return c;
            }
        }
        return null;
    }

    public Customer getById(int customerId) throws SQLException {
        String sql = "SELECT c.*, u.* FROM Customers c JOIN Users u ON c.user_id = u.user_id WHERE c.customer_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setInt(1, customerId);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Customer c = mapCustomer(rs);
                User u = new UserDAO().getById(c.getUserId());
                c.setUser(u);
                return c;
            }
        }
        return null;
    }

    public int create(Customer customer) throws SQLException {
        String sql = "INSERT INTO Customers (user_id, shipping_address, city, state, zip_code, country, profile_image) VALUES (?, ?, ?, ?, ?, ?, ?)";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            ps.setInt(1, customer.getUserId());
            ps.setString(2, customer.getShippingAddress());
            ps.setString(3, customer.getCity());
            ps.setString(4, customer.getState());
            ps.setString(5, customer.getZipCode());
            ps.setString(6, customer.getCountry());
            ps.setString(7, customer.getProfileImage());
            ps.executeUpdate();
            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) return rs.getInt(1);
        }
        return -1;
    }

    public void update(Customer customer) throws SQLException {
        String sql = "UPDATE Customers SET shipping_address = ?, city = ?, state = ?, zip_code = ?, country = ?, profile_image = ? WHERE customer_id = ?";
        try (Connection conn = DBConnection.getConnection();
             PreparedStatement ps = conn.prepareStatement(sql)) {
            ps.setString(1, customer.getShippingAddress());
            ps.setString(2, customer.getCity());
            ps.setString(3, customer.getState());
            ps.setString(4, customer.getZipCode());
            ps.setString(5, customer.getCountry());
            ps.setString(6, customer.getProfileImage());
            ps.setInt(7, customer.getCustomerId());
            ps.executeUpdate();
        }
    }

    private Customer mapCustomer(ResultSet rs) throws SQLException {
        Customer c = new Customer();
        c.setCustomerId(rs.getInt("customer_id"));
        c.setUserId(rs.getInt("user_id"));
        c.setShippingAddress(rs.getString("shipping_address"));
        c.setCity(rs.getString("city"));
        c.setState(rs.getString("state"));
        c.setZipCode(rs.getString("zip_code"));
        c.setCountry(rs.getString("country"));
        c.setProfileImage(rs.getString("profile_image"));
        return c;
    }
}