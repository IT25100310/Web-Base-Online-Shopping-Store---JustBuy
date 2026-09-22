package com.justbuy.repository;

import com.justbuy.model.AccountApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AccountApplicationRepository extends JpaRepository<AccountApplication, Long> {
    Optional<AccountApplication> findFirstByEmailIgnoreCaseAndRequestedRoleAndStatus(
            String email, String requestedRole, String status);

    List<AccountApplication> findByStatusIgnoreCase(String status);
}