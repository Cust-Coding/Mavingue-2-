package com.custcoding.estaleiromavingue.App.users;

import com.custcoding.estaleiromavingue.App.users.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class AppUserController {

    private final AppUserService service;

    // (opcional) manter admin-only para listar
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    // ADMIN e FUNCIONARIO criam contas com dados completos
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','FUNCIONARIO')")
    public UserResponse create(@Valid @RequestBody UserCreateFullRequest req, Authentication auth) {
        return service.createFull(req, auth.getName());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}