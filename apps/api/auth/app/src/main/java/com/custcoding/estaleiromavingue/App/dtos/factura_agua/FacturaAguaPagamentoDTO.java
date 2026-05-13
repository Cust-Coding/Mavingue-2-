package com.custcoding.estaleiromavingue.App.dtos.factura_agua;

import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;

public record FacturaAguaPagamentoDTO(
        @NotNull(message = "Forma de pagamento e obrigatoria")
        FormaPagamento formaPagamento,

        @DecimalMin(value = "0.0", inclusive = false, message = "Valor pago invalido")
        BigDecimal valorPago,

        List<Long> facturaIds
) {}
