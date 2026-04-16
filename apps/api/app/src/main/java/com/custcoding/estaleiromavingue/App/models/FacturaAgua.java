package com.custcoding.estaleiromavingue.App.models;
import com.custcoding.estaleiromavingue.App.models.status.EstadoPagamento;
import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "facturas_agua")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacturaAgua {
   @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime data;

    @Column(name = "taxa_fixa", nullable = false)
    private double taxaFixa;

    @Column(nullable = false)
    private double valor;
    
    @Column(name = "valor_total", nullable = false)
    private double valorTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado_pagamento", nullable = false)
    private EstadoPagamento estadoPagamento;

    @Enumerated(EnumType.STRING)
    @Column(name = "forma_pagamento", nullable = false)
    private FormaPagamento formaPagamento;

     @ManyToOne
    @JoinColumn(name = "id_consumidor", nullable = false)
    private CustomerWater consumidor;

    @ManyToOne
    @JoinColumn(name = "id_leitura", nullable = false)
    private LeituraAgua leitura;
}
