package com.custcoding.estaleiromavingue.App.dtos.leitura_agua;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record LeituraAguaCreateDTO(
        @NotNull Long ligacaoId,
        @NotNull
        @DecimalMin(value = "0.0", inclusive = true)
        Double leituraActual,
        @NotNull
        @DecimalMin(value = "0.0", inclusive = true)
        Double precoM3
) {}
