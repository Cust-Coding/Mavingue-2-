package com.custcoding.estaleiromavingue.App.dtos.customer_water;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CustomerWaterClientUpdateDTO(
        @NotBlank(message = "Numero da casa e obrigatorio") String houseNR,
        @NotNull(message = "Zona e obrigatoria") Long adressId
) {}
