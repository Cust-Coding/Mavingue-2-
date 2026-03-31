package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.LigacaoAgua;
import com.custcoding.estaleiromavingue.App.models.status.EstadoLigacao;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LigacaoAguaRepository extends JpaRepository<LigacaoAgua, Long> {
    boolean existsByConsumidor_IdAndEstado(Long consumidorId, EstadoLigacao estado);
}
