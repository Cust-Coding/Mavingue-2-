package com.custcoding.estaleiromavingue.App.dtos.factura_compra;

import java.math.BigDecimal;
import java.time.Instant;

public record FacturaCompraResponseDTO(
        Long id,
        Long produtoId,
        String produtoNome,
        Integer quantidade,
        Long funcionarioId,
        String funcionarioNome,
        BigDecimal precoUnitario,
        BigDecimal total,
        Instant criadoEm
) {}
