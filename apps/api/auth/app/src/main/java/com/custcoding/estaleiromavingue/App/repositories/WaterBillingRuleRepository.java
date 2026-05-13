package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.WaterBillingRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WaterBillingRuleRepository extends JpaRepository<WaterBillingRule, Long> {
    Optional<WaterBillingRule> findFirstByActivoTrueOrderByCriadoEmDesc();
    List<WaterBillingRule> findAllByOrderByCriadoEmDesc();
    List<WaterBillingRule> findByActivoTrue();
}
