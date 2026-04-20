package com.custcoding.estaleiromavingue.App.dtos.venda;

import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record VendaCreateDTO(
        @NotNull Long produtoId,
        @NotNull Long clienteId,        // CustomerProduct (ou o teu id de cliente)
        Long funcionarioId,             // opcional: usa o operador autenticado quando vazio
        @NotNull @Min(1) Integer quantidade,
        @NotNull FormaPagamento formaPagamento
) {}
