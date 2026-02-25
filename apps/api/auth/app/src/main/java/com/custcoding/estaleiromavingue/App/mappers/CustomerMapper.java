package com.custcoding.estaleiromavingue.App.mappers;

import com.custcoding.estaleiromavingue.App.dtos.customer.CustomerCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer.CustomerResponseDTO;
import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import org.springframework.stereotype.Service;

@Service
public class CustomerMapper {

    public CustomerProduct toCustomerDTO(CustomerCreateDTO dto) {
        var c = new CustomerProduct();
        c.setName(dto.name());
        c.setSex(dto.sex());
        c.setPhone(dto.phone());
        c.setEmail(dto.email());
        c.setBirthDate(dto.birthDate());
        c.setProvincia(dto.provincia());
        c.setCidade(dto.cidade());
        c.setBairro(dto.bairro());
        c.setEndereco(dto.endereco());
        c.setNuit(dto.nuit());
        c.setNumeroDocumento(dto.numeroDocumento());
        c.setTipoDocumento(dto.tipoDocumento());
        return c;
    }

    public CustomerResponseDTO toCustomerResponseDTO(CustomerProduct c) {
        return new CustomerResponseDTO(
                c.getId(),
                c.getName(),
                c.getSex(),
                c.getPhone(),
                c.getEmail(),
                c.getBirthDate(),
                c.getProvincia(),
                c.getCidade(),
                c.getBairro(),
                c.getEndereco(),
                c.getNuit(),
                c.getNumeroDocumento(),
                c.getTipoDocumento(),
                c.getCreated()
        );
    }
}