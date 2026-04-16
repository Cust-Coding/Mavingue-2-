package com.custcoding.estaleiromavingue.App.mappers;


import com.custcoding.estaleiromavingue.App.dtos.ferragem.FerragemCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.ferragem.FerragemResponseDTO;
import com.custcoding.estaleiromavingue.App.models.Ferragem;
import com.custcoding.estaleiromavingue.App.models.Owner;
import org.springframework.stereotype.Service;

@Service
public class FerragemMapper {

    public Ferragem toFerragemDTO(
            FerragemCreateDTO dto
    ){
        var ferragem = new Ferragem();
        ferragem.setName(dto.name());
        ferragem.setBairro(dto.bairro());

        Owner owner = new Owner();
        owner.setId(dto.ownerId());
        ferragem.setOwner(owner);

        return ferragem;
    }


    public FerragemResponseDTO toFerragemResponseDTO(
            Ferragem dto
    ){
        return new FerragemResponseDTO(
                dto.getId(),
                dto.getName(),
                dto.getBairro(),
                dto.getOwner().getNome(),
                dto.getCreated()
        );
    }

}
