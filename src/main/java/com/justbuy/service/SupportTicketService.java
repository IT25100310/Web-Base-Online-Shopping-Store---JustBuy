package com.justbuy.service;

import com.justbuy.model.KnowledgeArticle;
import com.justbuy.model.SupportMessage;
import com.justbuy.model.SupportNotification;
import com.justbuy.model.SupportRequest;
import com.justbuy.model.SupportTicket;
import com.justbuy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional
public class SupportTicketService {
    private final SupportTicketRepository ticketRepository;
    private final SupportMessageRepository messageRepository;
    private final SupportRequestRepository requestRepository;
    private final KnowledgeArticleRepository articleRepository;
    private final SupportNotificationRepository notificationRepository;
    private final SupportAgentRepository agentRepository;

    public List<SupportTicket> listTickets(String status, String priority, Long agentId, Long customerId, String query) {
        List<SupportTicket> source = agentId != null ? ticketRepository.findByAssignedAgentIdOrderByUpdatedAtDesc(agentId) : ticketRepository.findAllByOrderByUpdatedAtDesc();
        String q = query == null ? "" : query.trim().toLowerCase();
        return source.stream().filter(t -> status == null || status.isBlank() || status.equalsIgnoreCase(t.getStatus()))
                .filter(t -> priority == null || priority.isBlank() || priority.equalsIgnoreCase(t.getPriority()))
                .filter(t -> customerId == null || Objects.equals(customerId, t.getCustomerId()))
                .filter(t -> q.isBlank() || contains(t.getTicketNumber(), q) || contains(t.getSubject(), q) || contains(t.getCustomerName(), q) || contains(t.getCustomerEmail(), q))
                .toList();
    }

    public SupportTicket createTicket(SupportTicket ticket) {
        if (ticket.getStatus() == null || ticket.getStatus().isBlank()) ticket.setStatus("NEW");
        SupportTicket saved = ticketRepository.save(ticket);
        if (saved.getDescription() != null && !saved.getDescription().isBlank()) {
            messageRepository.save(SupportMessage.builder().ticketId(saved.getId()).senderType("CUSTOMER")
                    .senderId(saved.getCustomerId()).senderName(saved.getCustomerName()).body(saved.getDescription()).build());
        }
        return saved;
    }

    public SupportTicket updateTicket(Long id, Map<String, Object> changes) {
        SupportTicket ticket = getTicket(id);
        setIfPresent(changes, "status", v -> { ticket.setStatus(String.valueOf(v).toUpperCase()); if ("RESOLVED".equalsIgnoreCase(ticket.getStatus()) || "CLOSED".equalsIgnoreCase(ticket.getStatus())) ticket.setResolvedAt(LocalDateTime.now()); });
        setIfPresent(changes, "priority", v -> ticket.setPriority(String.valueOf(v).toUpperCase()));
        setIfPresent(changes, "category", v -> ticket.setCategory(String.valueOf(v).toUpperCase()));
        setIfPresent(changes, "assignedAgentId", v -> {
            Long agentId = toLong(v); ticket.setAssignedAgentId(agentId);
            if (agentId == null) ticket.setAssignedAgentName(null); else agentRepository.findById(agentId).ifPresent(a -> ticket.setAssignedAgentName(a.getName()));
        });
        return ticketRepository.save(ticket);
    }

    public SupportTicket getTicket(Long id) { return ticketRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Ticket not found")); }
    public List<SupportMessage> getMessages(Long ticketId) { getTicket(ticketId); return messageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId); }

    public SupportMessage addMessage(Long ticketId, SupportMessage message) {
        SupportTicket ticket = getTicket(ticketId);
        message.setTicketId(ticketId);
        if (message.getSenderName() == null || message.getSenderName().isBlank()) message.setSenderName("Support Agent");
        SupportMessage saved = messageRepository.save(message);
        if (!Boolean.TRUE.equals(message.getInternalNote()) && ticket.getFirstResponseAt() == null && "AGENT".equalsIgnoreCase(message.getSenderType())) ticket.setFirstResponseAt(LocalDateTime.now());
        if ("CUSTOMER".equalsIgnoreCase(message.getSenderType())) ticket.setStatus("OPEN"); else if ("AGENT".equalsIgnoreCase(message.getSenderType()) && "NEW".equalsIgnoreCase(ticket.getStatus())) ticket.setStatus("IN_PROGRESS");
        ticketRepository.save(ticket);
        return saved;
    }

    public Map<String, Object> stats() {
        return new LinkedHashMap<>(Map.of("openTickets", ticketRepository.countByStatusIgnoreCase("OPEN") + ticketRepository.countByStatusIgnoreCase("NEW") + ticketRepository.countByStatusIgnoreCase("IN_PROGRESS"), "unassignedTickets", ticketRepository.findAllByOrderByUpdatedAtDesc().stream().filter(t -> t.getAssignedAgentId() == null && !"CLOSED".equalsIgnoreCase(t.getStatus()) && !"RESOLVED".equalsIgnoreCase(t.getStatus())).count(), "highPriorityTickets", ticketRepository.countByPriorityIgnoreCase("HIGH") + ticketRepository.countByPriorityIgnoreCase("URGENT"), "pendingRequests", requestRepository.countByStatusIgnoreCase("REQUESTED"), "resolvedToday", ticketRepository.findAllByOrderByUpdatedAtDesc().stream().filter(t -> t.getResolvedAt() != null && t.getResolvedAt().toLocalDate().equals(LocalDateTime.now().toLocalDate())).count()));
    }

    public List<SupportRequest> listRequests(String status) { return status == null || status.isBlank() ? requestRepository.findAllByOrderByUpdatedAtDesc() : requestRepository.findByStatusIgnoreCaseOrderByUpdatedAtDesc(status); }
    public SupportRequest createRequest(SupportRequest request) { return requestRepository.save(request); }
    public SupportRequest updateRequest(Long id, Map<String, Object> changes) { SupportRequest r = requestRepository.findById(id).orElseThrow(() -> new NoSuchElementException("Support request not found")); if (changes.containsKey("status")) r.setStatus(String.valueOf(changes.get("status")).toUpperCase()); if (changes.containsKey("resolutionNote")) r.setResolutionNote(String.valueOf(changes.get("resolutionNote"))); if (changes.containsKey("handledByAgentId")) { Long a = toLong(changes.get("handledByAgentId")); r.setHandledByAgentId(a); if (a != null) agentRepository.findById(a).ifPresent(x -> r.setHandledByAgentName(x.getName())); } return requestRepository.save(r); }
    public List<KnowledgeArticle> articles() { return articleRepository.findByPublishedTrueOrderByUpdatedAtDesc(); }
    public List<SupportNotification> notifications(Long agentId) { return notificationRepository.findByRecipientRoleAndRecipientIdOrderByCreatedAtDesc("SUPPORT_AGENT", agentId); }

    private boolean contains(String value, String q) { return value != null && value.toLowerCase().contains(q); }
    private void setIfPresent(Map<String,Object> map, String key, java.util.function.Consumer<Object> action) { if (map.containsKey(key)) action.accept(map.get(key)); }
    private Long toLong(Object value) { try { return value == null || String.valueOf(value).isBlank() ? null : Long.valueOf(String.valueOf(value)); } catch (Exception e) { throw new IllegalArgumentException("Invalid numeric value"); } }
}
