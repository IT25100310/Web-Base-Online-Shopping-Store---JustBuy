package com.justbuy.repository;

import com.justbuy.model.SupportAgent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SupportAgentRepository extends JpaRepository<SupportAgent, Long> {
    Optional<SupportAgent> findByEmailIgnoreCase(String email);
}
