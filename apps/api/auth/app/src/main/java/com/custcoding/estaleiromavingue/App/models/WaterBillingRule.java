package com.custcoding.estaleiromavingue.App.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "water_billing_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WaterBillingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "preco_m3", nullable = false, precision = 18, scale = 2)
    private BigDecimal precoM3;

    @Column(name = "taxa_fixa", nullable = false, precision = 18, scale = 2)
    private BigDecimal taxaFixa;

    @Column(name = "percentual_multa", precision = 5, scale = 2)
    private BigDecimal percentualMulta;

    @Column(name = "descricao", length = 180)
    private String descricao;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false)
    private LocalDateTime criadoEm;
}
