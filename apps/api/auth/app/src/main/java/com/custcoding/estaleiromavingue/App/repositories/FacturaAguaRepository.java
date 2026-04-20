package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.FacturaAgua;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FacturaAguaRepository extends JpaRepository<FacturaAgua, Long> {
    List<FacturaAgua> findByConsumidor_IdOrderByDataDesc(Long consumidorId);
    List<FacturaAgua> findByConsumidor_IdInOrderByDataDesc(List<Long> consumidorIds);
}
