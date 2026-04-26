package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.ligacao_agua.LigacaoAguaCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.ligacao_agua.LigacaoAguaEstadoUpdateDTO;
import com.custcoding.estaleiromavingue.App.dtos.ligacao_agua.LigacaoAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.services.LigacaoAguaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ligacoes-agua")
@RequiredArgsConstructor
public class LigacaoAguaController {

    private final LigacaoAguaService ligacaoAguaService;

    @GetMapping
    @PreAuthorize("@permissionService.hasPermission(authentication, 'water.overview')")
    public List<LigacaoAguaResponseDTO> list() {
        return ligacaoAguaService.list();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'water.overview')")
    public LigacaoAguaResponseDTO get(@PathVariable Long id) {
        return ligacaoAguaService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@permissionService.hasPermission(authentication, 'water.contracts.manage')")
    public LigacaoAguaResponseDTO create(@Valid @RequestBody LigacaoAguaCreateDTO dto, Authentication authentication) {
        return ligacaoAguaService.create(authentication.getName(), dto);
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'water.contracts.manage')")
    public LigacaoAguaResponseDTO updateEstado(@PathVariable Long id, @Valid @RequestBody LigacaoAguaEstadoUpdateDTO dto) {
        return ligacaoAguaService.updateEstado(id, dto);
    }
}
