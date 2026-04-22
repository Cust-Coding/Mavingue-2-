package com.custcoding.estaleiromavingue.App.products;

import com.custcoding.estaleiromavingue.App.models.Product;
import com.custcoding.estaleiromavingue.App.models.Stock;
import com.custcoding.estaleiromavingue.App.products.dto.ProductCreateRequest;
import com.custcoding.estaleiromavingue.App.products.dto.ProductUpdateRequest;
import com.custcoding.estaleiromavingue.App.repositories.FerragemRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProductRepository;
import com.custcoding.estaleiromavingue.App.repositories.StockRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;
    private final StockRepository stockRepository;
    private final FerragemRepository ferragemRepository;

    public Product create(ProductCreateRequest req) {
        Product p = new Product();
        p.setName(req.name());
        p.setDescription(req.description());
        p.setPrice(req.price());
        p.setUrlImg(req.urlImg());
        Product saved = repo.save(p);

        ferragemRepository.findAll().stream().findFirst().ifPresent(ferragem -> {
            if (stockRepository.findByProduto_Id(saved.getId()).isEmpty()) {
                Stock stock = new Stock();
                stock.setProduto(saved);
                stock.setFerragem(ferragem);
                stock.setQuantidade(0);
                stock.setStockMinimo(0);
                stockRepository.save(stock);
            }
        });

        return saved;
    }

    @Transactional(readOnly = true)
    public List<Product> list() {
        return repo.findAll();
    }

    @Transactional(readOnly = true)
    public Product get(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + id));
    }

    public Product update(Long id, ProductUpdateRequest req) {
        Product p = get(id);

        if (req.name() != null) p.setName(req.name());
        if (req.description() != null) p.setDescription(req.description());
        if (req.price() != null) p.setPrice(req.price());
        if (req.urlImg() != null) p.setUrlImg(req.urlImg());

        return repo.save(p);
    }

    public void delete(Long id) {
        Product product =  repo.findById(id)
                        .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + id));
        repo.delete(product);
    }
    public Integer getAvailableStock(Long productId) {
        return stockRepository.findByProduto_Id(productId)
                .map(stock -> stock.getQuantidade() == null ? 0 : stock.getQuantidade())
                .orElse(0);
    }
}
