package com.custcoding.estaleiromavingue.App.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @Email(message = "Email invalido")
        @NotBlank(message = "Email e obrigatorio")
        String email
) {
}
