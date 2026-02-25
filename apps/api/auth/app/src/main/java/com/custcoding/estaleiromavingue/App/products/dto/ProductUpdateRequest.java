package com.custcoding.estaleiromavingue.App.products.dto;

import java.math.BigDecimal;

public record ProductUpdateRequest(
        String name,
        String description,
        BigDecimal price
) {}
