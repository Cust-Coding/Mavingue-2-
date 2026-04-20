package com.custcoding.estaleiromavingue.App.dtos.customer_water;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CustomerWaterRequestCreateDTO(
        @NotBlank
        @Size(max = 180)
        String referenciaLocal,

        @Size(max = 255)
        String observacoes
) {
}
