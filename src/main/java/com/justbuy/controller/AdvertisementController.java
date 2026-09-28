package com.justbuy.controller;

import com.justbuy.model.Advertisement;
import com.justbuy.repository.AdvertisementRepository;
import com.justbuy.repository.AuditLogRepository;
import com.justbuy.service.AdminAuthorizationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/ads")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class AdvertisementController {
    private static final long MAX_IMAGE_BYTES = 25L * 1024L * 1024L;
    private final AdvertisementRepository advertisementRepository;
    private final AuditLogRepository auditLogRepository;
    private final AdminAuthorizationService adminAuthorizationService;

    @GetMapping("/active")
    public List<Map<String, Object>> activeAds() {
        return advertisementRepository.findByActiveTrueOrderByCreatedAtDesc().stream().map(this::payload).toList();
    }

    @GetMapping
    public ResponseEntity<?> allAds(@RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return forbidden();
        return ResponseEntity.ok(advertisementRepository.findAllByOrderByCreatedAtDesc().stream().map(this::payload).toList());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(@RequestParam String title,
                                    @RequestParam(required = false, defaultValue = "") String topic,
                                    @RequestParam(required = false, defaultValue = "") String description,
                                    @RequestParam(required = false, defaultValue = "") String targetUrl,
                                    @RequestParam(required = false, defaultValue = "true") boolean active,
                                    @RequestPart("image") MultipartFile image,
                                    @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return forbidden();
        String validation = validate(title, image);
        if (validation != null) return bad(validation);
        try {
            Advertisement ad = Advertisement.builder().title(title.trim()).topic(topic.trim()).description(description.trim()).targetUrl(targetUrl.trim()).imageData(image.getBytes()).imageContentType(safeContentType(image.getContentType())).active(active).build();
            Advertisement saved = advertisementRepository.save(ad);
            audit(adminEmail, "CREATE_ADVERTISEMENT", "ADVERTISEMENT", saved.getId(), "Created advertisement " + saved.getTitle());
            return ResponseEntity.status(HttpStatus.CREATED).body(payload(saved));
        } catch (Exception exception) {
            log.error("Could not store advertisement image", exception);
            return bad("The advertisement image could not be stored.");
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> update(@PathVariable Long id,
                                    @RequestParam String title,
                                    @RequestParam(required = false, defaultValue = "") String topic,
                                    @RequestParam(required = false, defaultValue = "") String description,
                                    @RequestParam(required = false, defaultValue = "") String targetUrl,
                                    @RequestParam(required = false, defaultValue = "true") boolean active,
                                    @RequestPart(value = "image", required = false) MultipartFile image,
                                    @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return forbidden();
        Advertisement ad = advertisementRepository.findById(id).orElse(null);
        if (ad == null) return ResponseEntity.notFound().build();
        if (title == null || title.isBlank()) return bad("Advertisement title is required.");
        if (image != null && !image.isEmpty() && image.getSize() > MAX_IMAGE_BYTES) return bad("Advertisement image must be 25 MB or smaller.");
        try {
            ad.setTitle(title.trim()); ad.setTopic(topic.trim()); ad.setDescription(description.trim()); ad.setTargetUrl(targetUrl.trim()); ad.setActive(active);
            if (image != null && !image.isEmpty()) { ad.setImageData(image.getBytes()); ad.setImageContentType(safeContentType(image.getContentType())); }
            Advertisement saved = advertisementRepository.save(ad);
            audit(adminEmail, "UPDATE_ADVERTISEMENT", "ADVERTISEMENT", id, "Updated advertisement " + saved.getTitle());
            return ResponseEntity.ok(payload(saved));
        } catch (Exception exception) { log.error("Could not update advertisement image", exception); return bad("The advertisement image could not be stored."); }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> status(@PathVariable Long id, @RequestBody Map<String, Boolean> body, @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return forbidden();
        Advertisement ad = advertisementRepository.findById(id).orElse(null);
        if (ad == null) return ResponseEntity.notFound().build();
        ad.setActive(Boolean.TRUE.equals(body.get("active"))); advertisementRepository.save(ad);
        audit(adminEmail, ad.getActive() ? "ENABLE_ADVERTISEMENT" : "DISABLE_ADVERTISEMENT", "ADVERTISEMENT", id, "Advertisement status changed");
        return ResponseEntity.ok(payload(ad));
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<?> delete(@PathVariable Long id, @RequestHeader(value = "X-Admin-Email", required = false) String adminEmail) {
        if (!authorized(adminEmail)) return forbidden();
        Advertisement ad = advertisementRepository.findById(id).orElse(null);
        if (ad == null) return ResponseEntity.notFound().build();
        advertisementRepository.delete(ad); audit(adminEmail, "DELETE_ADVERTISEMENT", "ADVERTISEMENT", id, "Deleted advertisement " + ad.getTitle());
        return ResponseEntity.noContent().build();
    }

    private Map<String, Object> payload(Advertisement ad) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id", ad.getId()); result.put("title", ad.getTitle()); result.put("topic", ad.getTopic()); result.put("description", ad.getDescription()); result.put("targetUrl", ad.getTargetUrl()); result.put("active", ad.getActive()); result.put("createdAt", ad.getCreatedAt()); result.put("updatedAt", ad.getUpdatedAt());
        if (ad.getImageData() != null) result.put("imageUrl", "data:" + ad.getImageContentType() + ";base64," + Base64.getEncoder().encodeToString(ad.getImageData()));
        return result;
    }
    private String validate(String title, MultipartFile image) { if (title == null || title.isBlank()) return "Advertisement title is required."; if (image == null || image.isEmpty()) return "Advertisement image is required."; if (image.getSize() > MAX_IMAGE_BYTES) return "Advertisement image must be 25 MB or smaller."; if (image.getContentType() == null || !image.getContentType().startsWith("image/")) return "Only image files are allowed."; return null; }
    private String safeContentType(String contentType) { return contentType == null || !contentType.startsWith("image/") ? "image/jpeg" : contentType; }
    private boolean authorized(String email) { return adminAuthorizationService.isAuthorized(email); }
    private ResponseEntity<Map<String, String>> forbidden() { return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Active admin authorization is required.")); }
    private ResponseEntity<Map<String, String>> bad(String message) { return ResponseEntity.badRequest().body(Map.of("message", message)); }
    private void audit(String actor, String action, String type, Long id, String details) { auditLogRepository.save(com.justbuy.model.AuditLog.builder().actorEmail(actor).action(action).entityType(type).entityId(id).details(details).build()); }
}
