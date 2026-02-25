package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    boolean existsByUser_Id(Long userId);
}