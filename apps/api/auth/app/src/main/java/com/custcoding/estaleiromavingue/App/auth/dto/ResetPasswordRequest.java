package com.custcoding.estaleiromavingue.App.auth.dto;

public record ResetPasswordRequest(
        String token,
        String newPassword
) {
}
