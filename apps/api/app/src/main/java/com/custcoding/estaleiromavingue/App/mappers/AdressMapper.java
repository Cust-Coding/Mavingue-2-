package com.custcoding.estaleiromavingue.App.mappers;


import com.custcoding.estaleiromavingue.App.dtos.adress.AdressCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.adress.AdressResponseDTO;
import com.custcoding.estaleiromavingue.App.models.Adress;
import com.custcoding.estaleiromavingue.App.models.Ferragem;
import org.springframework.stereotype.Service;

@Service
public class AdressMapper {

    public Adress toAdressDTO(
            AdressCreateDTO dto
    ){
        var adress = new Adress();

        adress.setName(dto.name());
        adress.setBairro(dto.bairro());

        var ferragem = new Ferragem();
        ferragem.setId(dto.ferragemId());
        adress.setFerragem(ferragem);


        return adress;
    }

    public AdressResponseDTO toAdressResponseDTO(
            Adress dto
    ){
        return new AdressResponseDTO(
                dto.getId(),
                dto.getName(),
                dto.getBairro(),
                dto.getFerragem().getName()
        );
    }
}
