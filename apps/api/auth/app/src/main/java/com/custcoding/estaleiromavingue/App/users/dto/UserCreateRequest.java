package com.custcoding.estaleiromavingue.App.users.dto;

import com.custcoding.estaleiromavingue.App.users.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UserCreateRequest(
        @NotBlank @Size(max = 120) String nome,
        @NotBlank @Email @Size(max = 120) String email,
        @NotBlank @Size(max = 20) String phone,
        @NotBlank @Size(min = 6, max = 100) String password,
        @NotNull Role role
) {}

