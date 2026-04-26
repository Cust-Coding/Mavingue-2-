package com.custcoding.estaleiromavingue.App.auth.dto;

import com.custcoding.estaleiromavingue.App.models.status.Sexo;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record RegisterClientRequest(
        @NotBlank(message = "Nome e obrigatorio")
        @Size(max = 120, message = "Nome excede o limite permitido")
        String nome,

        @NotNull(message = "Sexo e obrigatorio")
        Sexo sexo,

        @NotBlank(message = "Telefone e obrigatorio")
        @Size(max = 20, message = "Telefone excede o limite permitido")
        String telefone,

        @Email(message = "Email invalido")
        @Size(max = 120, message = "Email excede o limite permitido")
        String email,

        @NotBlank
        @Size(min = 6, message = "Senha deve ter no minimo 6 caracteres")
        String password,

        @NotNull
        @Past(message = "Data de nascimento deve ser no passado")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate dataNascimento,

        @NotBlank(message = "Provincia e obrigatoria") String provincia,
        @NotBlank(message = "Cidade e obrigatoria") String cidade,
        @NotBlank(message = "Bairro e obrigatorio") String bairro,
        @NotBlank(message = "Endereco e obrigatorio") String endereco,

        String nuit,
        String tipoDocumento,
        String numeroDocumento,
        Boolean pedirAgua

) {}
