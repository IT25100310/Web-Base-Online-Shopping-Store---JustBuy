package com.justbuy.dao.impl;

import com.justbuy.dao.CampaignDao;
import com.justbuy.model.Campaign;
import com.justbuy.repository.CampaignRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public class CampaignDaoImpl implements CampaignDao {

    private final CampaignRepository campaignRepository;

    @Autowired
    public CampaignDaoImpl(CampaignRepository campaignRepository) {
        this.campaignRepository = campaignRepository;
    }

    @Override
    public Campaign save(Campaign campaign) {
        return campaignRepository.save(campaign);
    }

    @Override
    public Optional<Campaign> findById(Long id) {
        return campaignRepository.findById(id);
    }

    @Override
    public List<Campaign> findAll() {
        return campaignRepository.findAll();
    }

    @Override
    public List<Campaign> findRunningCampaigns() {
        return campaignRepository.findRunningCampaigns(LocalDate.now());
    }

    @Override
    public List<Campaign> findByType(Campaign.CampaignType type) {
        return campaignRepository.findByCampaignType(type);
    }

    @Override
    public void deleteById(Long id) {
        campaignRepository.deleteById(id);
    }
}
