package com.custcoding.estaleiromavingue.App.services;


import com.custcoding.estaleiromavingue.App.dtos.adress.AdressCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.adress.AdressResponseDTO;
import com.custcoding.estaleiromavingue.App.mappers.AdressMapper;
import com.custcoding.estaleiromavingue.App.repositories.AdressRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Data
public class AdressService {

    private final AdressRepository adressRepository;
    private final AdressMapper adressMapper;


    public List<AdressResponseDTO> getAddresses(){
        return adressRepository.findAll()
                .stream()
                .map(adressMapper::toAdressResponseDTO)
                .collect(Collectors.toList());
    }

    public AdressResponseDTO getAddressById(
            Long id
    ){
        return adressRepository.findById(id)
                .map(adressMapper::toAdressResponseDTO)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND
                ));
    }

    public AdressResponseDTO postAddress(
            AdressCreateDTO request
    ){
        var address = adressMapper.toAdressDTO(request);
        var savedAdress = adressRepository.save(address);
        return adressMapper.toAdressResponseDTO(savedAdress);
    }

    public void deleteAdress(
            Long id
    ){
        adressRepository.deleteById(id);
    }



}
