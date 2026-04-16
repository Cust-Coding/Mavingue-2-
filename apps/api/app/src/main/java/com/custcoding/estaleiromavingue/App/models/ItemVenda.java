package com.custcoding.estaleiromavingue.App.models;

import jakarta.persistence.*;

@Entity
@Table(name = "item_venda")
public class ItemVenda {
     @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private int quantidade;

    @Column(name = "preco_unitario", nullable = false)
    private double precoUnitario;

    @Column(nullable = false)
    private double subtotal;

     @ManyToOne
    @JoinColumn(name = "id_venda", nullable = false)
    private Venda venda;

}
