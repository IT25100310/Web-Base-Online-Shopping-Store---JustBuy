package com.justbuy.marketing.dao;

import com.justbuy.marketing.model.Campaign;

import java.util.List;
import java.util.Optional;

public interface CampaignDao {

    Campaign save(Campaign campaign);

    Optional<Campaign> findById(Long id);

    List<Campaign> findAll();

    List<Campaign> findRunningCampaigns();

    List<Campaign> findByType(Campaign.CampaignType type);

    void deleteById(Long id);
}
