package com.custcoding.estaleiromavingue.App.dtos.stock;

import com.custcoding.estaleiromavingue.App.models.status.TipoMovimento;

import java.time.Instant;

public record MovimentoStockResponseDTO(
        Long id,
        Long produtoId,
        String produtoNome,
        Long ferragemId,
        String ferragemNome,
        TipoMovimento tipo,
        Integer quantidade,
        String motivo,
        Instant criadoEm
) {}
