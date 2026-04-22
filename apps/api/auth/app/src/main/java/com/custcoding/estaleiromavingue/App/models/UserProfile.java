package com.custcoding.estaleiromavingue.App.models;

import com.custcoding.estaleiromavingue.App.users.AppUser;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "user_profile", uniqueConstraints = {
        @UniqueConstraint(name = "uk_user_profile_user", columnNames = "user_id")
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // liga ao AppUser (conta de login)
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(nullable = false, length = 10)
    private String sexo; // HOMEM | MULHER

    @Column(nullable = false, length = 20)
    private String telefone;

    @Column(name = "data_nascimento", nullable = false)
    private LocalDate dataNascimento;

    @Column(nullable = false, length = 80)
    private String provincia;

    @Column(nullable = false, length = 80)
    private String cidade;

    @Column(nullable = false, length = 120)
    private String bairro;

}