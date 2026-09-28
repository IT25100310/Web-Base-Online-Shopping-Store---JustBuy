package com.justbuy.repository;

import com.justbuy.model.SupportRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupportRequestRepository extends JpaRepository<SupportRequest, Long> {
    List<SupportRequest> findAllByOrderByUpdatedAtDesc();
    List<SupportRequest> findByStatusIgnoreCaseOrderByUpdatedAtDesc(String status);
    List<SupportRequest> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    long countByStatusIgnoreCase(String status);
}
