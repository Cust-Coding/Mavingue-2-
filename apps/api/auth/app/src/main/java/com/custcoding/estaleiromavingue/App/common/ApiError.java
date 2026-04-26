package com.custcoding.estaleiromavingue.App.common;

import java.time.Instant;
import java.util.Map;

public record ApiError(
        String message,
        int status,
        Instant timestamp,
        Map<String, String> fieldErrors
) {
    public ApiError(String message, int status, Instant timestamp) {
        this(message, status, timestamp, Map.of());
    }
}
