package com.justbuy.service;

import com.justbuy.repository.AdminAccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuthorizationService {
    private final AdminAccountRepository adminAccountRepository;

    public boolean isAuthorized(String email) {
        return email != null
                && adminAccountRepository.findByEmailIgnoreCase(email.trim())
                .map(account -> "ACTIVE".equalsIgnoreCase(account.getStatus()))
                .orElse(false);
    }
}
