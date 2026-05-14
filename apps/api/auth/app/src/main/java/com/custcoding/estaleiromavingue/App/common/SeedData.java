package com.custcoding.estaleiromavingue.App.common;

import com.custcoding.estaleiromavingue.App.users.AppPermission;
import com.custcoding.estaleiromavingue.App.users.AppUser;
import com.custcoding.estaleiromavingue.App.users.AppUserRepository;
import com.custcoding.estaleiromavingue.App.users.Role;
import com.custcoding.estaleiromavingue.App.users.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;

@Component
@RequiredArgsConstructor
public class SeedData implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        ensureAdmin();
    }

    private void ensureAdmin() {
        String email = "adminsystem@mavingue.com";

        appUserRepository.findByEmail(email).ifPresentOrElse(
                existing -> {
                    existing.setNome("Admin Sistema");
                    existing.setRole(Role.ADMIN);
                    existing.setPhone("+258840000101");
                    existing.setPasswordHash(encoder.encode("mavingue1234#"));
                    existing.setStatus(UserStatus.ATIVO);
                    existing.setEnabled(true);
                    existing.setPermissions(new LinkedHashSet<>(AppPermission.defaultForRole(Role.ADMIN)));
                    appUserRepository.save(existing);
                },
                () -> appUserRepository.save(AppUser.builder()
                        .nome("Admin Sistema")
                        .email(email)
                        .phone("+258840000101")
                        .passwordHash(encoder.encode("mavingue1234#"))
                        .role(Role.ADMIN)
                        .status(UserStatus.ATIVO)
                        .enabled(true)
                        .permissions(new LinkedHashSet<>(AppPermission.defaultForRole(Role.ADMIN)))
                        .build())
        );
    }
}