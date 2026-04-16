package com.custcoding.estaleiromavingue.App.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "table_product")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 150)
    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @NotBlank
    @Size(max = 150)
    @Column(name = "description", nullable = false, length = 150)
    private String description;

    @DecimalMin(value = "0.0", inclusive = false)
    @Column(name = "price", nullable = false, precision = 38, scale = 2)
    private BigDecimal price;

    @Size(max = 500)
    @Column(name = "url_img", length = 500)
    private String urlImg;
}
