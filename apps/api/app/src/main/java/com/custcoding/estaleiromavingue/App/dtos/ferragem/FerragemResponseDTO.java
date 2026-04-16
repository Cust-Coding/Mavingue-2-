package com.custcoding.estaleiromavingue.App.dtos.ferragem;

import com.custcoding.estaleiromavingue.App.models.Owner;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

public record FerragemResponseDTO(
    Long id,
    String name,
    String bairro,
    String owner,

    @JsonFormat(pattern = "dd/MM/yyyy HH:mm:ss")
    LocalDateTime created
) {
}
