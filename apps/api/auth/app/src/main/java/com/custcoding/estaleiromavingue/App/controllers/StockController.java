package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.stock.StockAdjustDTO;
import com.custcoding.estaleiromavingue.App.dtos.stock.MovimentoStockResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.stock.StockResponseDTO;
import com.custcoding.estaleiromavingue.App.services.AuditLogService;
import com.custcoding.estaleiromavingue.App.services.StockService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final StockService service;
    private final AuditLogService auditLogService;

    public StockController(StockService service, AuditLogService auditLogService) {
        this.service = service;
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @PreAuthorize("@permissionService.hasPermission(authentication, 'stock.view')")
    public List<StockResponseDTO> list() {
        return service.list();
    }

    @GetMapping("/movimentos")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'stock.movements.view')")
    public List<MovimentoStockResponseDTO> listMovements() {
        return service.listMovements();
    }

    @GetMapping("/produto/{produtoId}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'stock.view')")
    public StockResponseDTO getByProduto(@PathVariable Long produtoId) {
        return service.getByProduto(produtoId);
    }

    @PostMapping("/adjust")
    @ResponseStatus(HttpStatus.OK)
    @PreAuthorize("@permissionService.hasPermission(authentication, 'stock.adjust')")
    public StockResponseDTO adjust(@Valid @RequestBody StockAdjustDTO dto, Authentication authentication) {
        StockResponseDTO response = service.adjust(dto);
        auditLogService.logByUserId(
                authentication.getName(),
                "STOCK_ADJUST",
                "PRODUCT",
                response.produtoId(),
                "Ajuste manual de stock em " + response.produtoNome() + " (" + dto.tipo() + ")"
        );
        return response;
    }
}
