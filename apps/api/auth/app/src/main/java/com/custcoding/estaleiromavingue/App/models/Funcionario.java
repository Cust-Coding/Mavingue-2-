package com.custcoding.estaleiromavingue.App.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "funcionario")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Funcionario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 50)
    private String cargo;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(nullable = false, length = 20, unique = true)
    private String telefone;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_ferragem", nullable = false)
    private Ferragem ferragem;

    @ManyToOne(optional = false)
    @JoinColumn(name = "id_proprietario", nullable = false)
    private Owner owner;
}
