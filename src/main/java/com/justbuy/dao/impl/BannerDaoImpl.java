package com.justbuy.dao.impl;

import com.justbuy.dao.BannerDao;
import com.justbuy.model.Banner;
import com.justbuy.repository.BannerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public class BannerDaoImpl implements BannerDao {

    private final BannerRepository bannerRepository;

    @Autowired
    public BannerDaoImpl(BannerRepository bannerRepository) {
        this.bannerRepository = bannerRepository;
    }

    @Override
    public Banner save(Banner banner) {
        return bannerRepository.save(banner);
    }

    @Override
    public Optional<Banner> findById(Long id) {
        return bannerRepository.findById(id);
    }

    @Override
    public List<Banner> findAll() {
        return bannerRepository.findAll();
    }

    @Override
    public List<Banner> findVisibleBanners() {
        return bannerRepository.findCurrentlyVisibleBanners(LocalDate.now());
    }

    @Override
    public void deleteById(Long id) {
        bannerRepository.deleteById(id);
    }
}
