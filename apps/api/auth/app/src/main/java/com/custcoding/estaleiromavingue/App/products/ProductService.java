package com.custcoding.estaleiromavingue.App.products;

import com.custcoding.estaleiromavingue.App.models.Product;
import com.custcoding.estaleiromavingue.App.models.Stock;
import com.custcoding.estaleiromavingue.App.products.dto.ProductCreateRequest;
import com.custcoding.estaleiromavingue.App.products.dto.ProductUpdateRequest;
import com.custcoding.estaleiromavingue.App.repositories.FerragemRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProductCategoryRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProductRepository;
import com.custcoding.estaleiromavingue.App.repositories.StockRepository;
import com.custcoding.estaleiromavingue.App.services.AuditLogService;
import com.custcoding.estaleiromavingue.App.services.ProductCategoryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository repo;
    private final StockRepository stockRepository;
    private final FerragemRepository ferragemRepository;
    private final ProductCategoryRepository productCategoryRepository;
    private final ProductCategoryService productCategoryService;
    private final AuditLogService auditLogService;

    public Product create(String userIdFromAuth, ProductCreateRequest req) {
        Product product = new Product();
        product.setName(req.name());
        product.setDescription(req.description());
        product.setPrice(req.price());
        product.setCategory(normalizeCategory(req.category()));
        product.setUrlImg(req.urlImg());
        Product saved = repo.save(product);

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

        auditLogService.logByUserId(userIdFromAuth, "PRODUCT_CREATE", "PRODUCT", saved.getId(), "Produto criado: " + saved.getName());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Product> list() {
        return repo.findAllByAtivoTrueOrderByIdDesc();
    }

    @Transactional(readOnly = true)
    public Product get(Long id) {
        return findActiveProduct(id);
    }

    public Product update(String userIdFromAuth, Long id, ProductUpdateRequest req) {
        Product product = findActiveProduct(id);

        if (req.name() != null) product.setName(req.name());
        if (req.description() != null) product.setDescription(req.description());
        if (req.price() != null) product.setPrice(req.price());
        if (req.category() != null) product.setCategory(normalizeCategory(req.category()));
        if (req.urlImg() != null) product.setUrlImg(req.urlImg());

        Product saved = repo.save(product);
        auditLogService.logByUserId(userIdFromAuth, "PRODUCT_UPDATE", "PRODUCT", saved.getId(), "Produto actualizado: " + saved.getName());
        return saved;
    }

    @Transactional
    public void delete(String userIdFromAuth, Long id) {
        Product product = findActiveProduct(id);
        product.setAtivo(Boolean.FALSE);
        product.setApagadoEm(LocalDateTime.now());
        repo.save(product);
        auditLogService.logByUserId(userIdFromAuth, "PRODUCT_DELETE", "PRODUCT", id, "Produto arquivado: " + product.getName());
    }

    public Integer getAvailableStock(Long productId) {
        return stockRepository.findByProduto_Id(productId)
                .map(stock -> stock.getQuantidade() == null ? 0 : stock.getQuantidade())
                .orElse(0);
    }

    private String normalizeCategory(String value) {
        productCategoryService.ensureDefaultCategories();
        if (value == null || value.isBlank()) {
            return "construcao";
        }
        String normalized = value.trim().toLowerCase();
        return productCategoryRepository.findBySlug(normalized)
                .map(category -> category.getSlug())
                .orElse(normalized);
    }

    private Product findActiveProduct(Long id) {
        return repo.findByIdAndAtivoTrue(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto nao encontrado: " + id));
    }
}
