package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.Owner; // se o teu model é Owner
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProprietarioRepository extends JpaRepository<Owner, Long> {
    Optional<Owner> findByEmail(String email);
}
