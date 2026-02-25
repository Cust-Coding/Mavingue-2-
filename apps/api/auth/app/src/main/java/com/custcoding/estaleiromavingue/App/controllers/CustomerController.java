package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.customer.CustomerCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer.CustomerResponseDTO;
import com.custcoding.estaleiromavingue.App.services.CustomerService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@AllArgsConstructor
@RequestMapping("/api/customer")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping({ "", "/" })
    public List<CustomerResponseDTO> getCustomers() {
        return this.customerService.getCustomers();
    }

    @GetMapping("/{id}")
    public CustomerResponseDTO getCustomerById(@PathVariable("id") Long id) {
        return this.customerService.getCustomerById(id);
    }

    @PostMapping({ "", "/" })
    public CustomerResponseDTO postCustomer(@Valid @RequestBody CustomerCreateDTO customer) {
        return this.customerService.postCustomer(customer);
    }

    @PutMapping("/{id}")
    public CustomerResponseDTO updateCustomer(@PathVariable("id") Long id, @Valid @RequestBody CustomerCreateDTO customer) {
        return this.customerService.updateCustomer(id, customer);
    }

    @DeleteMapping("/{id}")
    public void deleteCustomer(@PathVariable("id") Long id) {
        this.customerService.deleteCustomer(id);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new HashMap<>();
        exception.getBindingResult().getAllErrors().forEach(error -> {
            var fieldName = ((FieldError) error).getField();
            var errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}