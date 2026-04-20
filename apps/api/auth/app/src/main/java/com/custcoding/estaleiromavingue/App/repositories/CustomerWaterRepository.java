package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.CustomerWater;
import com.custcoding.estaleiromavingue.App.models.status.EstadoServicoAgua;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CustomerWaterRepository extends JpaRepository<CustomerWater, Long> {
    boolean existsByEmail(String email);
    Optional<CustomerWater> findByEmail(String email);
    Optional<CustomerWater> findFirstByEmailOrderByCreatedDesc(String email);
    List<CustomerWater> findByEstadoOrderByCreatedDesc(EstadoServicoAgua estado);
    List<CustomerWater> findByEmailOrderByCreatedDesc(String email);
    List<CustomerWater> findByEmailAndEstadoOrderByCreatedDesc(String email, EstadoServicoAgua estado);
}
