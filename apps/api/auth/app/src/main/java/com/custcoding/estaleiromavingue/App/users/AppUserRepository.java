package com.custcoding.estaleiromavingue.App.users;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByEmail(String email);
    Optional<AppUser> findByPhone(String phone);
    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);
    List<AppUser> findByStatusOrderByNomeAsc(UserStatus status);

}

