package com.custcoding.estaleiromavingue.App.security;

import com.custcoding.estaleiromavingue.App.users.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VerificationTokenRepository extends JpaRepository<VerificationToken, Long> {
    Optional<VerificationToken> findByToken(String token);
    Optional<VerificationToken> findByUser (AppUser user);

}
