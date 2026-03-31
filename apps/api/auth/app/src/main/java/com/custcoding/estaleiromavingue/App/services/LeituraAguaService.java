package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.leitura_agua.LeituraAguaCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.leitura_agua.LeituraAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.models.LeituraAgua;
import com.custcoding.estaleiromavingue.App.models.LigacaoAgua;
import com.custcoding.estaleiromavingue.App.models.status.EstadoLigacao;
import com.custcoding.estaleiromavingue.App.repositories.LeituraAguaRepository;
import com.custcoding.estaleiromavingue.App.repositories.LigacaoAguaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeituraAguaService {

    private final LeituraAguaRepository leituraAguaRepository;
    private final LigacaoAguaRepository ligacaoAguaRepository;

    public List<LeituraAguaResponseDTO> list() {
        return leituraAguaRepository.findAll().stream().map(this::toDTO).toList();
    }

    public List<LeituraAguaResponseDTO> listByLigacao(Long ligacaoId) {
        ensureLigacaoExists(ligacaoId);
        return leituraAguaRepository.findByLigacao_IdOrderByDataDesc(ligacaoId).stream()
                .map(this::toDTO)
                .toList();
    }

    public LeituraAguaResponseDTO get(Long id) {
        return toDTO(findLeitura(id));
    }

    public LeituraAguaResponseDTO create(LeituraAguaCreateDTO dto) {
        LigacaoAgua ligacao = ligacaoAguaRepository.findById(dto.ligacaoId())
                .orElseThrow(() -> new EntityNotFoundException("Ligacao de agua nao encontrada: " + dto.ligacaoId()));

        if (ligacao.getEstado() != EstadoLigacao.ATIVA) {
            throw new IllegalArgumentException("A leitura so pode ser registrada para ligacoes ativas");
        }

        double leituraAnterior = leituraAguaRepository.findTopByLigacao_IdOrderByDataDesc(ligacao.getId())
                .map(LeituraAgua::getLeituraActual)
                .orElse(0.0);

        if (dto.leituraActual() < leituraAnterior) {
            throw new IllegalArgumentException("A leitura actual nao pode ser menor que a leitura anterior");
        }

        double consumo = dto.leituraActual() - leituraAnterior;
        double valorPagar = consumo * dto.precoM3();

        LeituraAgua leitura = LeituraAgua.builder()
                .data(LocalDateTime.now())
                .leituraAnterior(leituraAnterior)
                .leituraActual(dto.leituraActual())
                .consumoM3(consumo)
                .valorPagar(valorPagar)
                .ligacao(ligacao)
                .build();

        return toDTO(leituraAguaRepository.save(leitura));
    }

    private void ensureLigacaoExists(Long ligacaoId) {
        if (!ligacaoAguaRepository.existsById(ligacaoId)) {
            throw new EntityNotFoundException("Ligacao de agua nao encontrada: " + ligacaoId);
        }
    }

    private LeituraAgua findLeitura(Long id) {
        return leituraAguaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Leitura de agua nao encontrada: " + id));
    }

    private LeituraAguaResponseDTO toDTO(LeituraAgua leitura) {
        return new LeituraAguaResponseDTO(
                leitura.getId(),
                leitura.getData(),
                leitura.getLeituraAnterior(),
                leitura.getLeituraActual(),
                leitura.getConsumoM3(),
                leitura.getValorPagar(),
                leitura.getLigacao().getId()
        );
    }
}
