package com.custcoding.estaleiromavingue.App.dtos.venda;

import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;

import java.math.BigDecimal;
import java.util.List;

public record VendaCreateDTO(
        Long produtoId,
        Long clienteId,
        Long funcionarioId,
        @Min(1) Integer quantidade,
        FormaPagamento formaPagamento,
        List<@Valid VendaCheckoutItemDTO> items,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal valorPago
) {}
