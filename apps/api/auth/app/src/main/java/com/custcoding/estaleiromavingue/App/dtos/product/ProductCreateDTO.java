package com.custcoding.estaleiromavingue.App.dtos.product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record ProductCreateDTO(
        @NotBlank String name,
        @NotBlank String description,
        @NotNull BigDecimal price
) {}
