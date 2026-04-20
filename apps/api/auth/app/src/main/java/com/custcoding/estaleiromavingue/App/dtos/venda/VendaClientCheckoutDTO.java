package com.custcoding.estaleiromavingue.App.dtos.venda;

import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record VendaClientCheckoutDTO(
        @NotEmpty List<@Valid VendaCheckoutItemDTO> items,
        @NotNull FormaPagamento formaPagamento
) {}
