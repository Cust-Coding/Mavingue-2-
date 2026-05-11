package com.custcoding.estaleiromavingue.App.dtos.venda;

import java.math.BigDecimal;

public record VendaItemResponseDTO(
        Long produtoId,
        String produtoNome,
        String categoria,
        Integer quantidade,
        BigDecimal precoUnitario,
        BigDecimal subtotal
) {}
