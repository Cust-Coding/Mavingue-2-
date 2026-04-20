package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterApprovalDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterClientUpdateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterRequestCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterResponseDTO;
import com.custcoding.estaleiromavingue.App.models.Adress;
import com.custcoding.estaleiromavingue.App.models.CustomerWater;
import com.custcoding.estaleiromavingue.App.models.status.EstadoServicoAgua;
import com.custcoding.estaleiromavingue.App.repositories.AdressRepository;
import com.custcoding.estaleiromavingue.App.repositories.CustomerWaterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CustomerWaterService {

    private final CustomerWaterRepository customerWaterRepository;
    private final AdressRepository adressRepository;

    @Transactional(readOnly = true)
    public List<CustomerWaterResponseDTO> list() {
        return customerWaterRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<CustomerWaterResponseDTO> pending() {
        return customerWaterRepository.findByEstadoOrderByCreatedDesc(EstadoServicoAgua.PENDENTE_APROVACAO).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerWaterResponseDTO getById(Long id) {
        return toResponse(findCustomer(id));
    }

    public CustomerWaterResponseDTO create(CustomerWaterCreateDTO dto) {
        Adress adress = findAdress(dto.adressId());

        CustomerWater customerWater = new CustomerWater();
        customerWater.setName(dto.name());
        customerWater.setPhone(dto.phone());
        customerWater.setEmail(dto.email());
        customerWater.setHouseNR(dto.houseNR());
        customerWater.setAdressId(adress);
        customerWater.setReferenciaLocal("Cadastro manual");
        customerWater.setEstado(EstadoServicoAgua.ATIVO);
        customerWater.setPedidoAgua(true);
        customerWater.setActivo(true);
        customerWater.setObservacoes("Cliente de agua criado manualmente");
        customerWater.setUpdated(LocalDateTime.now());

        return toResponse(customerWaterRepository.save(customerWater));
    }

    public CustomerWaterResponseDTO update(Long id, CustomerWaterCreateDTO dto) {
        CustomerWater existing = findCustomer(id);

        Adress adress = findAdress(dto.adressId());

        existing.setName(dto.name());
        existing.setPhone(dto.phone());
        existing.setEmail(dto.email());
        existing.setHouseNR(dto.houseNR());
        existing.setAdressId(adress);
        if (existing.getReferenciaLocal() == null || existing.getReferenciaLocal().isBlank()) {
            existing.setReferenciaLocal("Cadastro manual");
        }
        existing.setEstado(EstadoServicoAgua.ATIVO);
        existing.setPedidoAgua(true);
        existing.setActivo(true);
        existing.setUpdated(LocalDateTime.now());

        return toResponse(customerWaterRepository.save(existing));
    }

    public CustomerWaterResponseDTO approve(Long id, CustomerWaterApprovalDTO dto) {
        CustomerWater existing = findCustomer(id);
        existing.setEstado(EstadoServicoAgua.AGUARDANDO_DADOS_CASA);
        existing.setActivo(false);
        existing.setUpdated(LocalDateTime.now());
        existing.setObservacoes(dto.observacoes() == null || dto.observacoes().isBlank()
                ? "Pedido aprovado. Cliente deve completar os dados da casa."
                : dto.observacoes());
        return toResponse(customerWaterRepository.save(existing));
    }

    public CustomerWaterResponseDTO reject(Long id, CustomerWaterApprovalDTO dto) {
        CustomerWater existing = findCustomer(id);
        existing.setEstado(EstadoServicoAgua.REJEITADO);
        existing.setActivo(false);
        existing.setUpdated(LocalDateTime.now());
        existing.setObservacoes(dto.observacoes() == null || dto.observacoes().isBlank()
                ? "Pedido de agua rejeitado."
                : dto.observacoes());
        return toResponse(customerWaterRepository.save(existing));
    }

    @Transactional(readOnly = true)
    public List<CustomerWaterResponseDTO> listByEmail(String email) {
        return customerWaterRepository.findByEmailOrderByCreatedDesc(email).stream()
                .map(this::toResponse)
                .toList();
    }

    public CustomerWaterResponseDTO requestFromClient(String name, String phone, String email, CustomerWaterRequestCreateDTO dto) {
        String normalizedReference = normalize(dto.referenciaLocal());
        boolean duplicatedPending = customerWaterRepository.findByEmailAndEstadoOrderByCreatedDesc(email, EstadoServicoAgua.PENDENTE_APROVACAO)
                .stream()
                .anyMatch(existing -> normalize(existing.getReferenciaLocal()).equals(normalizedReference));

        if (duplicatedPending) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ja existe um pedido pendente para este local");
        }

        CustomerWater request = new CustomerWater();
        request.setName(name);
        request.setPhone(phone);
        request.setEmail(email);
        request.setReferenciaLocal(dto.referenciaLocal().trim());
        request.setEstado(EstadoServicoAgua.PENDENTE_APROVACAO);
        request.setPedidoAgua(true);
        request.setActivo(false);
        request.setObservacoes(dto.observacoes() == null || dto.observacoes().isBlank()
                ? "Pedido criado pelo cliente na sua conta"
                : dto.observacoes().trim());
        request.setUpdated(LocalDateTime.now());

        return toResponse(customerWaterRepository.save(request));
    }

    public CustomerWaterResponseDTO completeForClient(String email, Long requestId, CustomerWaterClientUpdateDTO dto) {
        CustomerWater existing = findCustomer(requestId);

        if (!existing.getEmail().equalsIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido de agua nao encontrado");
        }

        if (existing.getEstado() != EstadoServicoAgua.AGUARDANDO_DADOS_CASA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O pedido de agua ainda nao foi aprovado pelo administrador");
        }

        existing.setHouseNR(dto.houseNR());
        existing.setAdressId(findAdress(dto.adressId()));
        existing.setEstado(EstadoServicoAgua.ATIVO);
        existing.setActivo(true);
        existing.setUpdated(LocalDateTime.now());
        existing.setObservacoes("Dados da casa confirmados pelo cliente");

        return toResponse(customerWaterRepository.save(existing));
    }

    public CustomerWaterResponseDTO completeLatestForClient(String email, CustomerWaterClientUpdateDTO dto) {
        CustomerWater existing = customerWaterRepository.findByEmailAndEstadoOrderByCreatedDesc(email, EstadoServicoAgua.AGUARDANDO_DADOS_CASA)
                .stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido de agua nao encontrado"));

        return completeForClient(email, existing.getId(), dto);
    }

    public void delete(Long id) {
        if (!customerWaterRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Consumidor de agua nao encontrado");
        }
        customerWaterRepository.deleteById(id);
    }

    private CustomerWater findCustomer(Long id) {
        return customerWaterRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consumidor de agua nao encontrado"));
    }

    private Adress findAdress(Long id) {
        return adressRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereco nao encontrado"));
    }

    private CustomerWaterResponseDTO toResponse(CustomerWater customerWater) {
        String adress = customerWater.getAdressId() == null
                ? null
                : customerWater.getAdressId().getName() + ", " + customerWater.getAdressId().getBairro();

        return new CustomerWaterResponseDTO(
                customerWater.getId(),
                customerWater.getName(),
                customerWater.getPhone(),
                customerWater.getEmail(),
                customerWater.getReferenciaLocal(),
                customerWater.getHouseNR(),
                customerWater.getAdressId() == null ? null : customerWater.getAdressId().getId(),
                adress,
                customerWater.getEstado() == null ? EstadoServicoAgua.PENDENTE_APROVACAO.name() : customerWater.getEstado().name(),
                customerWater.getPedidoAgua(),
                customerWater.getActivo(),
                customerWater.getObservacoes(),
                customerWater.getCreated()
        );
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }
}
