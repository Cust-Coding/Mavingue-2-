package com.custcoding.estaleiromavingue.App.dtos.venda;

import com.custcoding.estaleiromavingue.App.models.status.EstadoLevantamento;
import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;

import java.math.BigDecimal;
import java.time.Instant;

public record VendaResponseDTO(
        Long id,
        Long produtoId,
        String produtoNome,
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
        Instant criadoEm,
        Instant atualizadoEm,
        Instant levantadoEm
) {}
