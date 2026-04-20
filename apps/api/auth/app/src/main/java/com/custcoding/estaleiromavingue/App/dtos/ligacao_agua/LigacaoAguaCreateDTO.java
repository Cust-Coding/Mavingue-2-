package com.custcoding.estaleiromavingue.App.dtos.ligacao_agua;

import jakarta.validation.constraints.NotNull;

public record LigacaoAguaCreateDTO(
        @NotNull Long consumidorId,
        Long funcionarioId
) {}
