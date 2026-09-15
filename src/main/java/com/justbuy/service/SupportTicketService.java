package com.justbuy.service;

import com.justbuy.model.SupportTicket;
import com.justbuy.repository.SupportTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupportTicketService {

    @Autowired
    private SupportTicketRepository ticketRepository;

    // UC-CS-01: Create new ticket
    public SupportTicket createTicket(SupportTicket ticket) {
        ticket.setStatus("Open");
        return ticketRepository.save(ticket);
    }

    // UC-CS-02: Get all tickets for dashboard[cite: 1]
    public List<SupportTicket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // UC-CS-02: Resolve ticket[cite: 1]
    public SupportTicket resolveTicket(Long id, String response) {
        SupportTicket ticket = ticketRepository.findById(id).orElse(null);
        if (ticket != null) {
            ticket.setAgentResponse(response);
            ticket.setStatus("Resolved");
            return ticketRepository.save(ticket);
        }
        return null;
    }

    // UC-CS-02: Escalate ticket
    public SupportTicket escalateTicket(Long id) {
        SupportTicket ticket = ticketRepository.findById(id).orElse(null);
        if (ticket != null) {
            ticket.setStatus("Escalated");
            return ticketRepository.save(ticket);
        }
        return null;
    }
}