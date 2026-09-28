package com.justbuy.repository;

import com.justbuy.model.ChatConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChatConversationRepository extends JpaRepository<ChatConversation, Long> {
    Optional<ChatConversation> findByCustomerIdAndSellerId(Long customerId, Long sellerId);
    List<ChatConversation> findByCustomerIdOrderByUpdatedAtDesc(Long customerId);
    List<ChatConversation> findBySellerIdOrderByUpdatedAtDesc(Long sellerId);
}
