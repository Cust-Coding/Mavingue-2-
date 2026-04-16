package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterResponseDTO;
import com.custcoding.estaleiromavingue.App.models.Adress;
import com.custcoding.estaleiromavingue.App.models.CustomerWater;
import com.custcoding.estaleiromavingue.App.repositories.AdressRepository;
import com.custcoding.estaleiromavingue.App.repositories.CustomerWaterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerWaterService {

    private final CustomerWaterRepository customerWaterRepository;
    private final AdressRepository adressRepository;

    public List<CustomerWaterResponseDTO> list() {
        return customerWaterRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    public CustomerWaterResponseDTO getById(Long id) {
        return toResponse(findCustomer(id));
    }

    public CustomerWaterResponseDTO create(CustomerWaterCreateDTO dto) {
        if (customerWaterRepository.existsByEmail(dto.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email ja existe");
        }

        Adress adress = findAdress(dto.adressId());

        CustomerWater customerWater = new CustomerWater();
        customerWater.setName(dto.name());
        customerWater.setPhone(dto.phone());
        customerWater.setEmail(dto.email());
        customerWater.setHouseNR(dto.houseNR());
        customerWater.setAdressId(adress);

        return toResponse(customerWaterRepository.save(customerWater));
    }

    public CustomerWaterResponseDTO update(Long id, CustomerWaterCreateDTO dto) {
        CustomerWater existing = findCustomer(id);

        if (!existing.getEmail().equalsIgnoreCase(dto.email()) && customerWaterRepository.existsByEmail(dto.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email ja existe");
        }

        Adress adress = findAdress(dto.adressId());

        existing.setName(dto.name());
        existing.setPhone(dto.phone());
        existing.setEmail(dto.email());
        existing.setHouseNR(dto.houseNR());
        existing.setAdressId(adress);

        return toResponse(customerWaterRepository.save(existing));
    }

    public void delete(Long id) {
        if (!customerWaterRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Consumidor de agua nao encontrado");
        }
        customerWaterRepository.deleteById(id);
    }

    private CustomerWater findCustomer(Long id) {
        return customerWaterRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consumidor de agua nao encontrado"));
    }

    private Adress findAdress(Long id) {
        return adressRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereco nao encontrado"));
    }

    private CustomerWaterResponseDTO toResponse(CustomerWater customerWater) {
        String adress = customerWater.getAdressId() == null
                ? null
                : customerWater.getAdressId().getName() + ", " + customerWater.getAdressId().getBairro();

        return new CustomerWaterResponseDTO(
                customerWater.getId(),
                customerWater.getName(),
                customerWater.getPhone(),
                customerWater.getEmail(),
                customerWater.getHouseNR(),
                adress,
                customerWater.getCreated()
        );
    }
}
