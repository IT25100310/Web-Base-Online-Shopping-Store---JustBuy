package com.justbuy.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * The application intentionally does not seed demo users, sellers, categories,
 * products, or reviews. All marketplace records must be created through the
 * application and stored in MySQL.
 */
@Component
@Slf4j
public class DataInitializer implements CommandLineRunner {
    @Override
    public void run(String... args) {
        log.info("JustBuy started without demo data. Marketplace records are database-backed.");
    }
}
