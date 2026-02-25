package com.custcoding.estaleiromavingue.App.models;

import com.custcoding.estaleiromavingue.App.models.status.TipoMovimento;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "movimento_stock")
public class MovimentoStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_produto", nullable = false)
    private Product produto;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_ferragem", nullable = false)
    private Ferragem ferragem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimento tipo; // ENTRADA / SAIDA

    @Column(nullable = false)
    private Integer quantidade;

    @Column(length = 255)
    private String motivo;

    @Column(name = "criado_em", nullable = false)
    private Instant criadoEm = Instant.now();
}
