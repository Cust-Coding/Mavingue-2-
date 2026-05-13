package com.custcoding.estaleiromavingue.App.dtos.water_billing;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record WaterBillingRuleResponseDTO(
        Long id,
        BigDecimal precoM3,
        BigDecimal taxaFixa,
        BigDecimal percentualMulta,
        String descricao,
        Boolean activo,
        LocalDateTime criadoEm
) {
}
