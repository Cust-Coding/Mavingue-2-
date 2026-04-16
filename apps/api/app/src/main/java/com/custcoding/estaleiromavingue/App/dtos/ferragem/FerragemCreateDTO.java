package com.custcoding.estaleiromavingue.App.dtos.ferragem;

import com.custcoding.estaleiromavingue.App.models.Owner;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record FerragemCreateDTO(

    @NotBlank(message = "Name needs a value")
    String name,
    @NotBlank(message = "bairro needs a value")
    String bairro,

    Long ownerId
) {
}
