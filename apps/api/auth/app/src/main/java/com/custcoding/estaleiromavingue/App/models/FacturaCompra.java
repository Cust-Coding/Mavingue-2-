package com.custcoding.estaleiromavingue.App.models;

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
@Table(name = "factura_compra")
public class FacturaCompra {

 @Id
 @GeneratedValue(strategy = GenerationType.IDENTITY)
 private Long id;

 @ManyToOne(fetch = FetchType.LAZY, optional = false)
 @JoinColumn(name = "id_produto", nullable = false)
 private Product produto;

 @ManyToOne(fetch = FetchType.LAZY, optional = false)
 @JoinColumn(name = "id_funcionario", nullable = false)
 private Funcionario funcionario;

 @Column(nullable = false)
 private Integer quantidade;

 @Column(name = "preco_unit", precision = 18, scale = 2)
 private BigDecimal precoUnit;

 @Column(name = "total", precision = 18, scale = 2)
 private BigDecimal total;

 @Column(name = "criado_em", nullable = false)
 private Instant criadoEm = Instant.now();
}
