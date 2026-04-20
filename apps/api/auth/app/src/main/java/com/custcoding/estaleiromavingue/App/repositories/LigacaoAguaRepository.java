package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.LigacaoAgua;
import com.custcoding.estaleiromavingue.App.models.status.EstadoLigacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LigacaoAguaRepository extends JpaRepository<LigacaoAgua, Long> {
    boolean existsByConsumidor_IdAndEstado(Long consumidorId, EstadoLigacao estado);
    List<LigacaoAgua> findByConsumidor_IdOrderByDataDesc(Long consumidorId);
    List<LigacaoAgua> findByConsumidor_IdInOrderByDataDesc(List<Long> consumidorIds);
}
