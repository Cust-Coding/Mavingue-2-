package com.custcoding.estaleiromavingue.App.dtos.customer;

import com.custcoding.estaleiromavingue.App.models.status.Sexo;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record CustomerResponseDTO(
        Long id,
        String name,
        Sexo sex,
        String phone,
        String email,
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate birthDate,
        String provincia,
        String cidade,
        String bairro,
        @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
        LocalDateTime created
) {}