package com.custcoding.estaleiromavingue.App.dtos.stock;

public record StockResponseDTO(
        Long produtoId,
        String produtoNome,
        Integer quantidade
) {}
