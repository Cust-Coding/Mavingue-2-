package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.models.Ferragem;
import com.custcoding.estaleiromavingue.App.models.Funcionario;
import com.custcoding.estaleiromavingue.App.models.Owner;
import com.custcoding.estaleiromavingue.App.repositories.FerragemRepository;
import com.custcoding.estaleiromavingue.App.repositories.FuncionarioRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProprietarioRepository;
import com.custcoding.estaleiromavingue.App.users.AppUser;
import com.custcoding.estaleiromavingue.App.users.AppUserRepository;
import com.custcoding.estaleiromavingue.App.users.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class OperationActorService {

    private final AppUserRepository appUserRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final FerragemRepository ferragemRepository;
    private final ProprietarioRepository proprietarioRepository;

    public AppUser requireCurrentUser(String userIdFromAuth) {
        Long id;
        try {
            id = Long.parseLong(userIdFromAuth);
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilizador autenticado invalido");
        }

        return appUserRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilizador autenticado nao encontrado"));
    }

    public Funcionario resolveFuncionario(String userIdFromAuth, Long funcionarioId) {
        if (funcionarioId != null) {
            return funcionarioRepository.findById(funcionarioId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Funcionario nao encontrado: " + funcionarioId));
        }

        if (userIdFromAuth == null || userIdFromAuth.isBlank()) {
            return funcionarioRepository.findAll().stream()
                    .findFirst()
                    .orElseGet(this::createFallbackFuncionario);
        }

        AppUser user = requireCurrentUser(userIdFromAuth);
        return funcionarioRepository.findFirstByNomeIgnoreCase(user.getNome())
                .orElseGet(() -> createFuncionarioForUser(user));
    }

    private Funcionario createFuncionarioForUser(AppUser user) {
        Owner owner = resolveSystemOwner();
        Ferragem ferragem = resolveFerragem(owner);

        Funcionario funcionario = new Funcionario();
        funcionario.setCargo(user.getRole() == Role.ADMIN ? "Administrador" : "Funcionario");
        funcionario.setNome(user.getNome());
        funcionario.setTelefone("840000000");
        funcionario.setFerragem(ferragem);
        funcionario.setOwner(owner);
        return funcionarioRepository.save(funcionario);
    }

    private Funcionario createFallbackFuncionario() {
        Owner owner = resolveSystemOwner();
        Ferragem ferragem = resolveFerragem(owner);

        Funcionario funcionario = new Funcionario();
        funcionario.setCargo("Operador de Sistema");
        funcionario.setNome("Operador do Sistema");
        funcionario.setTelefone("840000000");
        funcionario.setFerragem(ferragem);
        funcionario.setOwner(owner);
        return funcionarioRepository.save(funcionario);
    }

    private Owner resolveSystemOwner() {
        return proprietarioRepository.findByEmail("adminsystem@mavingue.com")
                .orElseGet(() -> {
                    Owner owner = new Owner();
                    owner.setNome("Admin Sistema");
                    owner.setTelefone("840000001");
                    owner.setEmail("adminsystem@mavingue.com");
                    owner.setNuit("400000001");
                    owner.setPalavraPasse("mavingue1234#");
                    return proprietarioRepository.save(owner);
                });
    }

    private Ferragem resolveFerragem(Owner owner) {
        return ferragemRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    Ferragem ferragem = new Ferragem();
                    ferragem.setName("Loja Principal");
                    ferragem.setBairro("Baixa");
                    ferragem.setOwner(owner);
                    return ferragemRepository.save(ferragem);
                });
    }
}
