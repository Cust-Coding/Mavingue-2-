package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import com.custcoding.estaleiromavingue.App.models.CustomerWater;
import com.custcoding.estaleiromavingue.App.repositories.CustomerRepository;
import com.custcoding.estaleiromavingue.App.repositories.CustomerWaterRepository;
import com.custcoding.estaleiromavingue.App.users.AppUser;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AccountSyncService {

    private final CustomerRepository customerRepository;
    private final CustomerWaterRepository customerWaterRepository;
    private final PhoneNumberService phoneNumberService;

    @Transactional
    public Optional<CustomerProduct> syncUser(AppUser user) {
        if (user == null) {
            return Optional.empty();
        }

        Optional<CustomerProduct> existingCustomer = findCustomerCandidate(user);
        existingCustomer.ifPresent(customer -> {
            customer.setAppUser(user);
            customer.setContaActiva(user.isActive());
            if (customer.getEmail() == null && user.getEmail() != null) {
                customer.setEmail(user.getEmail());
            }
            if (customer.getPhone() == null && user.getPhone() != null) {
                customer.setPhone(user.getPhone());
            }
            customerRepository.save(customer);
            syncWaterRecords(user, customer);
        });

        if (existingCustomer.isEmpty()) {
            syncWaterRecords(user, null);
        }

        return existingCustomer;
    }

    @Transactional
    public void syncWaterForCustomer(CustomerProduct customer) {
        if (customer == null) {
            return;
        }

        AppUser linkedUser = customer.getAppUser();
        syncWaterRecords(linkedUser, customer);
    }

    private Optional<CustomerProduct> findCustomerCandidate(AppUser user) {
        if (user.getId() != null) {
            Optional<CustomerProduct> byUserId = customerRepository.findByAppUser_Id(user.getId());
            if (byUserId.isPresent()) {
                return byUserId;
            }
        }

        String normalizedPhone = phoneNumberService.normalize(user.getPhone());
        if (normalizedPhone != null) {
            Optional<CustomerProduct> byPhone = customerRepository.findByPhone(normalizedPhone);
            if (byPhone.isPresent()) {
                return byPhone;
            }
        }

        if (user.getEmail() != null && !user.getEmail().isBlank()) {
            return customerRepository.findByEmail(user.getEmail().trim().toLowerCase());
        }

        return Optional.empty();
    }

    private void syncWaterRecords(AppUser user, CustomerProduct customer) {
        Set<CustomerWater> matches = new LinkedHashSet<>();

        if (user != null && user.getId() != null) {
            matches.addAll(customerWaterRepository.findByAppUser_IdOrderByCreatedDesc(user.getId()));
        }

        if (customer != null && customer.getId() != null) {
            matches.addAll(customerWaterRepository.findByCustomer_IdOrderByCreatedDesc(customer.getId()));
        }

        if (customer != null && customer.getPhone() != null) {
            matches.addAll(customerWaterRepository.findByPhoneOrderByCreatedDesc(customer.getPhone()));
        } else if (user != null && user.getPhone() != null) {
            String normalizedPhone = phoneNumberService.normalize(user.getPhone());
            if (normalizedPhone != null) {
                matches.addAll(customerWaterRepository.findByPhoneOrderByCreatedDesc(normalizedPhone));
            }
        }

        if (customer != null && customer.getEmail() != null && !customer.getEmail().isBlank()) {
            matches.addAll(customerWaterRepository.findByEmailOrderByCreatedDesc(customer.getEmail().trim().toLowerCase()));
        } else if (user != null && user.getEmail() != null && !user.getEmail().isBlank()) {
            matches.addAll(customerWaterRepository.findByEmailOrderByCreatedDesc(user.getEmail().trim().toLowerCase()));
        }

        if (matches.isEmpty()) {
            return;
        }

        List<CustomerWater> waterRecords = matches.stream().toList();
        for (CustomerWater water : waterRecords) {
            if (customer != null) {
                water.setCustomer(customer);
                customer.setTemServicoAgua(Boolean.TRUE);
            }
            if (user != null) {
                water.setAppUser(user);
                if (water.getEmail() == null && user.getEmail() != null) {
                    water.setEmail(user.getEmail());
                }
                if (water.getPhone() == null && user.getPhone() != null) {
                    water.setPhone(user.getPhone());
                }
            }
            water.setUpdated(LocalDateTime.now());
            customerWaterRepository.save(water);
        }

        if (customer != null) {
            customerRepository.save(customer);
        }
    }
}
