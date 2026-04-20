package com.custcoding.estaleiromavingue.App.dtos.factura_compra;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record FacturaCompraCreateDTO(
        @NotNull Long produtoId,
        @NotNull @Min(1) Integer quantidade,
        Long funcionarioId
) {}
