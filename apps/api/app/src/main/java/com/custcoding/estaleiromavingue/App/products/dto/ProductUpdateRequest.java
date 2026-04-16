package com.custcoding.estaleiromavingue.App.products.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductUpdateRequest(
        @Size(max = 150)
        String name,
        @Size(max = 150)
        String description,
        @DecimalMin(value = "0.0", inclusive = false)
        BigDecimal price,
        @Size(max = 500)
        @Pattern(regexp = "^(https?://).+", message = "urlImg deve começar com http:// ou https://")
        String urlImg
) {}
