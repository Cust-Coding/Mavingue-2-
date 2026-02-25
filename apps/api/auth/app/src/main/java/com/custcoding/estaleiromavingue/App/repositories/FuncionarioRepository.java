package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.Funcionario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FuncionarioRepository extends JpaRepository<Funcionario, Long> {}
