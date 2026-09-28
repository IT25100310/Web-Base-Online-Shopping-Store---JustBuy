package com.justbuy.controller;

import com.justbuy.model.*;
import com.justbuy.repository.*;
import com.justbuy.service.SupportTicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/support")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SupportTicketController {
    private final SupportTicketService service;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    @GetMapping("/stats") public Map<String,Object> stats() { return service.stats(); }
    @GetMapping("/tickets") public List<SupportTicket> tickets(@RequestParam(required=false) String status, @RequestParam(required=false) String priority, @RequestParam(required=false) Long agentId, @RequestParam(required=false) Long customerId, @RequestParam(required=false) String q) { return service.listTickets(status, priority, agentId, customerId, q); }
    @PostMapping("/tickets") public ResponseEntity<SupportTicket> createTicket(@RequestBody SupportTicket ticket) { return ResponseEntity.status(HttpStatus.CREATED).body(service.createTicket(ticket)); }
    @GetMapping("/tickets/{id}") public SupportTicket ticket(@PathVariable Long id) { return service.getTicket(id); }
    @PatchMapping("/tickets/{id}") public SupportTicket updateTicket(@PathVariable Long id, @RequestBody Map<String,Object> changes) { return service.updateTicket(id, changes); }
    @GetMapping("/tickets/{id}/messages") public List<SupportMessage> messages(@PathVariable Long id) { return service.getMessages(id); }
    @PostMapping("/tickets/{id}/messages") public ResponseEntity<SupportMessage> addMessage(@PathVariable Long id, @RequestBody SupportMessage message) { return ResponseEntity.status(HttpStatus.CREATED).body(service.addMessage(id, message)); }

    @GetMapping("/requests") public List<SupportRequest> requests(@RequestParam(required=false) String status) { return service.listRequests(status); }
    @PostMapping("/requests") public ResponseEntity<SupportRequest> createRequest(@RequestBody SupportRequest request) { return ResponseEntity.status(HttpStatus.CREATED).body(service.createRequest(request)); }
    @PatchMapping("/requests/{id}") public SupportRequest updateRequest(@PathVariable Long id, @RequestBody Map<String,Object> changes) { return service.updateRequest(id, changes); }
    @GetMapping("/knowledge") public List<KnowledgeArticle> knowledge() { return service.articles(); }
    @GetMapping("/notifications") public List<SupportNotification> notifications(@RequestParam Long agentId) { return service.notifications(agentId); }

    @GetMapping("/customers/{id}") public ResponseEntity<?> customer(@PathVariable Long id) { return userRepository.findById(id).map(u -> ResponseEntity.ok(Map.of("id", u.getId(), "fullName", u.getFullName(), "email", u.getEmail(), "accountStatus", u.getAccountStatus(), "orders", orderRepository.findByCustomerIdOrderByCreatedAtDesc(id)))).orElseGet(() -> ResponseEntity.notFound().build()); }
    @GetMapping("/customers/search") public List<Map<String,Object>> customerSearch(@RequestParam String q) { String query = q.toLowerCase().trim(); return userRepository.findAll().stream().filter(u -> (u.getFullName() != null && u.getFullName().toLowerCase().contains(query)) || (u.getEmail() != null && u.getEmail().toLowerCase().contains(query))).limit(20).map(u -> Map.<String,Object>of("id", u.getId(), "fullName", u.getFullName(), "email", u.getEmail(), "accountStatus", u.getAccountStatus())).toList(); }
    @GetMapping("/orders/{id}") public ResponseEntity<?> order(@PathVariable Long id) { return orderRepository.findById(id).<ResponseEntity<?>>map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build()); }
    @GetMapping("/orders") public List<Order> orders() { return orderRepository.findAll(); }
    @GetMapping("/orders/by-customer/{customerId}") public List<Order> ordersByCustomer(@PathVariable Long customerId) { return orderRepository.findByCustomerIdOrderByCreatedAtDesc(customerId); }

    @ExceptionHandler({NoSuchElementException.class, IllegalArgumentException.class}) public ResponseEntity<Map<String,String>> handleBadRequest(RuntimeException ex) { return ResponseEntity.badRequest().body(Map.of("message", ex.getMessage())); }
}
