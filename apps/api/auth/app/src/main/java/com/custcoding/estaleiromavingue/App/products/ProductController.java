package com.custcoding.estaleiromavingue.App.products;

import com.custcoding.estaleiromavingue.App.products.dto.ProductCreateRequest;
import com.custcoding.estaleiromavingue.App.products.dto.ProductResponse;
import com.custcoding.estaleiromavingue.App.products.dto.ProductUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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
    public ProductResponse create(@Valid @RequestBody ProductCreateRequest req) {
        var product = service.create(req);
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
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequest req) {
        var product = service.update(id, req);
        return ProductResponse.from(product, service.getAvailableStock(product.getId()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
