package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.product_category.ProductCategoryCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.product_category.ProductCategoryResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.product_category.ProductCategoryUpdateDTO;
import com.custcoding.estaleiromavingue.App.models.Product;
import com.custcoding.estaleiromavingue.App.models.ProductCategory;
import com.custcoding.estaleiromavingue.App.repositories.ProductCategoryRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.text.Normalizer;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class ProductCategoryService {

    private static final Map<String, String> DEFAULT_CATEGORIES = new LinkedHashMap<>();

    static {
        DEFAULT_CATEGORIES.put("construcao", "Construcao");
        DEFAULT_CATEGORIES.put("ferragem", "Ferragem");
        DEFAULT_CATEGORIES.put("agua", "Agua");
        DEFAULT_CATEGORIES.put("premium", "Premium");
    }

    private final ProductCategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final AuditLogService auditLogService;

    public ProductCategoryService(
            ProductCategoryRepository categoryRepository,
            ProductRepository productRepository,
            AuditLogService auditLogService
    ) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.auditLogService = auditLogService;
    }

    @Transactional
    public List<ProductCategoryResponseDTO> list() {
        ensureDefaultCategories();
        return categoryRepository.findAll().stream()
                .sorted((left, right) -> left.getName().compareToIgnoreCase(right.getName()))
                .map(this::toDTO)
                .toList();
    }

    @Transactional
    public ProductCategoryResponseDTO create(String userIdFromAuth, ProductCategoryCreateDTO dto) {
        ensureDefaultCategories();

        ProductCategory category = new ProductCategory();
        category.setName(normalizeName(dto.name()));
        category.setSlug(resolveUniqueSlug(slugify(dto.name()), null));
        category.setDescription(normalizeDescription(dto.description()));

        ProductCategory saved = categoryRepository.save(category);
        auditLogService.logByUserId(
                userIdFromAuth,
                "CATEGORY_CREATE",
                "PRODUCT_CATEGORY",
                saved.getId(),
                "Categoria criada: " + saved.getName()
        );
        return toDTO(saved);
    }

    @Transactional
    public ProductCategoryResponseDTO update(String userIdFromAuth, Long id, ProductCategoryUpdateDTO dto) {
        ensureDefaultCategories();

        ProductCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Categoria nao encontrada: " + id));

        String previousSlug = category.getSlug();
        String nextSlug = resolveUniqueSlug(slugify(dto.name()), id);

        category.setName(normalizeName(dto.name()));
        category.setSlug(nextSlug);
        category.setDescription(normalizeDescription(dto.description()));

        if (!previousSlug.equals(nextSlug)) {
            List<Product> products = productRepository.findAllByCategoryAndAtivoTrue(previousSlug);
            for (Product product : products) {
                product.setCategory(nextSlug);
            }
            productRepository.saveAll(products);
        }

        ProductCategory saved = categoryRepository.save(category);
        auditLogService.logByUserId(
                userIdFromAuth,
                "CATEGORY_UPDATE",
                "PRODUCT_CATEGORY",
                saved.getId(),
                "Categoria actualizada: " + saved.getName()
        );
        return toDTO(saved);
    }

    public void ensureDefaultCategories() {
        DEFAULT_CATEGORIES.forEach((slug, name) -> {
            if (categoryRepository.existsBySlug(slug)) {
                return;
            }

            categoryRepository.save(ProductCategory.builder()
                    .name(name)
                    .slug(slug)
                    .description("Categoria padrao do catalogo.")
                    .build());
        });
    }

    private ProductCategoryResponseDTO toDTO(ProductCategory category) {
        return new ProductCategoryResponseDTO(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }

    private String normalizeName(String value) {
        String normalized = value == null ? "" : value.trim();
        if (normalized.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome da categoria e obrigatorio");
        }
        return normalized;
    }

    private String normalizeDescription(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    private String resolveUniqueSlug(String baseSlug, Long currentId) {
        if (baseSlug.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Slug da categoria invalido");
        }

        String candidate = baseSlug;
        int suffix = 2;
        while (true) {
            ProductCategory existing = categoryRepository.findBySlug(candidate).orElse(null);
            if (existing == null || existing.getId().equals(currentId)) {
                return candidate;
            }
            candidate = baseSlug + "-" + suffix;
            suffix++;
        }
    }

    private String slugify(String value) {
        String normalized = Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        return normalized.isBlank() ? "categoria" : normalized;
    }
}
