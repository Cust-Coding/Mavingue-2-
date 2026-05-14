package com.custcoding.estaleiromavingue.App.common;

import com.custcoding.estaleiromavingue.App.models.Adress;
import com.custcoding.estaleiromavingue.App.models.Ferragem;
import com.custcoding.estaleiromavingue.App.models.Owner;
import com.custcoding.estaleiromavingue.App.models.Funcionario;
import com.custcoding.estaleiromavingue.App.repositories.AdressRepository;
import com.custcoding.estaleiromavingue.App.repositories.FerragemRepository;
import com.custcoding.estaleiromavingue.App.repositories.FuncionarioRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProprietarioRepository;
import com.custcoding.estaleiromavingue.App.users.AppUser;
import com.custcoding.estaleiromavingue.App.users.AppPermission;
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
    private final ProprietarioRepository proprietarioRepository;
    private final FerragemRepository ferragemRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final AdressRepository adressRepository;

    @Override
    public void run(String... args) {
        AppUser admin = ensureUser("Admin Sistema", "adminsystem@mavingue.com", "+258840000101", Role.ADMIN);

        Owner owner = proprietarioRepository.findByEmail(admin.getEmail())
                .orElseGet(() -> {
                    Owner created = new Owner();
                    created.setNome(admin.getNome());
                    created.setTelefone("840000001");
                    created.setEmail(admin.getEmail());
                    created.setNuit("400000001");
                    created.setPalavraPasse("mavingue1234#");
                    return proprietarioRepository.save(created);
                });

        Ferragem ferragem = ferragemRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    Ferragem created = new Ferragem();
                    created.setName("Mavingue Loja Principal");
                    created.setBairro("Phazimane");
                    created.setOwner(owner);
                    return ferragemRepository.save(created);
                });

        ensureFuncionario(admin.getNome(), "Administrador", "840000001", ferragem, owner);

        ensureAdress("Phazimane", "Phazimane", ferragem);
        ensureAdress("Marracuene", "Marracuene", ferragem);
    }

    private AppUser ensureUser(String nome, String email, String phone, Role role) {
        return appUserRepository.findByEmail(email).map(existing -> {
            existing.setNome(nome);
            existing.setRole(role);
            existing.setPhone(phone);
            existing.setPasswordHash(encoder.encode("mavingue1234#"));
            existing.setStatus(UserStatus.ATIVO);
            existing.setEnabled(true);
            existing.setPermissions(new LinkedHashSet<>(AppPermission.defaultForRole(role)));
            return appUserRepository.save(existing);
        }).orElseGet(() -> appUserRepository.save(AppUser.builder()
                .nome(nome)
                .email(email)
                .phone(phone)
                .passwordHash(encoder.encode("mavingue1234#"))
                .role(role)
                .status(UserStatus.ATIVO)
                .enabled(true)
                .permissions(new LinkedHashSet<>(AppPermission.defaultForRole(role)))
                .build()));
    }

    private void ensureFuncionario(String nome, String cargo, String telefone, Ferragem ferragem, Owner owner) {
        funcionarioRepository.findFirstByNomeIgnoreCase(nome).orElseGet(() -> {
            Funcionario funcionario = new Funcionario();
            funcionario.setNome(nome);
            funcionario.setCargo(cargo);
            funcionario.setTelefone(telefone);
            funcionario.setFerragem(ferragem);
            funcionario.setOwner(owner);
            return funcionarioRepository.save(funcionario);
        });
    }

    private void ensureAdress(String nome, String bairro, Ferragem ferragem) {
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