package com.custcoding.estaleiromavingue.App.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @Email(message = "Email invalido")
        @NotBlank(message = "Email e obrigatorio")
        String email,

        @NotBlank(message = "Codigo e obrigatorio")
        String code,

        @NotBlank(message = "Nova senha e obrigatoria")
        @Size(min = 6, message = "A nova senha deve ter pelo menos 6 caracteres")
        String newPassword
) {
}
