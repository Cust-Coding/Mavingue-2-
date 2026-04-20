package com.custcoding.estaleiromavingue.App.dtos.venda;

import com.custcoding.estaleiromavingue.App.models.status.EstadoLevantamento;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VendaStatusUpdateDTO(
        @NotNull EstadoLevantamento estadoLevantamento,
        @Size(max = 500) String levantamentoNotas
) {}
