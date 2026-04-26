package com.custcoding.estaleiromavingue.App.dtos.factura_agua;

import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;
import jakarta.validation.constraints.NotNull;

public record FacturaAguaPagamentoDTO(
        @NotNull(message = "Forma de pagamento e obrigatoria")
        FormaPagamento formaPagamento
) {}
