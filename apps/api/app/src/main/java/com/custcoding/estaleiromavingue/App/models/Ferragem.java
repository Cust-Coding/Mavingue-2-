package com.custcoding.estaleiromavingue.App.models;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;


@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "ferragem")
public class Ferragem {
  @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String bairro;
    
    @ManyToOne
    @JoinColumn(name = "id_proprietario", nullable = false)
    private Owner owner;


    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime created;
}
