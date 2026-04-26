package com.custcoding.estaleiromavingue.App.dtos.customer;

import com.custcoding.estaleiromavingue.App.models.status.Sexo;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record CustomerCreateDTO(

        @NotBlank(message = "Name cannot be blank")
        @JsonProperty("name")
        @JsonAlias({"nome"})
        String name,

        @NotNull(message = "Sex is required")
        @JsonProperty("sex")
        @JsonAlias({"sexo"})
        Sexo sex,

        @NotBlank(message = "Phone cannot be blank")
        @JsonProperty("phone")
        @JsonAlias({"phone", "celular"})
        String phone,

        @Email(message = "Email inválido")
        @NotNull(message = "Email é obrigatório")
        @JsonProperty("email")
        String email,

        @NotNull(message = "Birth date is required")
        @Past(message = "Birth date deve ser no passado")
        @JsonProperty("birthDate")
        @JsonAlias({"dataNascimento", "data_nascimento"})
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate birthDate,

        @NotBlank(message = "Província é obrigatória")
        @JsonProperty("provincia")
        String provincia,

        @NotBlank(message = "Cidade é obrigatória")
        @JsonProperty("cidade")
        String cidade,

        @NotBlank(message = "Bairro é obrigatório")
        @JsonProperty("bairro")
        String bairro
) {}