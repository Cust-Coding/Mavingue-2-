package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.factura_agua.FacturaAguaPagamentoDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_agua.FacturaAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.models.FacturaAgua;
import com.custcoding.estaleiromavingue.App.models.status.EstadoPagamento;
import com.custcoding.estaleiromavingue.App.repositories.FacturaAguaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacturaAguaService {

    private final FacturaAguaRepository facturaAguaRepository;

    public List<FacturaAguaResponseDTO> list(Long consumidorId) {
        List<FacturaAgua> facturas = consumidorId == null
                ? facturaAguaRepository.findAll()
                : facturaAguaRepository.findByConsumidor_IdOrderByDataDesc(consumidorId);

        return facturas.stream().map(this::toDTO).toList();
    }

    public List<FacturaAguaResponseDTO> listByConsumidor(Long consumidorId) {
        return facturaAguaRepository.findByConsumidor_IdOrderByDataDesc(consumidorId).stream()
                .map(this::toDTO)
                .toList();
    }

    public FacturaAguaResponseDTO get(Long id) {
        return toDTO(findById(id));
    }

    public FacturaAguaResponseDTO pagar(Long id, FacturaAguaPagamentoDTO dto) {
        FacturaAgua factura = findById(id);
        factura.setEstadoPagamento(EstadoPagamento.PAGO);
        factura.setFormaPagamento(dto.formaPagamento());
        return toDTO(facturaAguaRepository.save(factura));
    }

    private FacturaAgua findById(Long id) {
        return facturaAguaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Factura de agua nao encontrada: " + id));
    }

    public FacturaAguaResponseDTO toDTO(FacturaAgua factura) {
        return new FacturaAguaResponseDTO(
                factura.getId(),
                factura.getData(),
                factura.getTaxaFixa(),
                factura.getValor(),
                factura.getValorTotal(),
                factura.getEstadoPagamento(),
                factura.getFormaPagamento(),
                factura.getConsumidor().getId(),
                factura.getConsumidor().getName(),
                factura.getLeitura().getId()
        );
    }
}
