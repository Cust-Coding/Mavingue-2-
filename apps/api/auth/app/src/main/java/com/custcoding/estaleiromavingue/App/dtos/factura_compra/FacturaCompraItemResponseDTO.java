package com.custcoding.estaleiromavingue.App.dtos.factura_compra;

import java.math.BigDecimal;

public record FacturaCompraItemResponseDTO(
        Long produtoId,
        String produtoNome,
        String categoria,
        Integer quantidade,
        BigDecimal precoUnitario,
        BigDecimal subtotal
) {}
