package com.custcoding.estaleiromavingue.App.products.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductCreateRequest(
        @NotBlank
        @Size(max = 150)
        String name,
        @NotBlank
        @Size(max = 150)
        String description,
        @NotNull
        @DecimalMin(value = "0.0", inclusive = false)
        BigDecimal price,
        @NotBlank
        @Size(max = 5000000)
        @Pattern(regexp = "^(https?://.+|data:image/.+)$", message = "urlImg deve ser uma URL valida ou uma imagem carregada")
        String urlImg
) {}
