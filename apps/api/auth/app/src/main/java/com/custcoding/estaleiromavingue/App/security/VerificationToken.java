package com.custcoding.estaleiromavingue.App.security;


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

    @OneToOne
    @JoinColumn(name = "user_id")
    private AppUser user;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime expiryDate;

    public Boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }




}
