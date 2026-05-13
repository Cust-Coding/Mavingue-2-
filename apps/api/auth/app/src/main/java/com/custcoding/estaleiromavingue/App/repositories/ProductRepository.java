package com.custcoding.estaleiromavingue.App.repositories;

import com.custcoding.estaleiromavingue.App.models.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByAtivoTrueOrderByIdDesc();
    List<Product> findAllByCategoryAndAtivoTrue(String category);
    Optional<Product> findByIdAndAtivoTrue(Long id);
}
