package com.custcoding.estaleiromavingue.App.dtos.venda;

import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;
import java.math.BigDecimal;

public record VendaResponseDTO(
        Long id,
        Long produtoId,
        String produtoNome,
        Long clienteId,
        Long funcionarioId,
        Integer quantidade,
        BigDecimal precoUnitario,
        BigDecimal total,
        FormaPagamento formaPagamento
) {}
