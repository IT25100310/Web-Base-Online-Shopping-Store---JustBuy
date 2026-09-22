package com.justbuy.repository;

import com.justbuy.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    Optional<Driver> findByEmailIgnoreCase(String email);
}
