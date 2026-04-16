package com.custcoding.estaleiromavingue.App.dtos.adress;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AdressCreateDTO(
        @NotBlank(message = "Name Cannot be blank")
        String name,
        @NotBlank(message = "Bairro cannot be blank")
        String bairro,
        @NotNull(message = "Please provide a Id")
        Long ferragemId
) {
}
