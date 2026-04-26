package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterApprovalDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterClientUpdateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterRequestCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterResponseDTO;
import com.custcoding.estaleiromavingue.App.models.Adress;
import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import com.custcoding.estaleiromavingue.App.models.CustomerWater;
import com.custcoding.estaleiromavingue.App.models.status.EstadoServicoAgua;
import com.custcoding.estaleiromavingue.App.repositories.AdressRepository;
import com.custcoding.estaleiromavingue.App.repositories.CustomerRepository;
import com.custcoding.estaleiromavingue.App.repositories.CustomerWaterRepository;
import com.custcoding.estaleiromavingue.App.users.AppUser;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CustomerWaterService {

    private final CustomerWaterRepository customerWaterRepository;
    private final CustomerRepository customerRepository;
    private final AdressRepository adressRepository;
    private final PhoneNumberService phoneNumberService;
    private final AccountSyncService accountSyncService;

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

    @Transactional
    public CustomerWaterResponseDTO create(CustomerWaterCreateDTO dto) {
        CustomerProduct customer = resolveCustomer(dto.customerId(), dto.phone(), dto.email());
        Adress adress = dto.adressId() == null ? null : findAdress(dto.adressId());
        String normalizedPhone = phoneNumberService.normalizeRequired(dto.phone());
        String normalizedEmail = normalizeEmail(dto.email());

        CustomerWater customerWater = new CustomerWater();
        customerWater.setName(dto.name().trim());
        customerWater.setPhone(normalizedPhone);
        customerWater.setEmail(normalizedEmail);
        customerWater.setHouseNR(blankToNull(dto.houseNR()));
        customerWater.setAdressId(adress);
        customerWater.setCustomer(customer);
        customerWater.setAppUser(customer == null ? null : customer.getAppUser());
        customerWater.setReferenciaLocal(dto.referenciaLocal().trim());
        customerWater.setEstado((customerWater.getHouseNR() == null || customerWater.getAdressId() == null)
                ? EstadoServicoAgua.AGUARDANDO_DADOS_CASA
                : EstadoServicoAgua.ATIVO);
        customerWater.setPedidoAgua(true);
        customerWater.setActivo(customerWater.getEstado() == EstadoServicoAgua.ATIVO);
        customerWater.setObservacoes(blankToNull(dto.observacoes()));
        customerWater.setUpdated(LocalDateTime.now());

        CustomerWater saved = customerWaterRepository.save(customerWater);
        if (customer != null) {
            customer.setTemServicoAgua(Boolean.TRUE);
            customerRepository.save(customer);
            accountSyncService.syncWaterForCustomer(customer);
        }
        return toResponse(saved);
    }

    @Transactional
    public CustomerWaterResponseDTO update(Long id, CustomerWaterCreateDTO dto) {
        CustomerWater existing = findCustomer(id);
        CustomerProduct customer = resolveCustomer(dto.customerId(), dto.phone(), dto.email());

        existing.setName(dto.name().trim());
        existing.setPhone(phoneNumberService.normalizeRequired(dto.phone()));
        existing.setEmail(normalizeEmail(dto.email()));
        existing.setHouseNR(blankToNull(dto.houseNR()));
        existing.setAdressId(dto.adressId() == null ? null : findAdress(dto.adressId()));
        existing.setCustomer(customer);
        existing.setAppUser(customer == null ? existing.getAppUser() : customer.getAppUser());
        existing.setReferenciaLocal(dto.referenciaLocal().trim());
        existing.setEstado((existing.getHouseNR() == null || existing.getAdressId() == null)
                ? EstadoServicoAgua.AGUARDANDO_DADOS_CASA
                : EstadoServicoAgua.ATIVO);
        existing.setPedidoAgua(true);
        existing.setActivo(existing.getEstado() == EstadoServicoAgua.ATIVO);
        existing.setObservacoes(blankToNull(dto.observacoes()));
        existing.setUpdated(LocalDateTime.now());

        CustomerWater saved = customerWaterRepository.save(existing);
        if (customer != null) {
            customer.setTemServicoAgua(Boolean.TRUE);
            customerRepository.save(customer);
            accountSyncService.syncWaterForCustomer(customer);
        }
        return toResponse(saved);
    }

    @Transactional
    public CustomerWaterResponseDTO approve(Long id, CustomerWaterApprovalDTO dto) {
        CustomerWater existing = findCustomer(id);
        existing.setEstado(EstadoServicoAgua.AGUARDANDO_DADOS_CASA);
        existing.setActivo(false);
        existing.setUpdated(LocalDateTime.now());
        existing.setObservacoes(dto.observacoes() == null || dto.observacoes().isBlank()
                ? "Pedido aprovado. O cliente deve completar os dados da casa."
                : dto.observacoes().trim());
        return toResponse(customerWaterRepository.save(existing));
    }

    @Transactional
    public CustomerWaterResponseDTO reject(Long id, CustomerWaterApprovalDTO dto) {
        CustomerWater existing = findCustomer(id);
        existing.setEstado(EstadoServicoAgua.REJEITADO);
        existing.setActivo(false);
        existing.setUpdated(LocalDateTime.now());
        existing.setObservacoes(dto.observacoes() == null || dto.observacoes().isBlank()
                ? "Pedido de agua rejeitado."
                : dto.observacoes().trim());
        return toResponse(customerWaterRepository.save(existing));
    }

    @Transactional(readOnly = true)
    public List<CustomerWaterResponseDTO> listForUser(AppUser user) {
        LinkedHashMap<Long, CustomerWaterResponseDTO> items = new LinkedHashMap<>();

        customerWaterRepository.findByAppUser_IdOrderByCreatedDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .forEach(item -> items.put(item.id(), item));

        customerRepository.findByAppUser_Id(user.getId()).ifPresent(customer ->
                customerWaterRepository.findByCustomer_IdOrderByCreatedDesc(customer.getId()).stream()
                        .map(this::toResponse)
                        .forEach(item -> items.put(item.id(), item))
        );

        customerWaterRepository.findByPhoneOrderByCreatedDesc(user.getPhone()).stream()
                .map(this::toResponse)
                .forEach(item -> items.put(item.id(), item));

        String email = normalizeEmail(user.getEmail());
        if (email != null) {
            customerWaterRepository.findByEmailOrderByCreatedDesc(email).stream()
                    .map(this::toResponse)
                    .forEach(item -> items.put(item.id(), item));
        }

        return List.copyOf(items.values());
    }

    @Transactional
    public CustomerWaterResponseDTO requestFromClient(AppUser user, CustomerWaterRequestCreateDTO dto) {
        String normalizedReference = normalize(dto.referenciaLocal());
        boolean duplicatedPending = listForUser(user).stream()
                .filter(existing -> "PENDENTE_APROVACAO".equals(existing.estado()))
                .anyMatch(existing -> normalize(existing.referenciaLocal()).equals(normalizedReference));

        if (duplicatedPending) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ja existe um pedido pendente para este local");
        }

        CustomerWater request = new CustomerWater();
        request.setName(user.getNome());
        request.setPhone(user.getPhone());
        request.setEmail(normalizeEmail(user.getEmail()));
        request.setAppUser(user);
        request.setCustomer(customerRepository.findByAppUser_Id(user.getId()).orElse(null));
        request.setReferenciaLocal(dto.referenciaLocal().trim());
        request.setEstado(EstadoServicoAgua.PENDENTE_APROVACAO);
        request.setPedidoAgua(true);
        request.setActivo(false);
        request.setObservacoes(dto.observacoes() == null || dto.observacoes().isBlank()
                ? "Pedido criado pelo cliente na sua conta"
                : dto.observacoes().trim());
        request.setUpdated(LocalDateTime.now());

        CustomerWater saved = customerWaterRepository.save(request);
        if (request.getCustomer() != null) {
            request.getCustomer().setTemServicoAgua(Boolean.TRUE);
            customerRepository.save(request.getCustomer());
        }
        return toResponse(saved);
    }

    @Transactional
    public CustomerWaterResponseDTO completeForClient(AppUser user, Long requestId, CustomerWaterClientUpdateDTO dto) {
        CustomerWater existing = findCustomer(requestId);
        ensureRequestOwnership(user, existing);

        if (existing.getEstado() != EstadoServicoAgua.AGUARDANDO_DADOS_CASA) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O pedido de agua ainda nao foi aprovado");
        }

        existing.setHouseNR(dto.houseNR().trim());
        existing.setAdressId(findAdress(dto.adressId()));
        existing.setEstado(EstadoServicoAgua.ATIVO);
        existing.setActivo(true);
        existing.setUpdated(LocalDateTime.now());
        existing.setObservacoes("Dados da casa confirmados pelo cliente");

        CustomerWater saved = customerWaterRepository.save(existing);
        if (existing.getCustomer() != null) {
            existing.getCustomer().setTemServicoAgua(Boolean.TRUE);
            customerRepository.save(existing.getCustomer());
            accountSyncService.syncWaterForCustomer(existing.getCustomer());
        }
        return toResponse(saved);
    }

    @Transactional
    public CustomerWaterResponseDTO completeLatestForClient(AppUser user, CustomerWaterClientUpdateDTO dto) {
        CustomerWater existing = listForUser(user).stream()
                .filter(item -> "AGUARDANDO_DADOS_CASA".equals(item.estado()))
                .findFirst()
                .map(item -> findCustomer(item.id()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido de agua nao encontrado"));

        return completeForClient(user, existing.getId(), dto);
    }

    @Transactional
    public void delete(Long id) {
        CustomerWater customerWater = findCustomer(id);
        customerWaterRepository.delete(customerWater);
    }

    private void ensureRequestOwnership(AppUser user, CustomerWater request) {
        boolean ownedByUserId = request.getAppUser() != null && request.getAppUser().getId().equals(user.getId());
        boolean ownedByPhone = request.getPhone() != null && request.getPhone().equals(user.getPhone());
        boolean ownedByEmail = request.getEmail() != null && request.getEmail().equalsIgnoreCase(blankToNull(user.getEmail()) == null ? "" : user.getEmail());

        if (!ownedByUserId && !ownedByPhone && !ownedByEmail) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido de agua nao encontrado");
        }
    }

    private CustomerWater findCustomer(Long id) {
        return customerWaterRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consumidor de agua nao encontrado"));
    }

    private Adress findAdress(Long id) {
        return adressRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereco nao encontrado"));
    }

    private CustomerProduct resolveCustomer(Long customerId, String phone, String email) {
        if (customerId != null) {
            return customerRepository.findById(customerId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cadastro de pessoa nao encontrado"));
        }

        String normalizedPhone = phoneNumberService.normalize(phone);
        if (normalizedPhone != null) {
            var byPhone = customerRepository.findByPhone(normalizedPhone);
            if (byPhone.isPresent()) {
                return byPhone.get();
            }
        }

        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail != null) {
            return customerRepository.findByEmail(normalizedEmail).orElse(null);
        }

        return null;
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

    private String normalizeEmail(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String blankToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }
}
