package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.audit.AuditLogResponseDTO;
import com.custcoding.estaleiromavingue.App.services.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/auditoria")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    @PreAuthorize("@permissionService.hasPermission(authentication, 'audit.view')")
    public List<AuditLogResponseDTO> list(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String actorScope,
            @RequestParam(required = false) String actorRole,
            @RequestParam(required = false) String query
    ) {
        return auditLogService.list(action, actorScope, actorRole, query);
    }
}
