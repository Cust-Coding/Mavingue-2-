package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.water_billing.WaterBillingRuleCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.water_billing.WaterBillingRuleResponseDTO;
import com.custcoding.estaleiromavingue.App.services.WaterBillingRuleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/regras-cobranca-agua")
@RequiredArgsConstructor
@PreAuthorize("@permissionService.hasPermission(authentication, 'water.billing-rules.manage')")
public class WaterBillingRuleController {

    private final WaterBillingRuleService waterBillingRuleService;

    @GetMapping
    public List<WaterBillingRuleResponseDTO> list() {
        return waterBillingRuleService.list();
    }

    @GetMapping("/actual")
    public WaterBillingRuleResponseDTO current() {
        return waterBillingRuleService.current();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WaterBillingRuleResponseDTO create(@Valid @RequestBody WaterBillingRuleCreateDTO dto) {
        return waterBillingRuleService.create(dto);
    }
}
