package com.custcoding.estaleiromavingue.App.models;

import com.custcoding.estaleiromavingue.App.models.status.EstadoServicoAgua;
import com.custcoding.estaleiromavingue.App.users.AppUser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer_water")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerWater {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;
    @Column(nullable = false, length = 20)
    private String phone;
    @Column(nullable = true)
    private String email;

    @Column(name = "nr_casa", length = 20)
    private String houseNR;

    @Column(name = "referencia_local", length = 180)
    private String referenciaLocal;
    
    @ManyToOne
    @JoinColumn(name = "id_zona", nullable = true)
    private Adress adressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private CustomerProduct customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "app_user_id")
    private AppUser appUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 40)
    private EstadoServicoAgua estado = EstadoServicoAgua.PENDENTE_APROVACAO;

    @Column(name = "pedido_agua", nullable = false)
    private Boolean pedidoAgua = Boolean.TRUE;

    @Column(name = "activo", nullable = false)
    private Boolean activo = Boolean.FALSE;

    @Column(name = "observacoes", length = 255)
    private String observacoes;

    @Column(name = "data_criacao", nullable = true)
    @CreationTimestamp
    private LocalDateTime created;

    @Column(name = "data_actualizacao")
    private LocalDateTime updated;
}
