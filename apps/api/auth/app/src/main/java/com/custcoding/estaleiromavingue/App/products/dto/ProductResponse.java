package com.custcoding.estaleiromavingue.App.products.dto;

import com.custcoding.estaleiromavingue.App.models.Product;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice()
        );
    }
}
