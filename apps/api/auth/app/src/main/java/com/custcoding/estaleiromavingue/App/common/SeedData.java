package com.custcoding.estaleiromavingue.App.common;

import com.custcoding.estaleiromavingue.App.models.Adress;
import com.custcoding.estaleiromavingue.App.models.Ferragem;
import com.custcoding.estaleiromavingue.App.repositories.AdressRepository;
import com.custcoding.estaleiromavingue.App.repositories.FerragemRepository;
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
import java.util.List;

@Component
@RequiredArgsConstructor
public class SeedData implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder encoder;
    private final AdressRepository adressRepository;
    private final FerragemRepository ferragemRepository;

    @Override
    public void run(String... args) {
        try {
            ensureAdmin();
            ensureAdresses();
        } catch (Exception e) {
            System.err.println("[SeedData] Erro ao executar seed: " + e.getMessage());
            e.printStackTrace();
        }
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

    private void ensureAdresses() {
        Ferragem ferragem = ferragemRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("[SeedData] Nenhuma ferragem encontrada para associar às zonas"));

        List<String[]> zonas = List.of(
                new String[]{"Phazimane",  "Phazimane"},
                new String[]{"Marracuene", "Marracuene"}
        );

        for (String[] zona : zonas) {
            String nome = zona[0];
            String bairro = zona[1];

            boolean existe = adressRepository.findAll().stream()
                    .anyMatch(a -> a.getName().equalsIgnoreCase(nome));

            if (!existe) {
                Adress adress = new Adress();
                adress.setName(nome);
                adress.setBairro(bairro);
                adress.setFerragem(ferragem);
                adressRepository.save(adress);
            }
        }
    }
}