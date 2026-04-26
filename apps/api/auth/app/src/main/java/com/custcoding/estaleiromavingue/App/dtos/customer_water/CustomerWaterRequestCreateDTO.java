package com.custcoding.estaleiromavingue.App.dtos.customer_water;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerWaterRequestCreateDTO(
        @NotBlank(message = "Referencia do local e obrigatoria")
        @Size(max = 180, message = "Referencia do local excede o limite permitido")
        String referenciaLocal,

        @Size(max = 255, message = "Observacoes excedem o limite permitido")
        String observacoes
) {
}
