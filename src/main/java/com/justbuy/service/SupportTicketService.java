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

    public SupportTicket createTicket(SupportTicket ticket) {
        ticket.setStatus("Open");
        return ticketRepository.save(ticket);
    }

    public List<SupportTicket> getAllTickets() {
        return ticketRepository.findAll();
    }

    // Mark ticket as In Progress
    public SupportTicket startProgress(Long id) {
        SupportTicket ticket = ticketRepository.findById(id).orElse(null);
        if (ticket != null) {
            ticket.setStatus("In Progress");
            return ticketRepository.save(ticket);
        }
        return null;
    }

    public SupportTicket resolveTicket(Long id, String response) {
        SupportTicket ticket = ticketRepository.findById(id).orElse(null);
        if (ticket != null) {
            ticket.setAgentResponse(response);
            ticket.setStatus("Resolved");
            return ticketRepository.save(ticket);
        }
        return null;
    }

    // Delete ticket by ID
    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }

    //Update ticket
    public SupportTicket updateTicket(Long id, SupportTicket updatedTicket) {
        SupportTicket ticket = ticketRepository.findById(id).orElse(null);
        if (ticket != null && "Open".equalsIgnoreCase(ticket.getStatus())) {
            ticket.setCategory(updatedTicket.getCategory());
            ticket.setSubject(updatedTicket.getSubject());
            ticket.setDescription(updatedTicket.getDescription());
            return ticketRepository.save(ticket);
        }
        return null;
    }
}