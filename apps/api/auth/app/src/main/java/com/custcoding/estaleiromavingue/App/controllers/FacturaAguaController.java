package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.factura_agua.FacturaAguaPagamentoDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_agua.FacturaAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.services.FacturaAguaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/facturas-agua")
@RequiredArgsConstructor
public class FacturaAguaController {

    private final FacturaAguaService facturaAguaService;

    @GetMapping
    @PreAuthorize("@permissionService.hasPermission(authentication, 'water.overview')")
    public List<FacturaAguaResponseDTO> list(@RequestParam(required = false) Long consumidorId) {
        return facturaAguaService.list(consumidorId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'water.overview')")
    public FacturaAguaResponseDTO get(@PathVariable Long id) {
        return facturaAguaService.get(id);
    }

    @PatchMapping("/{id}/pagamento")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'water.bills.manage')")
    public FacturaAguaResponseDTO pagar(@PathVariable Long id, @Valid @RequestBody FacturaAguaPagamentoDTO dto) {
        return facturaAguaService.pagar(id, dto);
    }
}
