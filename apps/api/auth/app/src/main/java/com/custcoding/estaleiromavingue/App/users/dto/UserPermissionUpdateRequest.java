package com.custcoding.estaleiromavingue.App.users.dto;

import java.util.Set;

public record UserPermissionUpdateRequest(
        Set<String> permissions
) {}
