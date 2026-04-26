package com.custcoding.estaleiromavingue.App.dtos.customer;

import com.custcoding.estaleiromavingue.App.models.status.Sexo;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record CustomerCreateDTO(

        @NotBlank(message = "Nome e obrigatorio")
        @Size(max = 150, message = "Nome excede o limite permitido")
        @JsonProperty("name")
        @JsonAlias({"nome"})
        String name,

        @NotNull(message = "Sexo e obrigatorio")
        @JsonProperty("sex")
        @JsonAlias({"sexo"})
        Sexo sex,

        @NotBlank(message = "Telefone e obrigatorio")
        @Size(max = 20, message = "Telefone excede o limite permitido")
        @JsonProperty("phone")
        @JsonAlias({"phone", "celular"})
        String phone,

        @Email(message = "Email invalido")
        @Size(max = 120, message = "Email excede o limite permitido")
        @JsonProperty("email")
        String email,

        @NotNull(message = "Data de nascimento e obrigatoria")
        @Past(message = "Data de nascimento deve ser no passado")
        @JsonProperty("birthDate")
        @JsonAlias({"dataNascimento", "data_nascimento"})
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate birthDate,

        @NotBlank(message = "Provincia e obrigatoria")
        @JsonProperty("provincia")
        String provincia,

        @NotBlank(message = "Cidade e obrigatoria")
        @JsonProperty("cidade")
        String cidade,

        @NotBlank(message = "Bairro e obrigatorio")
        @JsonProperty("bairro")
        String bairro,

        Boolean elegivelConta,
        String observacoes
) {}
