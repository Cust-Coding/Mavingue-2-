package com.custcoding.estaleiromavingue.App.dtos.product_category;

import java.time.Instant;

public record ProductCategoryResponseDTO(
        Long id,
        String name,
        String slug,
        String description,
        Instant createdAt,
        Instant updatedAt
) {}
