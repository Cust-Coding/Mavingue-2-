package com.custcoding.estaleiromavingue.App.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "Email ou telefone e obrigatorio") String identifier,
        @NotBlank(message = "Senha e obrigatoria") String password
) {}
