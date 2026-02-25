package com.custcoding.estaleiromavingue.App.models;

import com.custcoding.estaleiromavingue.App.models.status.Sexo;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
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
    @Column(nullable = false, length = 20)
    private String phone;

    // Email (login/contacto)
    @Column(nullable = false, unique = true, length = 120)
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

    @Column(nullable = false, length = 180)
    private String endereco;

    // Opcional (mas útil)
    @Column(length = 20, unique = true)
    private String nuit;

    @Column(name = "numero_documento", length = 40)
    private String numeroDocumento;

    @Column(name = "tipo_documento", length = 40)
    private String tipoDocumento;

    @Column(name = "data_criacao")
    @CreationTimestamp
    private LocalDateTime created;
}