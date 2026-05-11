package com.custcoding.estaleiromavingue.App.dtos.stock;

import com.custcoding.estaleiromavingue.App.models.status.TipoMovimento;

import java.math.BigDecimal;
import java.time.Instant;

public record MovimentoStockResponseDTO(
        Long id,
        Long produtoId,
        String produtoNome,
        String categoria,
        BigDecimal precoUnitario,
        Long ferragemId,
        String ferragemNome,
        TipoMovimento tipo,
        Integer quantidade,
        String motivo,
        Instant criadoEm
) {}
