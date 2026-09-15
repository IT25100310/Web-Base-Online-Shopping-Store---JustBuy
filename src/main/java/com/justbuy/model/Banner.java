package com.justbuy.marketing.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "banners")
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(name = "image_url", nullable = false, length = 300)
    private String imageUrl;

    @Column(name = "link_url", length = 300)
    private String linkUrl;

    // Lower number = higher priority / shown first
    @Column(name = "display_position")
    private Integer displayPosition;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(nullable = false)
    private boolean active = true;

    public Banner() {
    }

    public Banner(String title, String imageUrl, String linkUrl, Integer displayPosition,
                  LocalDate startDate, LocalDate endDate, boolean active) {
        this.title = title;
        this.imageUrl = imageUrl;
        this.linkUrl = linkUrl;
        this.displayPosition = displayPosition;
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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getLinkUrl() {
        return linkUrl;
    }

    public void setLinkUrl(String linkUrl) {
        this.linkUrl = linkUrl;
    }

    public Integer getDisplayPosition() {
        return displayPosition;
    }

    public void setDisplayPosition(Integer displayPosition) {
        this.displayPosition = displayPosition;
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
}
