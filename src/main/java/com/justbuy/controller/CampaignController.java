package com.justbuy.marketing.controller;

import com.justbuy.marketing.dao.CampaignDao;
import com.justbuy.marketing.model.Campaign;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/marketing/campaigns")
public class CampaignController {

    private final CampaignDao campaignDao;

    @Autowired
    public CampaignController(CampaignDao campaignDao) {
        this.campaignDao = campaignDao;
    }

    @GetMapping
    public ResponseEntity<List<Campaign>> getAllCampaigns() {
        return ResponseEntity.ok(campaignDao.findAll());
    }

    @GetMapping("/running")
    public ResponseEntity<List<Campaign>> getRunningCampaigns() {
        return ResponseEntity.ok(campaignDao.findRunningCampaigns());
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Campaign>> getCampaignsByType(@PathVariable Campaign.CampaignType type) {
        return ResponseEntity.ok(campaignDao.findByType(type));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Campaign> getCampaignById(@PathVariable Long id) {
        return campaignDao.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Campaign> createCampaign(@RequestBody Campaign campaign) {
        return ResponseEntity.status(201).body(campaignDao.save(campaign));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCampaign(@PathVariable Long id, @RequestBody Campaign updated) {
        return campaignDao.findById(id)
                .map(existing -> {
                    existing.setName(updated.getName());
                    existing.setDescription(updated.getDescription());
                    existing.setCampaignType(updated.getCampaignType());
                    existing.setStartDate(updated.getStartDate());
                    existing.setEndDate(updated.getEndDate());
                    existing.setActive(updated.isActive());
                    return ResponseEntity.ok(campaignDao.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCampaign(@PathVariable Long id) {
        if (campaignDao.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        campaignDao.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
