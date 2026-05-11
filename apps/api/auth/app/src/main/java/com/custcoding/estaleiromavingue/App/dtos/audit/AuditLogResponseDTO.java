package com.custcoding.estaleiromavingue.App.dtos.audit;

import java.time.Instant;

public record AuditLogResponseDTO(
        Long id,
        Long actorUserId,
        String actorNome,
        String actorRole,
        String actorScope,
        String action,
        String entityType,
        Long entityId,
        String description,
        Instant createdAt
) {}
