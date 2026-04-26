package com.custcoding.estaleiromavingue.App.models;

import com.custcoding.estaleiromavingue.App.models.status.Sexo;
import com.custcoding.estaleiromavingue.App.users.AppUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "t_customer_product")
public class CustomerProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nome completo
    @Column(nullable = false, length = 150)
    private String name;

    // Sexo (HOMEM | MULHER)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Sexo sex;

    // Celular
    @Column(nullable = false, length = 20, unique = true)
    private String phone;

    // Email (login/contacto)
    @Column(nullable = true, unique = true, length = 120)
    private String email;

    // Data nascimento
    @Column(name = "data_nascimento", nullable = false)
    private LocalDate birthDate;

    // Localização (mais usada em MZ)
    @Column(nullable = false, length = 80)
    private String provincia;

    @Column(nullable = false, length = 80)
    private String cidade;

    @Column(nullable = false, length = 80)
    private String bairro;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_user_id")
    private AppUser appUser;

    @Column(name = "elegivel_conta", nullable = true)
    @Builder.Default
    private Boolean elegivelConta = Boolean.FALSE;

    @Column(name = "conta_activa", nullable = true)
    @Builder.Default
    private Boolean contaActiva = Boolean.FALSE;

    @Column(name = "tem_servico_agua", nullable = true)
    @Builder.Default
    private Boolean temServicoAgua = Boolean.FALSE;

    @Column(name = "observacoes", length = 255)
    private String observacoes;

    @Column(name = "data_criacao")
    @CreationTimestamp
    private LocalDateTime created;
}
