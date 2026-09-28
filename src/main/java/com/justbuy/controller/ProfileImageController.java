package com.justbuy.controller;

import com.justbuy.model.AdminAccount;
import com.justbuy.model.Driver;
import com.justbuy.model.Seller;
import com.justbuy.model.SupportAgent;
import com.justbuy.model.User;
import com.justbuy.repository.AdminAccountRepository;
import com.justbuy.repository.DriverRepository;
import com.justbuy.repository.SellerRepository;
import com.justbuy.repository.SupportAgentRepository;
import com.justbuy.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProfileImageController {
    private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;

    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private final DriverRepository driverRepository;
    private final SupportAgentRepository supportAgentRepository;
    private final AdminAccountRepository adminAccountRepository;

    @PostMapping("/picture")
    public ResponseEntity<?> upload(@RequestParam("image") MultipartFile image,
                                    @RequestHeader(value = "X-User-Email", required = false) String email,
                                    @RequestHeader(value = "X-User-Role", required = false) String role) throws IOException {
        if (email == null || email.isBlank()) return bad("You must be signed in to upload a profile picture.");
        if (image == null || image.isEmpty()) return bad("Choose an image to upload.");
        if (image.getSize() > MAX_IMAGE_BYTES) return bad("Profile pictures must be 5 MB or smaller.");
        String type = image.getContentType() == null ? "" : image.getContentType().toLowerCase(Locale.ROOT);
        if (!type.startsWith("image/")) return bad("Only image files are allowed.");
        String normalizedRole = role == null ? "" : role.trim().toUpperCase(Locale.ROOT);
        byte[] bytes = image.getBytes();
        boolean saved = switch (normalizedRole) {
            case "CUSTOMER" -> userRepository.findByEmailIgnoreCase(email.trim()).map(account -> { setUser(account, bytes, type); userRepository.save(account); return true; }).orElse(false);
            case "SELLER" -> sellerRepository.findByEmailIgnoreCase(email.trim()).map(account -> { setSeller(account, bytes, type); sellerRepository.save(account); return true; }).orElse(false);
            case "DRIVER", "DELIVERY" -> driverRepository.findByEmailIgnoreCase(email.trim()).map(account -> { setDriver(account, bytes, type); driverRepository.save(account); return true; }).orElse(false);
            case "SUPPORT_AGENT", "AGENT" -> supportAgentRepository.findByEmailIgnoreCase(email.trim()).map(account -> { setAgent(account, bytes, type); supportAgentRepository.save(account); return true; }).orElse(false);
            case "ADMIN", "ADMIN_ACCOUNT" -> adminAccountRepository.findByEmailIgnoreCase(email.trim()).map(account -> { setAdmin(account, bytes, type); adminAccountRepository.save(account); return true; }).orElse(false);
            default -> false;
        };
        if (!saved) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "The signed-in profile could not be found."));
        return ResponseEntity.ok(Map.of("message", "Profile picture updated.", "imageUrl", imageUrl(normalizedRole, email)));
    }

    @GetMapping("/picture")
    public ResponseEntity<byte[]> image(@RequestParam String email, @RequestParam String role) {
        String normalizedRole = role.trim().toUpperCase(Locale.ROOT);
        byte[] bytes = null; String type = null;
        if ("CUSTOMER".equals(normalizedRole)) { var a = userRepository.findByEmailIgnoreCase(email).orElse(null); if (a != null) { bytes = a.getProfileImageData(); type = a.getProfileImageContentType(); } }
        else if ("SELLER".equals(normalizedRole)) { var a = sellerRepository.findByEmailIgnoreCase(email).orElse(null); if (a != null) { bytes = a.getProfileImageData(); type = a.getProfileImageContentType(); } }
        else if ("DRIVER".equals(normalizedRole) || "DELIVERY".equals(normalizedRole)) { var a = driverRepository.findByEmailIgnoreCase(email).orElse(null); if (a != null) { bytes = a.getProfileImageData(); type = a.getProfileImageContentType(); } }
        else if ("SUPPORT_AGENT".equals(normalizedRole) || "AGENT".equals(normalizedRole)) { var a = supportAgentRepository.findByEmailIgnoreCase(email).orElse(null); if (a != null) { bytes = a.getProfileImageData(); type = a.getProfileImageContentType(); } }
        else if ("ADMIN".equals(normalizedRole) || "ADMIN_ACCOUNT".equals(normalizedRole)) { var a = adminAccountRepository.findByEmailIgnoreCase(email).orElse(null); if (a != null) { bytes = a.getProfileImageData(); type = a.getProfileImageContentType(); } }
        if (bytes == null || bytes.length == 0) return ResponseEntity.notFound().build();
        MediaType mediaType; try { mediaType = MediaType.parseMediaType(type == null ? MediaType.APPLICATION_OCTET_STREAM_VALUE : type); } catch (IllegalArgumentException ex) { mediaType = MediaType.APPLICATION_OCTET_STREAM; }
        return ResponseEntity.ok().header(HttpHeaders.CACHE_CONTROL, "no-cache").contentType(mediaType).body(bytes);
    }

    private String imageUrl(String role, String email) { return "/api/profiles/picture?role=" + role + "&email=" + java.net.URLEncoder.encode(email, java.nio.charset.StandardCharsets.UTF_8); }
    private void setUser(User a, byte[] b, String t) { a.setProfileImageData(b); a.setProfileImageContentType(t); }
    private void setSeller(Seller a, byte[] b, String t) { a.setProfileImageData(b); a.setProfileImageContentType(t); }
    private void setDriver(Driver a, byte[] b, String t) { a.setProfileImageData(b); a.setProfileImageContentType(t); }
    private void setAgent(SupportAgent a, byte[] b, String t) { a.setProfileImageData(b); a.setProfileImageContentType(t); }
    private void setAdmin(AdminAccount a, byte[] b, String t) { a.setProfileImageData(b); a.setProfileImageContentType(t); }
    private ResponseEntity<Map<String, String>> bad(String message) { return ResponseEntity.badRequest().body(Map.of("message", message)); }
}
