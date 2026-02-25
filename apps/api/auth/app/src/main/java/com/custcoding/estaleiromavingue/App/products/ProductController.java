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
        return ProductResponse.from(service.create(req));
    }

    @GetMapping
    public List<ProductResponse> list() {
        return service.list().stream().map(ProductResponse::from).toList();
    }

    @GetMapping("/{id}")
    public ProductResponse get(@PathVariable Long id) {
        return ProductResponse.from(service.get(id));
    }

    @PutMapping("/{id}")
    public ProductResponse update(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequest req) {
        return ProductResponse.from(service.update(id, req));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
