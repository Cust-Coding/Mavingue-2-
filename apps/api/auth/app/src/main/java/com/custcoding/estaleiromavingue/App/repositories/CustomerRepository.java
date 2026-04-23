package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<CustomerProduct, Long> {
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);

    Optional<CustomerProduct> findByEmail(String email);
}
