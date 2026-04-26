package com.custcoding.estaleiromavingue.App.users;

import com.custcoding.estaleiromavingue.App.users.dto.UserCreateFullRequest;
import com.custcoding.estaleiromavingue.App.users.dto.UserPasswordResetRequest;
import com.custcoding.estaleiromavingue.App.users.dto.UserPermissionDefinitionResponse;
import com.custcoding.estaleiromavingue.App.users.dto.UserPermissionUpdateRequest;
import com.custcoding.estaleiromavingue.App.users.dto.UserResponse;
import com.custcoding.estaleiromavingue.App.users.dto.UserStatusUpdateRequest;
import com.custcoding.estaleiromavingue.App.users.dto.UserUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class AppUserController {

    private final AppUserService service;

    @GetMapping
    @PreAuthorize("@permissionService.hasPermission(authentication, 'users.view')")
    public List<UserResponse> list() {
        return service.list();
    }

    @GetMapping("/pending")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'users.verify')")
    public List<UserResponse> pending() {
        return service.listPending();
    }

    @GetMapping("/permissions/catalog")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'users.permissions.manage')")
    public List<UserPermissionDefinitionResponse> permissionCatalog() {
        return service.permissionCatalog();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'users.view')")
    public UserResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping("/{id}/permissions")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'users.permissions.manage')")
    public Set<String> getPermissions(@PathVariable Long id) {
        return service.userPermissions(id);
    }

    @PostMapping
    @PreAuthorize("@permissionService.hasPermission(authentication, 'users.manage')")
    public UserResponse create(@Valid @RequestBody UserCreateFullRequest req, Authentication auth) {
        return service.createFull(req, auth.getName());
    }

    @PutMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'users.manage')")
    public UserResponse update(@PathVariable Long id, @Valid @RequestBody UserUpdateRequest req) {
        return service.update(id, req);
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'users.verify')")
    public UserResponse updateStatus(@PathVariable Long id, @Valid @RequestBody UserStatusUpdateRequest req) {
        return service.updateStatus(id, req);
    }

    @PutMapping("/{id}/permissions")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'users.permissions.manage')")
    public UserResponse updatePermissions(@PathVariable Long id, @RequestBody UserPermissionUpdateRequest req) {
        return service.updatePermissions(id, req);
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'users.reset-password')")
    public UserResponse resetPassword(@PathVariable Long id, @RequestBody(required = false) UserPasswordResetRequest req) {
        return service.resetPassword(id, req == null ? new UserPasswordResetRequest(null) : req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'users.manage')")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
