package com.custcoding.estaleiromavingue.App.dtos.customer_water;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record CustomerWaterResponseDTO(
        Long id,
        String name,
        String phone,
        String email,
        String referenciaLocal,
        String houseNR,
        Long adressId,
        String adress,
        String estado,
        Boolean pedidoAgua,
        Boolean activo,
        String observacoes,
        @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
        LocalDateTime created
) {
}
