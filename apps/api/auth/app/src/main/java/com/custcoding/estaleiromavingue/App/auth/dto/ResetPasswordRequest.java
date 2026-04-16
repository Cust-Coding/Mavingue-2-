package com.custcoding.estaleiromavingue.App.auth.dto;

public record ResetPasswordRequest(
        String email,
        String code,
        String newPassword
) {
}
