package com.custcoding.estaleiromavingue.App.common;

import java.time.Instant;

public record ApiError(
        String message,
        int status,
        Instant timestamp
) {}
