package com.custcoding.estaleiromavingue.App.dtos.stock;

import com.custcoding.estaleiromavingue.App.models.status.TipoMovimento;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record StockAdjustDTO(
        @NotNull Long produtoId,
        @NotNull TipoMovimento tipo,   // ENTRADA ou SAIDA
        @NotNull @Min(1) Integer quantidade,
        String motivo
) {}
