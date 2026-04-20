package com.custcoding.estaleiromavingue.App.dtos.venda;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record VendaCheckoutItemDTO(
        @NotNull Long produtoId,
        @NotNull @Min(1) Integer quantidade
) {}
