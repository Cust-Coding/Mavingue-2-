package com.custcoding.estaleiromavingue.App.users;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "app_user", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email"),
        @UniqueConstraint(columnNames = "phone")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String nome;

    @Column(nullable = true, length = 120)
    private String email;

    @Column(nullable = false , length = 20)
    private String phone;

    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = true, length = 40)
    @Builder.Default
    private UserStatus status = UserStatus.PENDENTE_REVISAO;

    @Column(nullable = true)
    @Builder.Default
    private Boolean enabled = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "app_user_permissions", joinColumns = @JoinColumn(name = "app_user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "permission_key", nullable = false, length = 80)
    @Builder.Default
    private Set<AppPermission> permissions = new LinkedHashSet<>();

    @Column(name = "created_at", nullable = true)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = true)
    private LocalDateTime updatedAt;

    public boolean isActive() {
        UserStatus effectiveStatus = status == null ? (Boolean.TRUE.equals(enabled) ? UserStatus.ATIVO : UserStatus.PENDENTE_REVISAO) : status;
        return effectiveStatus == UserStatus.ATIVO && Boolean.TRUE.equals(enabled);
    }
}
