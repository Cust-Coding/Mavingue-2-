package com.custcoding.estaleiromavingue.App.controllers;


import com.custcoding.estaleiromavingue.App.dtos.adress.AdressCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.adress.AdressResponseDTO;
import com.custcoding.estaleiromavingue.App.services.AdressService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/api/address")
@RestController
@AllArgsConstructor
public class AdressController {

    private final AdressService adressService;


    @GetMapping({ "", "/" })
    @PreAuthorize("@permissionService.hasPermission(authentication, 'address.view')")
    public List<AdressResponseDTO> getAddresses(){
        return this.adressService.getAddresses();
    }

    @GetMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'address.view')")
    public AdressResponseDTO getAddressById(
            @PathVariable("id") Long id
    ){
        return this.adressService.getAddressById(id);
    }

    @PostMapping({ "", "/" })
    @PreAuthorize("@permissionService.hasPermission(authentication, 'address.manage')")
    public AdressResponseDTO postAddress(
            @Valid @RequestBody AdressCreateDTO adress
    ){
        return this.adressService.postAddress(adress);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'address.manage')")
    public void deleteAddress(
            @PathVariable("id") Long id
    ){
        this.adressService.deleteAdress(id);
    }



}
