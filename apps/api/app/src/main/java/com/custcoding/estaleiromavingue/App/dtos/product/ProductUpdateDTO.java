package com.custcoding.estaleiromavingue.App.dtos.product;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductUpdateDTO(
        @NotBlank @Size(max = 150) String name,
        @NotBlank @Size(max = 150) String description,
        @NotNull @DecimalMin(value = "0.0", inclusive = false) BigDecimal price,
        @NotBlank
        @Size(max = 500)
        @Pattern(regexp = "^(https?://).+", message = "urlImg deve começar com http:// ou https://")
        String urlImg
) {}
