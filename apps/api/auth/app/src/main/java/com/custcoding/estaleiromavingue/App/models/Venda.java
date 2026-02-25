package com.custcoding.estaleiromavingue.App.models;

import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "venda")
public class Venda {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_produto", nullable = false)
    private Product produto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_cliente", nullable = false)
    private CustomerProduct cliente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_funcionario", nullable = false)
    private Funcionario funcionario;

    @Column(nullable = false)
    private Integer quantidade;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", nullable = false)
    private FormaPagamento formaPagamento;

    // opcional (se quiseres guardar o total calculado)
    @Column(name = "total", precision = 18, scale = 2)
    private BigDecimal total;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();
}
