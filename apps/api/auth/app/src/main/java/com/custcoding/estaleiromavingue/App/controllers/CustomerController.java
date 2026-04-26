package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.customer.CustomerCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer.CustomerResponseDTO;
import com.custcoding.estaleiromavingue.App.services.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/customer")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping({ "", "/" })
    @PreAuthorize("@permissionService.hasPermission(authentication, 'customers.view')")
    public List<CustomerResponseDTO> getCustomers() {
        return customerService.getCustomers();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'customers.view')")
    public CustomerResponseDTO getCustomerById(@PathVariable("id") Long id) {
        return customerService.getCustomerById(id);
    }

    @PostMapping({ "", "/" })
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@permissionService.hasPermission(authentication, 'customers.manage')")
    public CustomerResponseDTO postCustomer(@Valid @RequestBody CustomerCreateDTO customer) {
        return customerService.postCustomer(customer);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'customers.manage')")
    public CustomerResponseDTO updateCustomer(@PathVariable("id") Long id, @Valid @RequestBody CustomerCreateDTO customer) {
        return customerService.updateCustomer(id, customer);
    }

    @PostMapping("/{id}/sync-account")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'customers.manage')")
    public CustomerResponseDTO syncAccount(@PathVariable("id") Long id) {
        return customerService.syncAccount(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@permissionService.hasPermission(authentication, 'customers.manage')")
    public void deleteCustomer(@PathVariable("id") Long id) {
        customerService.deleteCustomer(id);
    }
}
