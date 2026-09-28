package com.justbuy.controller;

import com.justbuy.model.*;
import com.justbuy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ChatController {
    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;

    @GetMapping("/conversations")
    public ResponseEntity<?> conversations(@RequestParam(required = false) Long customerId,
                                           @RequestParam(required = false) Long sellerId) {
        if (customerId != null) return ResponseEntity.ok(conversationRepository.findByCustomerIdOrderByUpdatedAtDesc(customerId));
        if (sellerId != null) return ResponseEntity.ok(conversationRepository.findBySellerIdOrderByUpdatedAtDesc(sellerId));
        return ResponseEntity.badRequest().body(Map.of("message", "customerId or sellerId is required."));
    }

    @PostMapping("/conversations")
    public ResponseEntity<?> createConversation(@RequestBody Map<String, Object> request) {
        Long customerId = number(request.get("customerId"));
        Long sellerId = number(request.get("sellerId"));
        if (customerId == null || sellerId == null) return ResponseEntity.badRequest().body(Map.of("message", "Customer and seller are required."));
        User customer = userRepository.findById(customerId).orElse(null);
        Seller seller = sellerRepository.findById(sellerId).orElse(null);
        if (customer == null || seller == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Customer or seller was not found."));
        ChatConversation conversation = conversationRepository.findByCustomerIdAndSellerId(customerId, sellerId).orElseGet(() -> conversationRepository.save(ChatConversation.builder()
                .customerId(customerId).customerName(customer.getFullName()).sellerId(sellerId).sellerName(seller.getName()).build()));
        return ResponseEntity.ok(conversation);
    }

    @GetMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<List<ChatMessage>> messages(@PathVariable Long conversationId) {
        if (!conversationRepository.existsById(conversationId)) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId));
    }

    @PostMapping("/conversations/{conversationId}/messages")
    public ResponseEntity<?> send(@PathVariable Long conversationId, @RequestBody ChatMessage message) {
        ChatConversation conversation = conversationRepository.findById(conversationId).orElse(null);
        if (conversation == null) return ResponseEntity.notFound().build();
        if (message == null || message.getSenderId() == null || message.getBody() == null || message.getBody().isBlank()) return ResponseEntity.badRequest().body(Map.of("message", "Sender and message text are required."));
        boolean participant = message.getSenderId().equals(conversation.getCustomerId()) || message.getSenderId().equals(conversation.getSellerId());
        if (!participant) return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Only conversation participants can send messages."));
        message.setConversationId(conversationId); message.setBody(message.getBody().trim());
        if (message.getSenderType() == null || message.getSenderType().isBlank()) message.setSenderType(message.getSenderId().equals(conversation.getSellerId()) ? "SELLER" : "CUSTOMER");
        if (message.getSenderName() == null || message.getSenderName().isBlank()) message.setSenderName(message.getSenderId().equals(conversation.getSellerId()) ? conversation.getSellerName() : conversation.getCustomerName());
        ChatMessage saved = messageRepository.save(message);
        conversation.setUpdatedAt(saved.getCreatedAt()); conversationRepository.save(conversation);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    private Long number(Object value) { try { return value == null ? null : ((Number) value).longValue(); } catch (Exception ex) { return null; } }
}
