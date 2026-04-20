package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.factura_compra.FacturaCompraCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_compra.FacturaCompraResponseDTO;
import com.custcoding.estaleiromavingue.App.services.FacturaCompraService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturas-compra")
public class FacturaCompraController {

    private final FacturaCompraService service;

    public FacturaCompraController(FacturaCompraService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FacturaCompraResponseDTO create(@Valid @RequestBody FacturaCompraCreateDTO dto, Authentication authentication) {
        return service.create(authentication.getName(), dto);
    }

    @GetMapping
    public List<FacturaCompraResponseDTO> list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public FacturaCompraResponseDTO get(@PathVariable Long id) {
        return service.get(id);
    }
}
