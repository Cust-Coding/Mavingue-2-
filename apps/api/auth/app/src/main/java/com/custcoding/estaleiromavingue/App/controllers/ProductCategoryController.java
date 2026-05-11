package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.product_category.ProductCategoryCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.product_category.ProductCategoryResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.product_category.ProductCategoryUpdateDTO;
import com.custcoding.estaleiromavingue.App.services.ProductCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/product-categories")
@RequiredArgsConstructor
public class ProductCategoryController {

    private final ProductCategoryService productCategoryService;

    @GetMapping
    @PreAuthorize(
            "@permissionService.hasPermission(authentication, 'products.view')"
                    + " or @permissionService.hasPermission(authentication, 'products.manage')"
                    + " or @permissionService.hasPermission(authentication, 'categories.manage')"
    )
    public List<ProductCategoryResponseDTO> list() {
        return productCategoryService.list();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("@permissionService.hasPermission(authentication, 'categories.manage')")
    public ProductCategoryResponseDTO create(
            @Valid @RequestBody ProductCategoryCreateDTO dto,
            Authentication authentication
    ) {
        return productCategoryService.create(authentication.getName(), dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'categories.manage')")
    public ProductCategoryResponseDTO update(
            @PathVariable Long id,
            @Valid @RequestBody ProductCategoryUpdateDTO dto,
            Authentication authentication
    ) {
        return productCategoryService.update(authentication.getName(), id, dto);
    }
}
