package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.factura_agua.FacturaAguaMultaAplicacaoDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_agua.FacturaAguaPagamentoDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_agua.FacturaAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.models.CustomerWater;
import com.custcoding.estaleiromavingue.App.models.FacturaAgua;
import com.custcoding.estaleiromavingue.App.models.LeituraAgua;
import com.custcoding.estaleiromavingue.App.models.status.EstadoPagamento;
import com.custcoding.estaleiromavingue.App.repositories.FacturaAguaRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacturaAguaService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);

    private final FacturaAguaRepository facturaAguaRepository;

    @Transactional(readOnly = true)
    public List<FacturaAguaResponseDTO> list(Long consumidorId) {
        List<FacturaAgua> facturas = consumidorId == null
                ? facturaAguaRepository.findAll()
                : facturaAguaRepository.findByConsumidor_IdOrderByDataDesc(consumidorId);

        return facturas.stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public List<FacturaAguaResponseDTO> listByConsumidor(Long consumidorId) {
        return facturaAguaRepository.findByConsumidor_IdOrderByDataDesc(consumidorId).stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public FacturaAguaResponseDTO get(Long id) {
        return toDTO(findById(id));
    }

    @Transactional
    public FacturaAguaResponseDTO pagar(Long id, FacturaAguaPagamentoDTO dto) {
        List<FacturaAgua> facturas = resolveFacturasForPayment(id, dto.facturaIds());
        FacturaAgua facturaPrincipal = facturas.stream()
                .filter(factura -> Objects.equals(factura.getId(), id))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Factura de agua nao encontrada: " + id));

        BigDecimal total = facturas.stream()
                .map(this::resolveTotalDue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal valorPago = dto.valorPago() == null ? total : dto.valorPago();
        if (valorPago.compareTo(total) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valor pago insuficiente para concluir o pagamento");
        }

        BigDecimal troco = valorPago.subtract(total);
        for (FacturaAgua factura : facturas) {
            factura.setEstadoPagamento(EstadoPagamento.PAGO);
            factura.setFormaPagamento(dto.formaPagamento());
            if (Objects.equals(factura.getId(), facturaPrincipal.getId())) {
                factura.setValorPago(valorPago);
                factura.setTroco(troco);
            } else {
                factura.setValorPago(resolveTotalDue(factura));
                factura.setTroco(BigDecimal.ZERO);
            }
        }

        facturaAguaRepository.saveAll(facturas);
        return toDTO(facturaPrincipal);
    }

    @Transactional
    public List<FacturaAguaResponseDTO> aplicarMulta(FacturaAguaMultaAplicacaoDTO dto) {
        List<FacturaAgua> facturas = resolveFacturasForPenalty(dto);
        if (facturas.isEmpty()) {
            return List.of();
        }

        List<FacturaAgua> actualizadas = new ArrayList<>();
        for (FacturaAgua factura : facturas) {
            if (factura.getEstadoPagamento() == EstadoPagamento.PAGO) {
                continue;
            }

            if (BigDecimal.valueOf(factura.getMultaValor() == null ? 0d : factura.getMultaValor()).compareTo(BigDecimal.ZERO) > 0) {
                actualizadas.add(factura);
                continue;
            }

            BigDecimal multaValor = calculatePenaltyAmount(factura);
            factura.setMultaValor(multaValor.doubleValue());
            factura.setEstadoPagamento(multaValor.compareTo(BigDecimal.ZERO) > 0 ? EstadoPagamento.ATRASADO : EstadoPagamento.PENDENTE);
            actualizadas.add(factura);
        }

        facturaAguaRepository.saveAll(actualizadas);
        return actualizadas.stream().map(this::toDTO).toList();
    }

    private FacturaAgua findById(Long id) {
        return facturaAguaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Factura de agua nao encontrada: " + id));
    }

    public FacturaAguaResponseDTO toDTO(FacturaAgua factura) {
        CustomerWater consumidor = factura.getConsumidor();
        LeituraAgua leitura = factura.getLeitura();
        BigDecimal valorFactura = resolveInvoiceAmount(factura);
        BigDecimal multaValor = resolvePenaltyAmount(factura);
        BigDecimal totalDue = resolveTotalDue(factura);
        return new FacturaAguaResponseDTO(
                factura.getId(),
                factura.getData(),
                factura.getTaxaFixa(),
                factura.getValor(),
                valorFactura.doubleValue(),
                totalDue.doubleValue(),
                resolvePenaltyPercent(factura).doubleValue(),
                multaValor.doubleValue(),
                0d,
                resolvePaymentStatus(factura),
                factura.getFormaPagamento(),
                factura.getValorPago(),
                factura.getTroco(),
                consumidor == null ? null : consumidor.getId(),
                consumidor == null ? "Consumidor nao identificado" : consumidor.getName(),
                consumidor == null ? null : consumidor.getHouseNR(),
                leitura == null ? null : leitura.getId(),
                leitura == null || leitura.getLigacao() == null ? null : leitura.getLigacao().getId(),
                leitura == null ? null : leitura.getLeituraAnterior(),
                leitura == null ? null : leitura.getLeituraActual(),
                leitura == null ? null : leitura.getConsumoM3()
        );
    }

    private EstadoPagamento resolvePaymentStatus(FacturaAgua factura) {
        if (factura.getEstadoPagamento() == EstadoPagamento.PAGO) {
            return EstadoPagamento.PAGO;
        }
        return resolvePenaltyAmount(factura).compareTo(BigDecimal.ZERO) > 0
                ? EstadoPagamento.ATRASADO
                : EstadoPagamento.PENDENTE;
    }

    private BigDecimal resolvePenaltyAmount(FacturaAgua factura) {
        Double multaValor = factura.getMultaValor();
        if (multaValor == null || multaValor <= 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(multaValor).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculatePenaltyAmount(FacturaAgua factura) {
        BigDecimal percentual = resolvePenaltyPercent(factura);
        if (percentual.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        return resolveInvoiceAmount(factura)
                .multiply(percentual)
                .divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP);
    }

    private BigDecimal resolveTotalDue(FacturaAgua factura) {
        return resolveInvoiceAmount(factura).add(resolvePenaltyAmount(factura));
    }

    private BigDecimal resolveInvoiceAmount(FacturaAgua factura) {
        BigDecimal storedTotal = BigDecimal.valueOf(factura.getValorTotal()).setScale(2, RoundingMode.HALF_UP);
        if (storedTotal.compareTo(BigDecimal.ZERO) > 0) {
            return storedTotal;
        }
        return BigDecimal.valueOf(factura.getValor() + factura.getTaxaFixa()).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal resolvePenaltyPercent(FacturaAgua factura) {
        Double percentual = factura.getPercentualMulta();
        if (percentual == null || percentual <= 0) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(Math.min(percentual, 100d));
    }

    private List<FacturaAgua> resolveFacturasForPayment(Long id, List<Long> requestedIds) {
        LinkedHashSet<Long> ids = sanitizeIds(requestedIds);
        ids.add(id);

        List<FacturaAgua> facturas = fetchFacturas(ids);
        FacturaAgua principal = facturas.stream()
                .filter(factura -> Objects.equals(factura.getId(), id))
                .findFirst()
                .orElseThrow(() -> new EntityNotFoundException("Factura de agua nao encontrada: " + id));

        if (principal.getEstadoPagamento() == EstadoPagamento.PAGO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A factura seleccionada ja foi paga");
        }

        Long consumidorId = principal.getConsumidor() == null ? null : principal.getConsumidor().getId();
        Long ligacaoId = principal.getLeitura() == null || principal.getLeitura().getLigacao() == null
                ? null
                : principal.getLeitura().getLigacao().getId();

        for (FacturaAgua factura : facturas) {
            if (factura.getEstadoPagamento() == EstadoPagamento.PAGO) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A seleccao de pagamento contem facturas ja pagas");
            }

            Long facturaConsumidorId = factura.getConsumidor() == null ? null : factura.getConsumidor().getId();
            Long facturaLigacaoId = factura.getLeitura() == null || factura.getLeitura().getLigacao() == null
                    ? null
                    : factura.getLeitura().getLigacao().getId();

            if (!Objects.equals(consumidorId, facturaConsumidorId) || !Objects.equals(ligacaoId, facturaLigacaoId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O pagamento conjunto deve usar facturas do mesmo contrato");
            }
        }

        return facturas;
    }

    private List<FacturaAgua> resolveFacturasForPenalty(FacturaAguaMultaAplicacaoDTO dto) {
        LinkedHashSet<Long> ids = sanitizeIds(dto == null ? null : dto.facturaIds());
        if (ids.isEmpty()) {
            return facturaAguaRepository.findByEstadoPagamentoNotOrderByDataAsc(EstadoPagamento.PAGO);
        }
        return fetchFacturas(ids).stream()
                .filter(factura -> factura.getEstadoPagamento() != EstadoPagamento.PAGO)
                .toList();
    }

    private List<FacturaAgua> fetchFacturas(LinkedHashSet<Long> ids) {
        Map<Long, FacturaAgua> facturasById = facturaAguaRepository.findAllById(ids).stream()
                .collect(Collectors.toMap(FacturaAgua::getId, Function.identity()));

        if (facturasById.size() != ids.size()) {
            throw new EntityNotFoundException("Uma ou mais facturas de agua nao foram encontradas");
        }

        return ids.stream()
                .map(facturasById::get)
                .toList();
    }

    private LinkedHashSet<Long> sanitizeIds(List<Long> ids) {
        LinkedHashSet<Long> uniqueIds = new LinkedHashSet<>();
        if (ids == null) {
            return uniqueIds;
        }

        for (Long id : ids) {
            if (id != null) {
                uniqueIds.add(id);
            }
        }
        return uniqueIds;
    }
}
