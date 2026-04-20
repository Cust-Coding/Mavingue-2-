package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.venda.VendaCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaStatusUpdateDTO;
import com.custcoding.estaleiromavingue.App.services.VendaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendas")
public class VendaController {

    private final VendaService service;

    public VendaController(VendaService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VendaResponseDTO create(@Valid @RequestBody VendaCreateDTO dto, Authentication authentication) {
        return service.create(authentication.getName(), dto);
    }

    @GetMapping
    public List<VendaResponseDTO> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public VendaResponseDTO get(@PathVariable Long id) {
        return service.get(id);
    }

    @PatchMapping("/{id}/levantamento")
    public VendaResponseDTO updatePickupStatus(@PathVariable Long id, @Valid @RequestBody VendaStatusUpdateDTO dto) {
        return service.updatePickupStatus(id, dto);
    }
}
