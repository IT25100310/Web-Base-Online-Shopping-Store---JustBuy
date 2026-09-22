package com.justbuy.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "campaigns")
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "campaign_type")
    private CampaignType campaignType;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private boolean active = true;

    public enum CampaignType {
        SEASONAL_SALE, FLASH_SALE, CLEARANCE, NEW_ARRIVAL, HOLIDAY_SPECIAL
    }

    public Campaign() {
    }

    public Campaign(String name, String description, CampaignType campaignType,
                     LocalDate startDate, LocalDate endDate, boolean active) {
        this.name = name;
        this.description = description;
        this.campaignType = campaignType;
        this.startDate = startDate;
        this.endDate = endDate;
        this.active = active;
    }

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CampaignType getCampaignType() {
        return campaignType;
    }

    public void setCampaignType(CampaignType campaignType) {
        this.campaignType = campaignType;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isCurrentlyRunning() {
        LocalDate today = LocalDate.now();
        return active && !today.isBefore(startDate) && !today.isAfter(endDate);
    }
}
