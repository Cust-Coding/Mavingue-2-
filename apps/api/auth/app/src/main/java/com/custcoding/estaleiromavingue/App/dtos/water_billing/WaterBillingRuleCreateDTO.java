package com.custcoding.estaleiromavingue.App.dtos.water_billing;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record WaterBillingRuleCreateDTO(
        @NotNull(message = "Preco por metro cubico e obrigatorio")
        @DecimalMin(value = "0.01", message = "Preco por metro cubico deve ser maior que zero")
        @JsonAlias("precoM3")
        @JsonProperty("preco_m3")
        BigDecimal precoM3,

        @DecimalMin(value = "0.0", message = "Taxa fixa nao pode ser negativa")
        @JsonAlias("taxaFixa")
        @JsonProperty("taxa_fixa")
        BigDecimal taxaFixa,

        @DecimalMin(value = "0.0", message = "Percentual de multa nao pode ser negativo")
        @DecimalMax(value = "100.0", message = "Percentual de multa deve ficar entre 0 e 100")
        @JsonAlias("percentualMulta")
        @JsonProperty("percentual_multa")
        BigDecimal percentualMulta,

        @Size(max = 180, message = "Descricao excede o limite permitido")
        String descricao
) {
}
