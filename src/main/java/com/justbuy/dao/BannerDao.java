package com.justbuy.dao;

import com.justbuy.model.Banner;

import java.util.List;
import java.util.Optional;

public interface BannerDao {

    Banner save(Banner banner);

    Optional<Banner> findById(Long id);

    List<Banner> findAll();

    List<Banner> findVisibleBanners();

    void deleteById(Long id);
}
