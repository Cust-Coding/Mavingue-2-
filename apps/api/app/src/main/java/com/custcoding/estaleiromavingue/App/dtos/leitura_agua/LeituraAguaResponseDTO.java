package com.custcoding.estaleiromavingue.App.dtos.leitura_agua;

import java.time.LocalDateTime;

public record LeituraAguaResponseDTO(
        Long id,
        LocalDateTime data,
        double leituraAnterior,
        double leituraActual,
        double consumoM3,
        double valorPagar,
        Long ligacaoId
) {}
