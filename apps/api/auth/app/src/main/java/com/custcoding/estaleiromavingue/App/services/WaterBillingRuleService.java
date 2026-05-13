package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.water_billing.WaterBillingRuleCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.water_billing.WaterBillingRuleResponseDTO;
import com.custcoding.estaleiromavingue.App.models.WaterBillingRule;
import com.custcoding.estaleiromavingue.App.repositories.WaterBillingRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WaterBillingRuleService {

    public static final BigDecimal DEFAULT_PRECO_M3 = BigDecimal.valueOf(45);
    public static final BigDecimal DEFAULT_TAXA_FIXA = BigDecimal.valueOf(150);
    public static final BigDecimal DEFAULT_PERCENTUAL_MULTA = BigDecimal.ZERO;

    private final WaterBillingRuleRepository waterBillingRuleRepository;

    @Transactional(readOnly = true)
    public List<WaterBillingRuleResponseDTO> list() {
        return waterBillingRuleRepository.findAllByOrderByCriadoEmDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public WaterBillingRuleResponseDTO current() {
        return waterBillingRuleRepository.findFirstByActivoTrueOrderByCriadoEmDesc()
                .map(this::toResponse)
                .orElse(new WaterBillingRuleResponseDTO(
                        null,
                        DEFAULT_PRECO_M3,
                        DEFAULT_TAXA_FIXA,
                        DEFAULT_PERCENTUAL_MULTA,
                        "Regra padrao do sistema",
                        true,
                        LocalDateTime.now()
                ));
    }

    @Transactional
    public WaterBillingRuleResponseDTO create(WaterBillingRuleCreateDTO dto) {
        waterBillingRuleRepository.findByActivoTrue().forEach(rule -> {
            rule.setActivo(false);
            waterBillingRuleRepository.save(rule);
        });

        WaterBillingRule saved = waterBillingRuleRepository.save(WaterBillingRule.builder()
                .precoM3(dto.precoM3())
                .taxaFixa(dto.taxaFixa() == null ? DEFAULT_TAXA_FIXA : dto.taxaFixa())
                .percentualMulta(dto.percentualMulta() == null ? DEFAULT_PERCENTUAL_MULTA : dto.percentualMulta())
                .descricao(dto.descricao() == null || dto.descricao().isBlank()
                        ? "Regra de cobranca por metro cubico"
                        : dto.descricao().trim())
                .activo(true)
                .build());

        return toResponse(saved);
    }

    public BigDecimal currentPrecoM3() {
        return waterBillingRuleRepository.findFirstByActivoTrueOrderByCriadoEmDesc()
                .map(WaterBillingRule::getPrecoM3)
                .orElse(DEFAULT_PRECO_M3);
    }

    public BigDecimal currentTaxaFixa() {
        return waterBillingRuleRepository.findFirstByActivoTrueOrderByCriadoEmDesc()
                .map(WaterBillingRule::getTaxaFixa)
                .orElse(DEFAULT_TAXA_FIXA);
    }

    public BigDecimal currentPercentualMulta() {
        return waterBillingRuleRepository.findFirstByActivoTrueOrderByCriadoEmDesc()
                .map(WaterBillingRule::getPercentualMulta)
                .filter(percentual -> percentual != null)
                .orElse(DEFAULT_PERCENTUAL_MULTA);
    }

    private WaterBillingRuleResponseDTO toResponse(WaterBillingRule rule) {
        return new WaterBillingRuleResponseDTO(
                rule.getId(),
                rule.getPrecoM3(),
                rule.getTaxaFixa(),
                rule.getPercentualMulta() == null ? DEFAULT_PERCENTUAL_MULTA : rule.getPercentualMulta(),
                rule.getDescricao(),
                rule.getActivo(),
                rule.getCriadoEm()
        );
    }
}
