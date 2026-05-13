package com.custcoding.estaleiromavingue.App.dtos.system_status;

import java.time.LocalDateTime;
import java.util.List;

public record SystemStatusResponseDTO(
        int percentagemGeral,
        String estadoGeral,
        String tomGeral,
        String resumo,
        LocalDateTime geradoEm,
        List<SystemStatusMetricResponseDTO> metricas
) {
}
