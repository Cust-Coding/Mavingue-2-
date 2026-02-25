package com.custcoding.estaleiromavingue.App.products.dto;

import java.math.BigDecimal;

public record ProductCreateRequest(
        String name,
        String description,
        BigDecimal price
) {}
