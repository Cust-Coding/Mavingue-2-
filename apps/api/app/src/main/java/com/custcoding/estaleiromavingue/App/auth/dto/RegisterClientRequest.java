package com.custcoding.estaleiromavingue.App.auth.dto;

import com.custcoding.estaleiromavingue.App.models.status.Sexo;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record RegisterClientRequest(
        @NotBlank String nome,
        @NotNull Sexo sexo,
        @NotBlank String telefone,
        @Email @NotBlank String email,

        @NotBlank
        @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
        String password,

        @NotNull
        @Past(message = "Data de nascimento deve ser no passado")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate dataNascimento,

        @NotBlank String provincia,
        @NotBlank String cidade,
        @NotBlank String bairro,
        @NotBlank String endereco,

        String nuit,
        String tipoDocumento,
        String numeroDocumento

) {}