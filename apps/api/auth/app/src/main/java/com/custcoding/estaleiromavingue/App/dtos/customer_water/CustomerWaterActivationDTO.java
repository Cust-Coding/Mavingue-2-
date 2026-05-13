package com.custcoding.estaleiromavingue.App.dtos.customer_water;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CustomerWaterActivationDTO(
        @NotBlank(message = "Numero da casa e obrigatorio")
        @Size(max = 20, message = "Numero da casa excede o limite permitido")
        @JsonAlias("houseNR")
        @JsonProperty("house_nr")
        String houseNR,

        @NotNull(message = "Zona e obrigatoria")
        @JsonAlias("adressId")
        @JsonProperty("adress_id")
        Long adressId,

        @Size(max = 255, message = "Observacoes excedem o limite permitido")
        String observacoes
) {
}
