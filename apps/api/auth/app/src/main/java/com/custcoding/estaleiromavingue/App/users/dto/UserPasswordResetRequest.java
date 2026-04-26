package com.custcoding.estaleiromavingue.App.users.dto;

import jakarta.validation.constraints.Size;

public record UserPasswordResetRequest(
        @Size(max = 100) String newPassword
) {}
