package com.custcoding.estaleiromavingue.App.common;

import com.custcoding.estaleiromavingue.App.users.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SeedData implements CommandLineRunner {

    private final AppUserRepository repo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        String email = "adminsystem@mavingue.local";
        if (!repo.existsByEmail(email)) {
            AppUser admin = AppUser.builder()
                    .nome("Admin Sistema")
                    .email(email)
                    .passwordHash(encoder.encode("admin##"))
                    .role(Role.ADMIN)
                    .build();
            repo.save(admin);
        }
    }
}
