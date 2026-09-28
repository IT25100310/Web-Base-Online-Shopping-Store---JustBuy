package com.justbuy.repository;

import com.justbuy.model.SupportTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {
    List<SupportTicket> findAllByOrderByUpdatedAtDesc();
    List<SupportTicket> findByAssignedAgentIdOrderByUpdatedAtDesc(Long agentId);
    List<SupportTicket> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    Optional<SupportTicket> findByTicketNumberIgnoreCase(String ticketNumber);
    long countByStatusIgnoreCase(String status);
    long countByPriorityIgnoreCase(String priority);
}
