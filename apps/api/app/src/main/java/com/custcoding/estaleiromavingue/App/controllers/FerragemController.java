package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.ferragem.FerragemCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.ferragem.FerragemResponseDTO;
import com.custcoding.estaleiromavingue.App.models.Ferragem;
import com.custcoding.estaleiromavingue.App.services.FerragemService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;
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
    public FerragemResponseDTO postFerragem(
            @Valid @RequestBody FerragemCreateDTO ferragem
    ){
        return this.ferragemService.postFerragem(ferragem);
    }

    @DeleteMapping("/{id}")
    public void deleteFerragem(
            @PathVariable("id") Long id
    ){
        this.ferragemService.deleteFerragem(id);

    }

}
