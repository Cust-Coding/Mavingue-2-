package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {}
