package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.leitura_agua.LeituraAguaCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.leitura_agua.LeituraAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.services.LeituraAguaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/leituras-agua")
@RequiredArgsConstructor
public class LeituraAguaController {

    private final LeituraAguaService leituraAguaService;

    @GetMapping
    @PreAuthorize("@permissionService.hasPermission(authentication, 'water.overview')")
    public List<LeituraAguaResponseDTO> list(@RequestParam(required = false) Long ligacaoId) {
        if (ligacaoId != null) {
            return leituraAguaService.listByLigacao(ligacaoId);
        }
        return leituraAguaService.list();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'water.overview')")
    public LeituraAguaResponseDTO get(@PathVariable Long id) {
        return leituraAguaService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@permissionService.hasPermission(authentication, 'water.readings.manage')")
    public LeituraAguaResponseDTO create(@Valid @RequestBody LeituraAguaCreateDTO dto) {
        return leituraAguaService.create(dto);
    }
}
