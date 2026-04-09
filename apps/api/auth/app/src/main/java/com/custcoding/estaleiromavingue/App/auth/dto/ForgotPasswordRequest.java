package com.custcoding.estaleiromavingue.App.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;

public record ForgotPasswordRequest(
        @Email
        @NotNull(message = "Email nao atribuido")
        String email

) {
}
