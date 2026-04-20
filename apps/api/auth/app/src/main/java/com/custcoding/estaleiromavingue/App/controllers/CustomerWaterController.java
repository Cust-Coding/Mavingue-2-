package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterApprovalDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterResponseDTO;
import com.custcoding.estaleiromavingue.App.services.CustomerWaterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/customer-water")
@RequiredArgsConstructor
public class CustomerWaterController {

    private final CustomerWaterService customerWaterService;

    @GetMapping({ "", "/" })
    public List<CustomerWaterResponseDTO> getAll() {
        return customerWaterService.list();
    }

    @GetMapping("/pendentes")
    public List<CustomerWaterResponseDTO> getPending() {
        return customerWaterService.pending();
    }

    @GetMapping("/{id}")
    public CustomerWaterResponseDTO getById(@PathVariable Long id) {
        return customerWaterService.getById(id);
    }

    @PostMapping({ "", "/" })
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.CREATED)
    public CustomerWaterResponseDTO create(@Valid @org.springframework.web.bind.annotation.RequestBody CustomerWaterCreateDTO dto) {
        return customerWaterService.create(dto);
    }

    @PutMapping("/{id}")
    public CustomerWaterResponseDTO update(@PathVariable Long id, @Valid @org.springframework.web.bind.annotation.RequestBody CustomerWaterCreateDTO dto) {
        return customerWaterService.update(id, dto);
    }

    @PatchMapping("/{id}/aprovar")
    @PreAuthorize("hasRole('ADMIN')")
    public CustomerWaterResponseDTO approve(@PathVariable Long id, @org.springframework.web.bind.annotation.RequestBody(required = false) CustomerWaterApprovalDTO dto) {
        return customerWaterService.approve(id, dto == null ? new CustomerWaterApprovalDTO(null) : dto);
    }

    @PatchMapping("/{id}/rejeitar")
    @PreAuthorize("hasRole('ADMIN')")
    public CustomerWaterResponseDTO reject(@PathVariable Long id, @org.springframework.web.bind.annotation.RequestBody(required = false) CustomerWaterApprovalDTO dto) {
        return customerWaterService.reject(id, dto == null ? new CustomerWaterApprovalDTO(null) : dto);
    }

    @DeleteMapping("/{id}")
    @org.springframework.web.bind.annotation.ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        customerWaterService.delete(id);
    }
}
