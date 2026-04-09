package com.custcoding.estaleiromavingue.App.security.tokens.resetpassword;


import com.custcoding.estaleiromavingue.App.users.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

public interface ResetPassowordTokenRepository extends JpaRepository<ResetPasswordToken, Long> {

    Optional<ResetPasswordToken> findByToken(String token);
    Optional<ResetPasswordToken> findByUser(AppUser user);


}
