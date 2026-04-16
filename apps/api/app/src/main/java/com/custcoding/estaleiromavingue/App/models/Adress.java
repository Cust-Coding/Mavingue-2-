package com.custcoding.estaleiromavingue.App.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "zonas")
public class Adress {
    
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String bairro;

    @ManyToOne
    @JoinColumn(name = "id_ferragem", nullable = false)
    private Ferragem ferragem;
}
