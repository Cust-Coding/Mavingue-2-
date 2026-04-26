package com.custcoding.estaleiromavingue.App.users.dto;

import com.custcoding.estaleiromavingue.App.users.Role;
import com.custcoding.estaleiromavingue.App.users.UserStatus;

import java.util.Set;

public record UserResponse(
        Long id,
        String nome,
        String email,
        String phone,
        Role role,
        UserStatus status,
        Set<String> permissions
) {}
