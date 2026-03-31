package com.custcoding.estaleiromavingue.App.dtos.customer_water;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CustomerWaterCreateDTO(
        @NotBlank(message = "Name Should not be blank")
        @JsonProperty("name")
        String name,

        @NotBlank(message = "Phone Number Should not be blank")
        @JsonProperty("phone")
        String phone,

        @NotBlank(message = "Please provide an email")
        @Email(message = "Please provide a valid email")
        @JsonProperty("email")
        String email,

        @NotBlank(message = "Please Provide a house number")
        @JsonProperty("house_nr")
        String houseNR,

        @NotNull(message = "Please provide a Adress Id")
        @JsonProperty("adress_id")
        Long adressId


) {
}
