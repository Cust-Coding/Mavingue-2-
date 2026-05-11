package com.custcoding.estaleiromavingue.App.dtos.stock;

import java.math.BigDecimal;

public record StockResponseDTO(
        Long produtoId,
        String produtoNome,
        String categoria,
        BigDecimal precoUnitario,
        Integer quantidade,
        Integer stockMinimo,
        BigDecimal valorEmStock
) {}
