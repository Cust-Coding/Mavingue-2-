package com.custcoding.estaleiromavingue.App.dtos.customer_water;

import jakarta.validation.constraints.Size;

public record CustomerWaterApprovalDTO(
        @Size(max = 20, message = "Numero da casa excede o limite permitido")
        String houseNR,
        Long adressId,
        @Size(max = 255, message = "Observacoes excedem o limite permitido")
        String observacoes
) {}
