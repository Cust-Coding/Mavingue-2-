package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.audit.AuditLogResponseDTO;
import com.custcoding.estaleiromavingue.App.models.AuditLog;
import com.custcoding.estaleiromavingue.App.repositories.AuditLogRepository;
import com.custcoding.estaleiromavingue.App.users.AppUser;
import com.custcoding.estaleiromavingue.App.users.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final AppUserRepository appUserRepository;

    @Transactional
    public void logByUserId(String userIdFromAuth, String action, String entityType, Long entityId, String description) {
        if (userIdFromAuth == null || userIdFromAuth.isBlank()) {
            return;
        }

        try {
            Long userId = Long.parseLong(userIdFromAuth);
            appUserRepository.findById(userId)
                    .ifPresent(user -> logUser(user, action, entityType, entityId, description));
        } catch (NumberFormatException ignored) {
        }
    }

    @Transactional
    public void logUser(AppUser user, String action, String entityType, Long entityId, String description) {
        if (user == null) {
            return;
        }

        AuditLog log = new AuditLog();
        log.setActorUserId(user.getId());
        log.setActorNome(user.getNome());
        log.setActorRole(user.getRole() == null ? null : user.getRole().name());
        log.setActorScope(resolveScope(user.getRole() == null ? null : user.getRole().name()));
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDescription(description);
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponseDTO> list(String action, String actorScope, String actorRole, String query) {
        String normalizedAction = normalize(action);
        String normalizedScope = normalize(actorScope);
        String normalizedRole = normalize(actorRole);
        String normalizedQuery = normalize(query);

        return auditLogRepository.findAll().stream()
                .filter(log -> normalizedAction == null || normalize(log.getAction()).equals(normalizedAction))
                .filter(log -> normalizedScope == null || normalize(log.getActorScope()).equals(normalizedScope))
                .filter(log -> normalizedRole == null || normalize(log.getActorRole()).equals(normalizedRole))
                .filter(log -> {
                    if (normalizedQuery == null) {
                        return true;
                    }
                    String source = (log.getActorNome() + " " + log.getDescription() + " " + log.getEntityType()).toLowerCase(Locale.ROOT);
                    return source.contains(normalizedQuery);
                })
                .sorted((left, right) -> right.getCreatedAt().compareTo(left.getCreatedAt()))
                .map(log -> new AuditLogResponseDTO(
                        log.getId(),
                        log.getActorUserId(),
                        log.getActorNome(),
                        log.getActorRole(),
                        log.getActorScope(),
                        log.getAction(),
                        log.getEntityType(),
                        log.getEntityId(),
                        log.getDescription(),
                        log.getCreatedAt()
                ))
                .toList();
    }

    private String resolveScope(String role) {
        if (role == null) {
            return "SISTEMA";
        }
        if ("CLIENTE".equalsIgnoreCase(role)) {
            return "CLIENTE";
        }
        return "EQUIPA";
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }
}
