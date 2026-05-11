package com.custcoding.estaleiromavingue.App.dtos.factura_agua;

import com.custcoding.estaleiromavingue.App.models.status.EstadoPagamento;
import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record FacturaAguaResponseDTO(
        Long id,
        LocalDateTime data,
        double taxaFixa,
        double valor,
        double valorTotal,
        EstadoPagamento estadoPagamento,
        FormaPagamento formaPagamento,
        BigDecimal valorPago,
        BigDecimal troco,
        Long consumidorId,
        String consumidorNome,
        String houseNR,
        Long leituraId,
        Double leituraAnterior,
        Double leituraActual,
        Double consumoM3
) {}
