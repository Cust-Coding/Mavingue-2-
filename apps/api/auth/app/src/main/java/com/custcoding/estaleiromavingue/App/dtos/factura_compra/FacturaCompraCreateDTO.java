package com.custcoding.estaleiromavingue.App.dtos.factura_compra;

import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;

import java.math.BigDecimal;
import java.util.List;

public record FacturaCompraCreateDTO(
        Long produtoId,
        Integer quantidade,
        Long funcionarioId,
        FormaPagamento formaPagamento,
        @DecimalMin(value = "0.0", inclusive = false) BigDecimal valorPago,
        List<@Valid FacturaCompraItemCreateDTO> items
) {}
