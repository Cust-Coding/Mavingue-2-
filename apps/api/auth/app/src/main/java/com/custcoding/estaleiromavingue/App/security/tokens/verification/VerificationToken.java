package com.custcoding.estaleiromavingue.App.security.tokens.verification;


import com.custcoding.estaleiromavingue.App.users.AppUser;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table
@Data
public class VerificationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    private String code;

    @OneToOne
    @JoinColumn(name = "user_id")
    private AppUser user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    public Boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }




}
