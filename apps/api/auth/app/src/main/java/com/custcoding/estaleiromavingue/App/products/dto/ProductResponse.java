package com.custcoding.estaleiromavingue.App.products.dto;

import com.custcoding.estaleiromavingue.App.models.Product;

import java.math.BigDecimal;

public record ProductResponse(
        Long id,
        String name,
        String description,
        BigDecimal price,
        String urlImg,
        Integer stockDisponivel
) {
    public static ProductResponse from(Product p, Integer stockDisponivel) {
        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getPrice(),
                p.getUrlImg(),
                stockDisponivel
        );
    }
}
