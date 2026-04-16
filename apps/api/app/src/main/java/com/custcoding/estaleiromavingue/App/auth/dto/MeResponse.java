package com.custcoding.estaleiromavingue.App.auth.dto;

import com.custcoding.estaleiromavingue.App.users.Role;

public record MeResponse(Long id, String nome, String email, Role role) {}
