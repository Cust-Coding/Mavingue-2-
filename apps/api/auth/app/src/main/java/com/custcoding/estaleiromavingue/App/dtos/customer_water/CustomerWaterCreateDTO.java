package com.custcoding.estaleiromavingue.App.dtos.customer_water;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CustomerWaterCreateDTO(
        @NotBlank(message = "Nome e obrigatorio")
        @Size(max = 100, message = "Nome excede o limite permitido")
        @JsonProperty("name")
        String name,

        @NotBlank(message = "Telefone e obrigatorio")
        @Size(max = 20, message = "Telefone excede o limite permitido")
        @JsonProperty("phone")
        String phone,

        @Email(message = "Email invalido")
        @Size(max = 120, message = "Email excede o limite permitido")
        @JsonProperty("email")
        String email,

        @Size(max = 20, message = "Numero da casa excede o limite permitido")
        @JsonProperty("house_nr")
        String houseNR,

        @JsonProperty("customer_id")
        Long customerId,

        @JsonProperty("adress_id")
        Long adressId,

        @NotBlank(message = "Referencia do local e obrigatoria")
        @Size(max = 180, message = "Referencia do local excede o limite permitido")
        String referenciaLocal,

        @Size(max = 255, message = "Observacoes excedem o limite permitido")
        String observacoes
) {
}
