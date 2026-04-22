package com.custcoding.estaleiromavingue.App.users;

import com.custcoding.estaleiromavingue.App.models.UserProfile;
import com.custcoding.estaleiromavingue.App.repositories.UserProfileRepository;
import com.custcoding.estaleiromavingue.App.users.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private final AppUserRepository repo;
    private final UserProfileRepository profileRepo;
    private final PasswordEncoder encoder;

    public List<UserResponse> list() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    public UserResponse get(Long id) {
        AppUser u = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizador não encontrado"));
        return toResponse(u);
    }

    // novo create com dados completos
    public UserResponse createFull(UserCreateFullRequest req, String creatorIdFromJwt) {

        AppUser creator = getCreator(creatorIdFromJwt);
        Role creatorRole = creator.getRole();

        // regra final:
        // admin cria ADMIN/FUNCIONARIO/CLIENTE
        // funcionario cria FUNCIONARIO/CLIENTE
        // cliente não cria nada
        if (creatorRole == Role.CLIENTE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "CLIENTE não pode criar utilizadores");
        }
        if (creatorRole == Role.FUNCIONARIO && req.role() == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "FUNCIONARIO não pode criar ADMIN");
        }

        if (repo.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já existe");
        }

        AppUser u = AppUser.builder()
                .nome(req.nome())
                .email(req.email())
                .passwordHash(encoder.encode(req.password()))
                .role(req.role())
                .build();

        u = repo.save(u);

        // cria perfil completo
        UserProfile profile = UserProfile.builder()
                .user(u)
                .sexo(req.sexo())
                .telefone(req.telefone())
                .dataNascimento(req.dataNascimento())
                .provincia(req.provincia())
                .cidade(req.cidade())
                .bairro(req.bairro())

                .build();

        profileRepo.save(profile);

        return toResponse(u);
    }

    public UserResponse update(Long id, UserUpdateRequest req) {
        AppUser u = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizador não encontrado"));

        if (req.nome() != null && !req.nome().isBlank()) u.setNome(req.nome());

        if (req.email() != null && !req.email().isBlank() && !req.email().equalsIgnoreCase(u.getEmail())) {
            if (repo.existsByEmail(req.email())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já existe");
            u.setEmail(req.email());
        }

        if (req.password() != null && !req.password().isBlank()) u.setPasswordHash(encoder.encode(req.password()));
        if (req.role() != null) u.setRole(req.role());

        return toResponse(repo.save(u));
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizador não encontrado");
        repo.deleteById(id);
    }

    private AppUser getCreator(String creatorIdFromJwt) {
        Long id;
        try {
            id = Long.parseLong(creatorIdFromJwt);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido (subject)");
        }
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilizador autenticado não encontrado"));
    }

    private UserResponse toResponse(AppUser u) {
        return new UserResponse(u.getId(), u.getNome(), u.getEmail(), u.getRole());
    }
}