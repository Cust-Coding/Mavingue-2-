package com.custcoding.estaleiromavingue.App.dtos.ligacao_agua;

import com.custcoding.estaleiromavingue.App.models.status.EstadoLigacao;

import java.time.LocalDateTime;

public record LigacaoAguaResponseDTO(
        Long id,
        LocalDateTime data,
        EstadoLigacao estado,
        Long consumidorId,
        String consumidorNome,
        String houseNR,
        Long funcionarioId,
        String funcionarioNome
) {}
