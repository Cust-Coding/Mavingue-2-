package com.custcoding.estaleiromavingue.App.models;
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
    @Column(nullable = false)
    private String email;

    @Column(name = "nr_casa", nullable = false, length = 20)
    private String houseNR;
    
    @ManyToOne
    @JoinColumn(name = "id_zona", nullable = true)
    private Adress adressId;

    @Column(name = "data_criacao", nullable = true)
    @CreationTimestamp
    private LocalDateTime created;
  
}
