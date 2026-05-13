package com.custcoding.estaleiromavingue.App.dtos.system_status;

import java.time.LocalDateTime;

public record SystemStatusMetricResponseDTO(
        String id,
        String titulo,
        String estado,
        String tom,
        int percentagem,
        String detalhe,
        String observacao,
        LocalDateTime actualizadoEm
) {
}
