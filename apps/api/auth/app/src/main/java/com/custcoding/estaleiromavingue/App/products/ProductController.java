package com.custcoding.estaleiromavingue.App.products;

import com.custcoding.estaleiromavingue.App.products.dto.ProductCreateRequest;
import com.custcoding.estaleiromavingue.App.products.dto.ProductResponse;
import com.custcoding.estaleiromavingue.App.products.dto.ProductUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@permissionService.hasPermission(authentication, 'products.manage')")
    public ProductResponse create(@Valid @RequestBody ProductCreateRequest req, Authentication authentication) {
        var product = service.create(authentication.getName(), req);
        return ProductResponse.from(product, service.getAvailableStock(product.getId()));
    }

    @GetMapping
    public List<ProductResponse> list() {
        return service.list().stream()
                .map(product -> ProductResponse.from(product, service.getAvailableStock(product.getId())))
                .toList();
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        var product = service.get(id);
        return ProductResponse.from(product, service.getAvailableStock(product.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'products.manage')")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequest req, Authentication authentication) {
        var product = service.update(authentication.getName(), id, req);
        return ProductResponse.from(product, service.getAvailableStock(product.getId()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("@permissionService.hasPermission(authentication, 'products.delete')")
    public void delete(@PathVariable Long id, Authentication authentication) {
        service.delete(authentication.getName(), id);
    }
}
