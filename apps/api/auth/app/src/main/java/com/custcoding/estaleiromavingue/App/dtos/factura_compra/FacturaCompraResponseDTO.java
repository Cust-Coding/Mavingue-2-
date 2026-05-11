package com.custcoding.estaleiromavingue.App.dtos.factura_compra;

import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record FacturaCompraResponseDTO(
        Long id,
        Long produtoId,
        String produtoNome,
        String categoria,
        Integer quantidade,
        Long funcionarioId,
        String funcionarioNome,
        BigDecimal precoUnitario,
        BigDecimal total,
        FormaPagamento formaPagamento,
        BigDecimal valorPago,
        BigDecimal troco,
        Instant criadoEm,
        Integer totalItens,
        List<FacturaCompraItemResponseDTO> items
) {}
