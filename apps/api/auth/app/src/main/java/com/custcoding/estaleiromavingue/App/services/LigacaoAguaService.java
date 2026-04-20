package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.ligacao_agua.LigacaoAguaCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.ligacao_agua.LigacaoAguaEstadoUpdateDTO;
import com.custcoding.estaleiromavingue.App.dtos.ligacao_agua.LigacaoAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.models.CustomerWater;
import com.custcoding.estaleiromavingue.App.models.Funcionario;
import com.custcoding.estaleiromavingue.App.models.LigacaoAgua;
import com.custcoding.estaleiromavingue.App.models.status.EstadoLigacao;
import com.custcoding.estaleiromavingue.App.models.status.EstadoServicoAgua;
import com.custcoding.estaleiromavingue.App.repositories.CustomerWaterRepository;
import com.custcoding.estaleiromavingue.App.repositories.LigacaoAguaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LigacaoAguaService {

    private final LigacaoAguaRepository ligacaoAguaRepository;
    private final CustomerWaterRepository customerWaterRepository;
    private final OperationActorService operationActorService;

    @Transactional(readOnly = true)
    public List<LigacaoAguaResponseDTO> list() {
        return ligacaoAguaRepository.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public LigacaoAguaResponseDTO get(Long id) {
        return toDTO(findLigacao(id));
    }

    public LigacaoAguaResponseDTO create(String userIdFromAuth, LigacaoAguaCreateDTO dto) {
        CustomerWater consumidor = customerWaterRepository.findById(dto.consumidorId())
                .orElseThrow(() -> new EntityNotFoundException("Consumidor de agua nao encontrado: " + dto.consumidorId()));
        Funcionario funcionario = operationActorService.resolveFuncionario(userIdFromAuth, dto.funcionarioId());

        if (consumidor.getEstado() != EstadoServicoAgua.ATIVO || !Boolean.TRUE.equals(consumidor.getActivo())) {
            throw new IllegalArgumentException("O cliente de agua ainda nao esta activo para gerar ligacao");
        }

        if (ligacaoAguaRepository.existsByConsumidor_IdAndEstado(consumidor.getId(), EstadoLigacao.ATIVA)) {
            throw new IllegalArgumentException("O consumidor ja possui uma ligacao ativa");
        }

        LigacaoAgua ligacao = LigacaoAgua.builder()
                .data(LocalDateTime.now())
                .estado(EstadoLigacao.ATIVA)
                .consumidor(consumidor)
                .funcionario(funcionario)
                .build();

        return toDTO(ligacaoAguaRepository.save(ligacao));
    }

    public LigacaoAguaResponseDTO updateEstado(Long id, LigacaoAguaEstadoUpdateDTO dto) {
        LigacaoAgua ligacao = findLigacao(id);

        if (dto.estado() == EstadoLigacao.ATIVA
                && ligacaoAguaRepository.existsByConsumidor_IdAndEstado(ligacao.getConsumidor().getId(), EstadoLigacao.ATIVA)
                && ligacao.getEstado() != EstadoLigacao.ATIVA) {
            throw new IllegalArgumentException("O consumidor ja possui outra ligacao ativa");
        }

        ligacao.setEstado(dto.estado());
        return toDTO(ligacaoAguaRepository.save(ligacao));
    }

    private LigacaoAgua findLigacao(Long id) {
        return ligacaoAguaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ligacao de agua nao encontrada: " + id));
    }

    private LigacaoAguaResponseDTO toDTO(LigacaoAgua ligacao) {
        CustomerWater consumidor = ligacao.getConsumidor();
        Funcionario funcionario = ligacao.getFuncionario();
        return new LigacaoAguaResponseDTO(
                ligacao.getId(),
                ligacao.getData(),
                ligacao.getEstado(),
                consumidor == null ? null : consumidor.getId(),
                consumidor == null ? "Consumidor nao identificado" : consumidor.getName(),
                consumidor == null ? null : consumidor.getHouseNR(),
                funcionario == null ? null : funcionario.getId(),
                funcionario == null ? "Operador nao identificado" : funcionario.getNome()
        );
    }
}
