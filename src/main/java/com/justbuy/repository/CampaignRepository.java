package com.justbuy.repository;

import com.justbuy.model.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface CampaignRepository extends JpaRepository<Campaign, Long> {

    List<Campaign> findByActiveTrue();

    @Query("SELECT c FROM Campaign c WHERE c.active = true AND :today BETWEEN c.startDate AND c.endDate")
    List<Campaign> findRunningCampaigns(@Param("today") LocalDate today);

    List<Campaign> findByCampaignType(Campaign.CampaignType campaignType);
}
