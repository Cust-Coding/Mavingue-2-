package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.ferragem.FerragemCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.ferragem.FerragemResponseDTO;
import com.custcoding.estaleiromavingue.App.services.FerragemService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("*")
@AllArgsConstructor
@RequestMapping("/api/ferragem")
public class FerragemController {

    private final FerragemService ferragemService;

    @GetMapping("/")
    public List<FerragemResponseDTO> getFerragens(){
        return this.ferragemService.getFerragens();
    }

    @GetMapping("/{id}")
    public FerragemResponseDTO getFerragemById(
            @PathVariable("id") Long id
    ){
        return this.ferragemService.getFerragemById(id);
    }

    @PostMapping("/")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'ferragem.manage')")
    public FerragemResponseDTO postFerragem(
            @Valid @RequestBody FerragemCreateDTO ferragem
    ){
        return this.ferragemService.postFerragem(ferragem);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("@permissionService.hasPermission(authentication, 'ferragem.manage')")
    public void deleteFerragem(
            @PathVariable("id") Long id
    ){
        this.ferragemService.deleteFerragem(id);

    }

}
