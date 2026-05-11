package com.custcoding.estaleiromavingue.App.dtos.venda;

import com.custcoding.estaleiromavingue.App.models.status.EstadoLevantamento;
import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record VendaResponseDTO(
        Long id,
        Long produtoId,
        String produtoNome,
        String categoria,
        Long clienteId,
        String clienteNome,
        Long funcionarioId,
        String funcionarioNome,
        Integer quantidade,
        BigDecimal precoUnitario,
        BigDecimal total,
        FormaPagamento formaPagamento,
        EstadoLevantamento estadoLevantamento,
        String levantamentoNotas,
        BigDecimal valorPago,
        BigDecimal troco,
        Instant criadoEm,
        Instant atualizadoEm,
        Instant levantadoEm,
        Integer totalItens,
        List<VendaItemResponseDTO> items
) {}
