package com.justbuy.marketing.repository;

import com.justbuy.marketing.model.Banner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface BannerRepository extends JpaRepository<Banner, Long> {

    List<Banner> findByActiveTrueOrderByDisplayPositionAsc();

    @Query("SELECT b FROM Banner b WHERE b.active = true " +
           "AND (b.startDate IS NULL OR b.startDate <= :today) " +
           "AND (b.endDate IS NULL OR b.endDate >= :today) " +
           "ORDER BY b.displayPosition ASC")
    List<Banner> findCurrentlyVisibleBanners(@Param("today") LocalDate today);
}
