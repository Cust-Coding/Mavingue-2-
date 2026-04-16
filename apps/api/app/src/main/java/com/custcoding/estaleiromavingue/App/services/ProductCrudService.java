package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.product.*;
import com.custcoding.estaleiromavingue.App.models.Product;
import com.custcoding.estaleiromavingue.App.repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductCrudService {

    private final ProductRepository repo;

    public ProductCrudService(ProductRepository repo) {
        this.repo = repo;
    }

    public ProductResponseDTO create(ProductCreateDTO dto) {
        Product p = new Product();
        p.setName(dto.name());
        p.setDescription(dto.description());
        p.setPrice(dto.price());
        p.setUrlImg(dto.urlImg());
        p = repo.save(p);
        return toDTO(p);
    }

    public List<ProductResponseDTO> list() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    public ProductResponseDTO get(Long id) {
        return toDTO(repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + id)));
    }

    public ProductResponseDTO update(Long id, ProductUpdateDTO dto) {
        Product p = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + id));
        p.setName(dto.name());
        p.setDescription(dto.description());
        p.setPrice(dto.price());
        p.setUrlImg(dto.urlImg());
        p = repo.save(p);
        return toDTO(p);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new EntityNotFoundException("Produto não encontrado: " + id);
        repo.deleteById(id);
    }

    private ProductResponseDTO toDTO(Product p) {
        return new ProductResponseDTO(p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.getUrlImg());
    }
}
