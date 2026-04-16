package com.custcoding.estaleiromavingue.App.dtos.ligacao_agua;

import com.custcoding.estaleiromavingue.App.models.status.EstadoLigacao;
import jakarta.validation.constraints.NotNull;

public record LigacaoAguaEstadoUpdateDTO(
        @NotNull EstadoLigacao estado
) {}
