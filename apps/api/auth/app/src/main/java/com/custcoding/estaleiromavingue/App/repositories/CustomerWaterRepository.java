package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.CustomerWater;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerWaterRepository extends JpaRepository<CustomerWater, Long> {
    boolean existsByEmail(String email);
    Optional<CustomerWater> findByEmail(String email);
}
