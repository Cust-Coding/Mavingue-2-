package com.custcoding.estaleiromavingue.App.security.tokens.resetpassword;


import com.custcoding.estaleiromavingue.App.users.AppUser;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table
@Data
public class ResetPasswordToken {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    private String code;

    @OneToOne
    @JoinColumn(name = "user_id")
    private AppUser user;

    @CreationTimestamp
    private LocalDateTime expiryDate;

    public Boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    public Boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }



}
