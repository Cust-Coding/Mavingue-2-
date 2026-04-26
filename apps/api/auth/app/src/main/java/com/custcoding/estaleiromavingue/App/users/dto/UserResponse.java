package com.custcoding.estaleiromavingue.App.users.dto;

import com.custcoding.estaleiromavingue.App.users.Role;

public record UserResponse(
        Long id,
        String nome,
        String email,
        String phone,
        Role role
) {}
