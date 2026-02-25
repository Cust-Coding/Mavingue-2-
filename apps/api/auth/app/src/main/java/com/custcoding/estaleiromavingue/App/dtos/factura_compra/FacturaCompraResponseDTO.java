package com.custcoding.estaleiromavingue.App.dtos.factura_compra;

public record FacturaCompraResponseDTO(
        Long id,
        Long produtoId,
        Integer quantidade,
        Long funcionarioId
) {}
