package com.custcoding.estaleiromavingue.App.dtos.customer_water;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CustomerWaterClientUpdateDTO(
        @NotBlank String houseNR,
        @NotNull Long adressId
) {}
