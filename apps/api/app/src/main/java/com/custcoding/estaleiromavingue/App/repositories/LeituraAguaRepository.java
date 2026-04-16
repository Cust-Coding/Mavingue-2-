package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.LeituraAgua;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LeituraAguaRepository extends JpaRepository<LeituraAgua, Long> {
    List<LeituraAgua> findByLigacao_IdOrderByDataDesc(Long ligacaoId);
    Optional<LeituraAgua> findTopByLigacao_IdOrderByDataDesc(Long ligacaoId);
}
