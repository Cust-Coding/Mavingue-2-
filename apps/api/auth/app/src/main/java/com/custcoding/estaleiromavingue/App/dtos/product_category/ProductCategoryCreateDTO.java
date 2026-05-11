package com.custcoding.estaleiromavingue.App.dtos.product_category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProductCategoryCreateDTO(
        @NotBlank(message = "Nome da categoria e obrigatorio")
        @Size(max = 120, message = "Nome da categoria muito longo")
        String name,

        @Size(max = 255, message = "Descricao muito longa")
        String description
) {}
