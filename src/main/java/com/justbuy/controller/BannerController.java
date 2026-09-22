package com.justbuy.controller;

import com.justbuy.dao.BannerDao;
import com.justbuy.model.Banner;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketing/banners")
public class BannerController {

    private final BannerDao bannerDao;

    @Autowired
    public BannerController(BannerDao bannerDao) {
        this.bannerDao = bannerDao;
    }

    // Used by the storefront homepage to render the active banner carousel
    @GetMapping("/visible")
    public ResponseEntity<List<Banner>> getVisibleBanners() {
        return ResponseEntity.ok(bannerDao.findVisibleBanners());
    }

    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerDao.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Banner> getBannerById(@PathVariable Long id) {
        return bannerDao.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Banner> createBanner(@RequestBody Banner banner) {
        return ResponseEntity.status(201).body(bannerDao.save(banner));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBanner(@PathVariable Long id, @RequestBody Banner updated) {
        return bannerDao.findById(id)
                .map(existing -> {
                    existing.setTitle(updated.getTitle());
                    existing.setImageUrl(updated.getImageUrl());
                    existing.setLinkUrl(updated.getLinkUrl());
                    existing.setDisplayPosition(updated.getDisplayPosition());
                    existing.setStartDate(updated.getStartDate());
                    existing.setEndDate(updated.getEndDate());
                    existing.setActive(updated.isActive());
                    return ResponseEntity.ok(bannerDao.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        if (bannerDao.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        bannerDao.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
