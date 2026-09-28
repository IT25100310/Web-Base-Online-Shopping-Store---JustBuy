package com.justbuy.repository;

import com.justbuy.model.SupportNotification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupportNotificationRepository extends JpaRepository<SupportNotification, Long> {
    List<SupportNotification> findByRecipientRoleAndRecipientIdOrderByCreatedAtDesc(String recipientRole, Long recipientId);
    long countByRecipientRoleAndRecipientIdAndReadAtIsNull(String recipientRole, Long recipientId);
}
