package com.custcoding.estaleiromavingue.App.users.dto;

import com.custcoding.estaleiromavingue.App.users.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
        @Size(max = 120) String nome,
        @Email @Size(max = 120) String email,
        @Size(min = 6, max = 100) String password,
        Role role
) {}
