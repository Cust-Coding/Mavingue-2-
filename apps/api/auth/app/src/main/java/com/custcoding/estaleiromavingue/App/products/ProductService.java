package com.custcoding.estaleiromavingue.App.products;

import com.custcoding.estaleiromavingue.App.models.Product;
import com.custcoding.estaleiromavingue.App.products.dto.ProductCreateRequest;
import com.custcoding.estaleiromavingue.App.products.dto.ProductUpdateRequest;
import com.custcoding.estaleiromavingue.App.repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;

    public Product create(ProductCreateRequest req) {
        Product p = new Product();
        p.setName(req.name());
        p.setDescription(req.description());
        p.setPrice(req.price());
        return repo.save(p);
    }

    public List<Product> list() {
        return repo.findAll();
    }

    public Product get(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + id));
    }

    public Product update(Long id, ProductUpdateRequest req) {
        Product p = get(id);

        if (req.name() != null) p.setName(req.name());
        if (req.description() != null) p.setDescription(req.description());
        if (req.price() != null) p.setPrice(req.price());

        return repo.save(p);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Produto não encontrado: " + id);
        }
        repo.deleteById(id);
    }
}
