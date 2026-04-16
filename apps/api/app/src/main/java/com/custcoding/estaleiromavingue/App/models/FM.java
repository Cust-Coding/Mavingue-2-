package com.custcoding.estaleiromavingue.App.models;


import jakarta.persistence.*;

@Entity
@Table(name = "fm")
public class FM {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

   @Column(nullable = false, length = 20)
    private String telefone;


   @Column(nullable = false, unique = true, length = 100)
    private String email;
}
