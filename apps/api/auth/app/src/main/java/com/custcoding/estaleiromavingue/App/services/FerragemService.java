package com.custcoding.estaleiromavingue.App.services;
import com.custcoding.estaleiromavingue.App.dtos.ferragem.FerragemCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.ferragem.FerragemResponseDTO;
import com.custcoding.estaleiromavingue.App.mappers.FerragemMapper;
import com.custcoding.estaleiromavingue.App.models.Ferragem;
import com.custcoding.estaleiromavingue.App.models.Owner;
import com.custcoding.estaleiromavingue.App.repositories.FerragemRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProprietarioRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Data
public class FerragemService {

    private final FerragemRepository ferragemRepository;
    private final FerragemMapper ferragemMapper;
    private final ProprietarioRepository proprietarioRepository;


    public List<FerragemResponseDTO> getFerragens(){
        return ferragemRepository.findAll()
                .stream()
                .map(ferragemMapper::toFerragemResponseDTO)
                .collect(Collectors.toList());
    }

    public FerragemResponseDTO getFerragemById(
            Long id
    ){
        return ferragemRepository.findById(id)
                .map(ferragemMapper::toFerragemResponseDTO)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND
                ));
    }


    public FerragemResponseDTO postFerragem(
            FerragemCreateDTO request
    ){
        var ferragem = ferragemMapper.toFerragemDTO(request);
        ferragem.setName(request.name().trim());
        ferragem.setBairro(request.bairro().trim());
        ferragem.setOwner(resolveOwner(request.ownerId()));
        var savedFerragem = ferragemRepository.save(ferragem);
        return ferragemMapper.toFerragemResponseDTO(savedFerragem);
    }


    public void deleteFerragem(
            Long id
    ){
        if (!ferragemRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Ferragem nao encontrada");
        }
        ferragemRepository.deleteById(id);
    }

    private Owner resolveOwner(Long ownerId) {
        if (ownerId != null) {
            return proprietarioRepository.findById(ownerId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Proprietario nao encontrado"));
        }

        return proprietarioRepository.findByEmail("adminsystem@mavingue.com")
                .orElseGet(() -> proprietarioRepository.findAll().stream()
                        .findFirst()
                        .orElseGet(() -> {
                            Owner owner = new Owner();
                            owner.setNome("Admin Sistema");
                            owner.setTelefone("840000001");
                            owner.setEmail("adminsystem@mavingue.com");
                            owner.setNuit("400000001");
                            owner.setPalavraPasse("mavingue1234#");
                            return proprietarioRepository.save(owner);
                        }));
    }

}
