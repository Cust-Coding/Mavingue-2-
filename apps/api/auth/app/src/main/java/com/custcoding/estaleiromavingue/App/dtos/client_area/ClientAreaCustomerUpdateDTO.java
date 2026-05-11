package com.custcoding.estaleiromavingue.App.dtos.client_area;

import com.custcoding.estaleiromavingue.App.models.status.Sexo;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record ClientAreaCustomerUpdateDTO(
        @NotBlank(message = "Nome e obrigatorio")
        @Size(max = 150, message = "Nome excede o limite permitido")
        String name,

        @NotNull(message = "Sexo e obrigatorio")
        Sexo sex,

        @NotBlank(message = "Telefone e obrigatorio")
        @Size(max = 20, message = "Telefone excede o limite permitido")
        String phone,

        @Email(message = "Email invalido")
        @Size(max = 120, message = "Email excede o limite permitido")
        String email,

        @NotNull(message = "Data de nascimento e obrigatoria")
        @Past(message = "Data de nascimento deve ser no passado")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate birthDate,

        @NotBlank(message = "Provincia e obrigatoria")
        String provincia,

        @NotBlank(message = "Cidade e obrigatoria")
        String cidade,

        @NotBlank(message = "Bairro e obrigatorio")
        String bairro
) {
}
