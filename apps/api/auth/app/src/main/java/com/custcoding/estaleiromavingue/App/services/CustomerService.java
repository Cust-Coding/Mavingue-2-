package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.customer.CustomerCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer.CustomerResponseDTO;
import com.custcoding.estaleiromavingue.App.mappers.CustomerMapper;
import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import com.custcoding.estaleiromavingue.App.repositories.CustomerRepository;
import com.custcoding.estaleiromavingue.App.users.AppUser;
import com.custcoding.estaleiromavingue.App.users.AppUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;
    private final AppUserRepository appUserRepository;
    private final PhoneNumberService phoneNumberService;
    private final AccountSyncService accountSyncService;

    @Transactional(readOnly = true)
    public List<CustomerResponseDTO> getCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(customerMapper::toCustomerResponseDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponseDTO getCustomerById(Long id) {
        return customerRepository.findById(id)
                .map(customerMapper::toCustomerResponseDTO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado"));
    }

    @Transactional
    public CustomerResponseDTO postCustomer(CustomerCreateDTO request) {
        String normalizedPhone = phoneNumberService.normalizeRequired(request.phone());
        String normalizedEmail = normalizeEmail(request.email());

        customerRepository.findByPhone(normalizedPhone).ifPresent(existing -> {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ja existe um cadastro com este numero de telefone");
        });
        if (normalizedEmail != null) {
            customerRepository.findByEmail(normalizedEmail).ifPresent(existing -> {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ja existe um cadastro com este email");
            });
        }

        CustomerProduct customer = customerMapper.toCustomerDTO(request);
        customer.setPhone(normalizedPhone);
        customer.setEmail(normalizedEmail);
        attachExistingAccount(customer);
        CustomerProduct saved = customerRepository.save(customer);
        accountSyncService.syncWaterForCustomer(saved);
        return customerMapper.toCustomerResponseDTO(saved);
    }

    @Transactional
    public CustomerResponseDTO updateCustomer(Long id, CustomerCreateDTO request) {
        CustomerProduct existing = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado"));

        String normalizedPhone = phoneNumberService.normalizeRequired(request.phone());
        String normalizedEmail = normalizeEmail(request.email());

        customerRepository.findByPhone(normalizedPhone).ifPresent(other -> {
            if (!other.getId().equals(id)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ja existe um cadastro com este numero de telefone");
            }
        });
        if (normalizedEmail != null) {
            customerRepository.findByEmail(normalizedEmail).ifPresent(other -> {
                if (!other.getId().equals(id)) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ja existe um cadastro com este email");
                }
            });
        }

        existing.setName(request.name().trim());
        existing.setSex(request.sex());
        existing.setPhone(normalizedPhone);
        existing.setEmail(normalizedEmail);
        existing.setBirthDate(request.birthDate());
        existing.setProvincia(request.provincia().trim());
        existing.setCidade(request.cidade().trim());
        existing.setBairro(request.bairro().trim());
        existing.setElegivelConta(Boolean.TRUE.equals(request.elegivelConta()));
        existing.setObservacoes(request.observacoes() == null || request.observacoes().isBlank() ? null : request.observacoes().trim());
        attachExistingAccount(existing);

        CustomerProduct saved = customerRepository.save(existing);
        accountSyncService.syncWaterForCustomer(saved);
        return customerMapper.toCustomerResponseDTO(saved);
    }

    @Transactional
    public CustomerResponseDTO syncAccount(Long id) {
        CustomerProduct customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado"));

        attachExistingAccount(customer);
        CustomerProduct saved = customerRepository.save(customer);
        accountSyncService.syncWaterForCustomer(saved);
        return customerMapper.toCustomerResponseDTO(saved);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente nao encontrado");
        }
        customerRepository.deleteById(id);
    }

    private void attachExistingAccount(CustomerProduct customer) {
        AppUser linkedUser = appUserRepository.findByPhone(customer.getPhone())
                .or(() -> customer.getEmail() == null ? java.util.Optional.empty() : appUserRepository.findByEmail(customer.getEmail()))
                .orElse(null);

        if (linkedUser == null) {
            customer.setAppUser(null);
            customer.setContaActiva(Boolean.FALSE);
            return;
        }

        customer.setAppUser(linkedUser);
        customer.setContaActiva(linkedUser.isActive());
        accountSyncService.syncUser(linkedUser);
    }

    private String normalizeEmail(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return normalized.isBlank() ? null : normalized;
    }
}
