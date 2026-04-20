package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.stock.StockAdjustDTO;
import com.custcoding.estaleiromavingue.App.dtos.stock.MovimentoStockResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.stock.StockResponseDTO;
import com.custcoding.estaleiromavingue.App.services.StockService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final StockService service;

    public StockController(StockService service) {
        this.service = service;
    }

    @GetMapping
    public List<StockResponseDTO> list() {
        return service.list();
    }

    @GetMapping("/movimentos")
    public List<MovimentoStockResponseDTO> listMovements() {
        return service.listMovements();
    }

    @GetMapping("/produto/{produtoId}")
    public StockResponseDTO getByProduto(@PathVariable Long produtoId) {
        return service.getByProduto(produtoId);
    }

    @PostMapping("/adjust")
    @ResponseStatus(HttpStatus.OK)
    public StockResponseDTO adjust(@Valid @RequestBody StockAdjustDTO dto) {
        return service.adjust(dto);
    }
}
