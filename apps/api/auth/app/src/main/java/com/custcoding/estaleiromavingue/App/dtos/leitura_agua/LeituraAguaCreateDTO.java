package com.custcoding.estaleiromavingue.App.dtos.leitura_agua;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public record LeituraAguaCreateDTO(
        @NotNull(message = "Ligacao e obrigatoria")
        Long ligacaoId,

        @NotNull(message = "Leitura actual e obrigatoria")
        @DecimalMin(value = "0.0", inclusive = true, message = "Leitura actual invalida")
        Double leituraActual,

        @NotNull(message = "Preco por metro cubico e obrigatorio")
        @DecimalMin(value = "0.0", inclusive = true, message = "Preco por metro cubico invalido")
        Double precoM3
) {}
