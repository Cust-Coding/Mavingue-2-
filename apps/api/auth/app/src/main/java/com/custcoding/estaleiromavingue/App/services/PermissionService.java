package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.users.AppPermission;
import com.custcoding.estaleiromavingue.App.users.AppUser;
import com.custcoding.estaleiromavingue.App.users.AppUserRepository;
import com.custcoding.estaleiromavingue.App.users.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.LinkedHashSet;
import java.util.Set;

@Component("permissionService")
@RequiredArgsConstructor
public class PermissionService {

    private final AppUserRepository appUserRepository;

    public boolean hasPermission(Authentication authentication, String permissionKey) {
        if (authentication == null || authentication.getName() == null) {
            return false;
        }

        return resolveUser(authentication)
                .map(user -> effectivePermissionKeys(user).contains(permissionKey))
                .orElse(false);
    }

    public Set<AppPermission> effectivePermissions(AppUser user) {
        if (user == null) {
            return Set.of();
        }

        if (user.getRole() == Role.ADMIN) {
            return AppPermission.allPermissions();
        }

        if (user.getPermissions() == null || user.getPermissions().isEmpty()) {
            return AppPermission.defaultForRole(user.getRole());
        }

        return new LinkedHashSet<>(user.getPermissions());
    }

    public Set<String> effectivePermissionKeys(AppUser user) {
        return effectivePermissions(user).stream()
                .map(AppPermission::getKey)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
    }

    private java.util.Optional<AppUser> resolveUser(Authentication authentication) {
        try {
            Long userId = Long.parseLong(authentication.getName());
            return appUserRepository.findById(userId);
        } catch (NumberFormatException ex) {
            return java.util.Optional.empty();
        }
    }
}
