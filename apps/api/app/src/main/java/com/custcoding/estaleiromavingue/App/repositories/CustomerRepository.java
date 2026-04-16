package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerRepository extends JpaRepository<CustomerProduct, Long> {
    boolean existsByEmail(String email);
    boolean existsByNuit(String nuit);
}