package com.custcoding.estaleiromavingue.App.users.dto;

import com.custcoding.estaleiromavingue.App.users.Role;
import com.custcoding.estaleiromavingue.App.users.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @Size(max = 120, message = "Nome excede o limite permitido") String nome,
        @Email(message = "Email invalido") @Size(max = 120, message = "Email excede o limite permitido") String email,
        @Size(max = 20, message = "Telefone excede o limite permitido") String phone,
        @Size(max = 100, message = "Senha excede o limite permitido") String password,
        Role role,
        UserStatus status
) {}
