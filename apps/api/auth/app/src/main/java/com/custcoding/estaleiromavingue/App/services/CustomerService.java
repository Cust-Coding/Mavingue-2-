package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.customer.CustomerCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer.CustomerResponseDTO;
import com.custcoding.estaleiromavingue.App.mappers.CustomerMapper;
import com.custcoding.estaleiromavingue.App.repositories.CustomerRepository;
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
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    public List<CustomerResponseDTO> getCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(customerMapper::toCustomerResponseDTO)
                .collect(Collectors.toList());
    }

    public CustomerResponseDTO getCustomerById(Long id) {
        return customerRepository.findById(id)
                .map(customerMapper::toCustomerResponseDTO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));
    }

    public CustomerResponseDTO postCustomer(CustomerCreateDTO request) {

        if (customerRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já existe");
        }

        var customer = customerMapper.toCustomerDTO(request);
        var saved = customerRepository.save(customer);
        return customerMapper.toCustomerResponseDTO(saved);
    }

    public CustomerResponseDTO updateCustomer(Long id, CustomerCreateDTO request) {
        var existing = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado"));

        // atualiza tudo (se quiseres bloquear email, diz e eu ajusto)
        existing.setName(request.name());
        existing.setSex(request.sex());
        existing.setPhone(request.phone());
        existing.setEmail(request.email());
        existing.setBirthDate(request.birthDate());
        existing.setProvincia(request.provincia());
        existing.setCidade(request.cidade());
        existing.setBairro(request.bairro());


        var saved = customerRepository.save(existing);
        return customerMapper.toCustomerResponseDTO(saved);
    }

    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado");
        }
        customerRepository.deleteById(id);
    }
}