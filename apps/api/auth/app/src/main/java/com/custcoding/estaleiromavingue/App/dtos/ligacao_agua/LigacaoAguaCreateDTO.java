package com.custcoding.estaleiromavingue.App.dtos.ligacao_agua;

import jakarta.validation.constraints.NotNull;

public record LigacaoAguaCreateDTO(
        @NotNull(message = "Cliente de agua e obrigatorio")
        Long consumidorId,
        Long funcionarioId
) {}
