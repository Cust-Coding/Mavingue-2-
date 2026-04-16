package com.custcoding.estaleiromavingue.App.users.dto;

import com.custcoding.estaleiromavingue.App.users.Role;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public record UserCreateFullRequest(
        @NotBlank @Size(max = 120) String nome,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Size(min = 6, max = 100) String password,
        @NotNull Role role,

        // dados pessoais completos
        @NotBlank(message = "sexo é obrigatório")
        @Pattern(regexp = "HOMEM|MULHER", message = "sexo deve ser HOMEM ou MULHER")
        String sexo,

        @NotBlank String telefone,

        @NotNull
        @Past(message = "dataNascimento deve ser no passado")
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