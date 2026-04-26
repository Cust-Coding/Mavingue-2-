package com.custcoding.estaleiromavingue.App.users.dto;

import com.custcoding.estaleiromavingue.App.users.Role;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record UserCreateFullRequest(
        @NotBlank(message = "Nome e obrigatorio")
        @Size(max = 120, message = "Nome excede o limite permitido")
        String nome,

        @Email(message = "Email invalido")
        @Size(max = 120, message = "Email excede o limite permitido")
        String email,

        @Size(max = 100, message = "Senha excede o limite permitido")
        String password,

        @NotNull(message = "Tipo de conta e obrigatorio")
        Role role,

        @NotBlank(message = "sexo e obrigatorio")
        @Pattern(regexp = "HOMEM|MULHER", message = "sexo deve ser HOMEM ou MULHER")
        String sexo,

        @NotBlank(message = "Telefone e obrigatorio")
        @Size(max = 20, message = "Telefone excede o limite permitido")
        String telefone,

        @NotNull
        @Past(message = "dataNascimento deve ser no passado")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate dataNascimento,

        @NotBlank(message = "Provincia e obrigatoria") String provincia,
        @NotBlank(message = "Cidade e obrigatoria") String cidade,
        @NotBlank(message = "Bairro e obrigatorio") String bairro,

        Boolean elegivelConta,
        Boolean criarContaAgua,
        String referenciaLocal,
        String houseNR,
        Long adressId
) {}
