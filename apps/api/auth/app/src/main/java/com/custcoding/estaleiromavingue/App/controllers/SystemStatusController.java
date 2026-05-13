package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.system_status.SystemStatusResponseDTO;
import com.custcoding.estaleiromavingue.App.services.SystemStatusService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/system-status")
@RequiredArgsConstructor
public class SystemStatusController {

    private final SystemStatusService systemStatusService;

    @GetMapping
    @PreAuthorize("@permissionService.hasPermission(authentication, 'reports.system-status.view')")
    public SystemStatusResponseDTO current() {
        return systemStatusService.current();
    }
}
