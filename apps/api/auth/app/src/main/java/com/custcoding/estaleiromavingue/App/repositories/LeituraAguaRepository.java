package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.LeituraAgua;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeituraAguaRepository extends JpaRepository<LeituraAgua, Long> {
    List<LeituraAgua> findByLigacao_IdOrderByDataDesc(Long ligacaoId);
    List<LeituraAgua> findByLigacao_Consumidor_IdOrderByDataDesc(Long consumidorId);
    List<LeituraAgua> findByLigacao_Consumidor_IdInOrderByDataDesc(List<Long> consumidorIds);
    Optional<LeituraAgua> findTopByLigacao_IdOrderByDataDesc(Long ligacaoId);
}
