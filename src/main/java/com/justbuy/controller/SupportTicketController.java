package com.justbuy.controller;

import com.justbuy.model.SupportTicket;
import com.justbuy.service.SupportTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/support")
public class SupportTicketController {

    @Autowired
    private SupportTicketService ticketService;

    @GetMapping("/raise")
    public String showForm(Model model) {
        model.addAttribute("ticket", new SupportTicket());
        return "raise-ticket";
    }

    // Submit ticket and redirect to customer confirmation view
    @PostMapping("/raise")
    public String submitTicket(@ModelAttribute SupportTicket ticket) {
        SupportTicket saved = ticketService.createTicket(ticket);
        return "redirect:/support/status/" + saved.getId();
    }

    @GetMapping("/dashboard")
    public String showDashboard(Model model) {
        model.addAttribute("tickets", ticketService.getAllTickets());
        return "support-dashboard";
    }

    // Mark ticket as In Progress
    @PostMapping("/in-progress/{id}")
    public String inProgress(@PathVariable Long id) {
        ticketService.startProgress(id);
        return "redirect:/support/dashboard";
    }

    @PostMapping("/resolve/{id}")
    public String resolve(@PathVariable Long id, @RequestParam String response) {
        ticketService.resolveTicket(id, response);
        return "redirect:/support/dashboard";
    }

    // Delete resolved ticket
    @PostMapping("/delete/{id}")
    public String delete(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return "redirect:/support/dashboard";
    }


    // Display customer ticket status & edit option
    @GetMapping("/status/{id}")
    public String showTicketStatus(@PathVariable Long id, Model model) {
        SupportTicket ticket = ticketService.getAllTickets().stream()
                .filter(t -> t.getId().equals(id))
                .findFirst()
                .orElse(null);
        model.addAttribute("ticket", ticket);
        return "ticket-status";
    }

    // Update open ticket
    @PostMapping("/update/{id}")
    public String updateTicket(@PathVariable Long id, @ModelAttribute SupportTicket ticket) {
        ticketService.updateTicket(id, ticket);
        return "redirect:/support/status/" + id;
    }
    // Customer deletes their own ticket from status page
    @PostMapping("/customer-delete/{id}")
    public String customerDeleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return "redirect:/support/raise"; // Redirect back to create form after deletion
    }
}