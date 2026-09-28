package com.justbuy.config;

import com.justbuy.model.AdminAccount;
import com.justbuy.model.SupportAgent;
import com.justbuy.repository.AdminAccountRepository;
import com.justbuy.repository.SupportAgentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SupportAgentMigration implements CommandLineRunner {
    private final AdminAccountRepository adminAccountRepository;
    private final SupportAgentRepository supportAgentRepository;

    @Override
    @Transactional
    public void run(String... args) {
        List<AdminAccount> legacy = adminAccountRepository.findAll().stream()
                .filter(account -> "SUPPORT_AGENT".equalsIgnoreCase(account.getRole()) || "CUSTOMER_SUPPORT".equalsIgnoreCase(account.getRole()))
                .toList();
        for (AdminAccount account : legacy) {
            if (supportAgentRepository.findByEmailIgnoreCase(account.getEmail()).isEmpty()) {
                supportAgentRepository.save(SupportAgent.builder()
                        .name(account.getName()).email(account.getEmail()).passwordHash(account.getPasswordHash())
                        .status(account.getStatus()).build());
            }
            adminAccountRepository.delete(account);
        }
    }
}
