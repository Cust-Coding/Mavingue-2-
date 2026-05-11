package com.custcoding.estaleiromavingue.App.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "audit_log")
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "actor_user_id")
    private Long actorUserId;

    @Column(name = "actor_nome", length = 160)
    private String actorNome;

    @Column(name = "actor_role", length = 60)
    private String actorRole;

    @Column(name = "actor_scope", length = 40)
    private String actorScope;

    @Column(name = "action", nullable = false, length = 80)
    private String action;

    @Column(name = "entity_type", length = 80)
    private String entityType;

    @Column(name = "entity_id")
    private Long entityId;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();
}
