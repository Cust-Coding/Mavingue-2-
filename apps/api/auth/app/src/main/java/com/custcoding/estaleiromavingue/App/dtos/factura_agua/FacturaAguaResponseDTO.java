package com.custcoding.estaleiromavingue.App.dtos.factura_agua;

import com.custcoding.estaleiromavingue.App.models.status.EstadoPagamento;
import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;

import java.time.LocalDateTime;

public record FacturaAguaResponseDTO(
        Long id,
        LocalDateTime data,
        double taxaFixa,
        double valor,
        double valorTotal,
        EstadoPagamento estadoPagamento,
        FormaPagamento formaPagamento,
        Long consumidorId,
        String consumidorNome,
        String houseNR,
        Long leituraId
) {}
