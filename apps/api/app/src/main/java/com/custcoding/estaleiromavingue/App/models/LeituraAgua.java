package com.custcoding.estaleiromavingue.App.models;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "leituras_agua")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeituraAgua {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime data;

    @Column(name = "leitura_anterior", nullable = false)
    private double leituraAnterior;

    @Column(name = "leitura_actual", nullable = false)
    private double leituraActual;

    @Column(name = "consumo_m3", nullable = false)
    private double consumoM3;

    @Column(name = "valor_pagar", nullable = false)
    private double valorPagar;

    @ManyToOne
    @JoinColumn(name = "id_ligacao", nullable = false)
    private LigacaoAgua ligacao;

    @PrePersist
    @PreUpdate
    private void calcularConsumo() {
        this.consumoM3 = Math.max(0, this.leituraActual - this.leituraAnterior);
    }
}
