package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.auth.dto.MeResponse;
import com.custcoding.estaleiromavingue.App.dtos.client_area.ClientAreaProfileDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer.CustomerResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterClientUpdateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterRequestCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_agua.FacturaAguaPagamentoDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_agua.FacturaAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.leitura_agua.LeituraAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.ligacao_agua.LigacaoAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaClientCheckoutDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaResponseDTO;
import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import com.custcoding.estaleiromavingue.App.models.CustomerWater;
import com.custcoding.estaleiromavingue.App.models.FacturaAgua;
import com.custcoding.estaleiromavingue.App.models.Ferragem;
import com.custcoding.estaleiromavingue.App.models.Funcionario;
import com.custcoding.estaleiromavingue.App.models.LeituraAgua;
import com.custcoding.estaleiromavingue.App.models.LigacaoAgua;
import com.custcoding.estaleiromavingue.App.models.Owner;
import com.custcoding.estaleiromavingue.App.models.Venda;
import com.custcoding.estaleiromavingue.App.models.status.EstadoPagamento;
import com.custcoding.estaleiromavingue.App.repositories.CustomerRepository;
import com.custcoding.estaleiromavingue.App.repositories.CustomerWaterRepository;
import com.custcoding.estaleiromavingue.App.repositories.FacturaAguaRepository;
import com.custcoding.estaleiromavingue.App.repositories.FerragemRepository;
import com.custcoding.estaleiromavingue.App.repositories.FuncionarioRepository;
import com.custcoding.estaleiromavingue.App.repositories.LeituraAguaRepository;
import com.custcoding.estaleiromavingue.App.repositories.LigacaoAguaRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProprietarioRepository;
import com.custcoding.estaleiromavingue.App.repositories.VendaRepository;
import com.custcoding.estaleiromavingue.App.users.AppUser;
import com.custcoding.estaleiromavingue.App.users.AppUserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClientAreaService {

    private final AppUserRepository appUserRepository;
    private final CustomerRepository customerRepository;
    private final CustomerWaterRepository customerWaterRepository;
    private final VendaRepository vendaRepository;
    private final LigacaoAguaRepository ligacaoAguaRepository;
    private final LeituraAguaRepository leituraAguaRepository;
    private final FacturaAguaRepository facturaAguaRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final FerragemRepository ferragemRepository;
    private final ProprietarioRepository proprietarioRepository;
    private final VendaService vendaService;
    private final CustomerWaterService customerWaterService;

    @Transactional(readOnly = true)
    public ClientAreaProfileDTO profile(String userIdFromAuth) {
        AppUser user = findCurrentUser(userIdFromAuth);
        List<CustomerWaterResponseDTO> waterCustomers = findWaterCustomers(user).stream()
                .map(this::toWaterCustomerResponse)
                .toList();

        return new ClientAreaProfileDTO(
                new MeResponse(user.getId(), user.getNome(), user.getEmail(), user.getRole()),
                findCustomer(user).map(this::toCustomerResponse).orElse(null),
                waterCustomers.stream()
                        .filter(item -> "ATIVO".equals(item.estado()))
                        .findFirst()
                        .or(() -> waterCustomers.stream().findFirst())
                        .orElse(null),
                waterCustomers
        );
    }

    @Transactional(readOnly = true)
    public List<VendaResponseDTO> compras(String userIdFromAuth) {
        AppUser user = findCurrentUser(userIdFromAuth);

        return findCustomer(user)
                .map(customer -> vendaRepository.findByCliente_IdOrderByIdDesc(customer.getId()).stream()
                        .map(vendaService::toDTO)
                        .toList())
                .orElse(List.of());
    }

    @Transactional(readOnly = true)
    public VendaResponseDTO compra(String userIdFromAuth, Long id) {
        AppUser user = findCurrentUser(userIdFromAuth);
        CustomerProduct customer = findCustomer(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil de cliente nao encontrado"));

        Venda venda = vendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Compra nao encontrada: " + id));

        if (!venda.getCliente().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Compra nao encontrada");
        }

        return vendaService.toDTO(venda);
    }

    @Transactional
    public List<VendaResponseDTO> checkout(String userIdFromAuth, VendaClientCheckoutDTO dto) {
        AppUser user = findCurrentUser(userIdFromAuth);
        CustomerProduct customer = findCustomer(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil de cliente nao encontrado"));

        Funcionario funcionario = resolveCheckoutFuncionario();
        List<VendaResponseDTO> created = new ArrayList<>();

        for (var item : dto.items()) {
            created.add(vendaService.createForClientCheckout(
                    item.produtoId(),
                    customer.getId(),
                    funcionario.getId(),
                    item.quantidade(),
                    dto.formaPagamento()
            ));
        }

        return created;
    }

    @Transactional(readOnly = true)
    public List<LigacaoAguaResponseDTO> waterContracts(String userIdFromAuth) {
        AppUser user = findCurrentUser(userIdFromAuth);
        List<Long> consumidorIds = findWaterCustomerIds(user);

        if (consumidorIds.isEmpty()) {
            return List.of();
        }

        return ligacaoAguaRepository.findByConsumidor_IdInOrderByDataDesc(consumidorIds).stream()
                .map(this::toLigacaoResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LeituraAguaResponseDTO> waterReadings(String userIdFromAuth) {
        AppUser user = findCurrentUser(userIdFromAuth);
        List<Long> consumidorIds = findWaterCustomerIds(user);

        if (consumidorIds.isEmpty()) {
            return List.of();
        }

        return leituraAguaRepository.findByLigacao_Consumidor_IdInOrderByDataDesc(consumidorIds).stream()
                .map(this::toLeituraResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FacturaAguaResponseDTO> waterBills(String userIdFromAuth) {
        AppUser user = findCurrentUser(userIdFromAuth);
        List<Long> consumidorIds = findWaterCustomerIds(user);

        if (consumidorIds.isEmpty()) {
            return List.of();
        }

        return facturaAguaRepository.findByConsumidor_IdInOrderByDataDesc(consumidorIds).stream()
                .map(this::toFacturaResponse)
                .toList();
    }

    public FacturaAguaResponseDTO payWaterBill(String userIdFromAuth, Long id, FacturaAguaPagamentoDTO dto) {
        AppUser user = findCurrentUser(userIdFromAuth);
        List<Long> consumidorIds = findWaterCustomerIds(user);
        if (consumidorIds.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Consumidor de agua nao encontrado");
        }

        FacturaAgua factura = facturaAguaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Factura de agua nao encontrada: " + id));

        if (!consumidorIds.contains(factura.getConsumidor().getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura de agua nao encontrada");
        }

        factura.setEstadoPagamento(EstadoPagamento.PAGO);
        factura.setFormaPagamento(dto.formaPagamento());
        return toFacturaResponse(facturaAguaRepository.save(factura));
    }

    public CustomerWaterResponseDTO createWaterRequest(String userIdFromAuth, CustomerWaterRequestCreateDTO dto) {
        AppUser user = findCurrentUser(userIdFromAuth);
        return customerWaterService.requestFromClient(user.getNome(), resolvePhone(user), user.getEmail(), dto);
    }

    public CustomerWaterResponseDTO updateWaterRequest(String userIdFromAuth, Long requestId, CustomerWaterClientUpdateDTO dto) {
        AppUser user = findCurrentUser(userIdFromAuth);
        return customerWaterService.completeForClient(user.getEmail(), requestId, dto);
    }

    public CustomerWaterResponseDTO updateLatestWaterRequest(String userIdFromAuth, CustomerWaterClientUpdateDTO dto) {
        AppUser user = findCurrentUser(userIdFromAuth);
        return customerWaterService.completeLatestForClient(user.getEmail(), dto);
    }

    private AppUser findCurrentUser(String userIdFromAuth) {
        Long id;
        try {
            id = Long.parseLong(userIdFromAuth);
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilizador autenticado invalido");
        }

        return appUserRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilizador autenticado nao encontrado"));
    }

    private Optional<CustomerProduct> findCustomer(AppUser user) {
        return customerRepository.findByEmail(user.getEmail());
    }

    private Optional<CustomerWater> findWaterCustomer(AppUser user) {
        return customerWaterRepository.findFirstByEmailOrderByCreatedDesc(user.getEmail());
    }

    private List<CustomerWater> findWaterCustomers(AppUser user) {
        return customerWaterRepository.findByEmailOrderByCreatedDesc(user.getEmail());
    }

    private List<Long> findWaterCustomerIds(AppUser user) {
        return findWaterCustomers(user).stream()
                .map(CustomerWater::getId)
                .toList();
    }

    private CustomerResponseDTO toCustomerResponse(CustomerProduct customer) {
        return new CustomerResponseDTO(
                customer.getId(),
                customer.getName(),
                customer.getSex(),
                customer.getPhone(),
                customer.getEmail(),
                customer.getBirthDate(),
                customer.getProvincia(),
                customer.getCidade(),
                customer.getBairro(),
                customer.getCreated()
        );
    }

    private CustomerWaterResponseDTO toWaterCustomerResponse(CustomerWater customerWater) {
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
                customerWater.getEstado() == null ? null : customerWater.getEstado().name(),
                customerWater.getPedidoAgua(),
                customerWater.getActivo(),
                customerWater.getObservacoes(),
                customerWater.getCreated()
        );
    }

    private LigacaoAguaResponseDTO toLigacaoResponse(LigacaoAgua ligacao) {
        CustomerWater consumidor = ligacao.getConsumidor();
        Funcionario funcionario = ligacao.getFuncionario();
        return new LigacaoAguaResponseDTO(
                ligacao.getId(),
                ligacao.getData(),
                ligacao.getEstado(),
                consumidor == null ? null : consumidor.getId(),
                consumidor == null ? "Consumidor nao identificado" : consumidor.getName(),
                consumidor == null ? null : consumidor.getHouseNR(),
                funcionario == null ? null : funcionario.getId(),
                funcionario == null ? "Operador nao identificado" : funcionario.getNome()
        );
    }

    private LeituraAguaResponseDTO toLeituraResponse(LeituraAgua leitura) {
        return new LeituraAguaResponseDTO(
                leitura.getId(),
                leitura.getData(),
                leitura.getLeituraAnterior(),
                leitura.getLeituraActual(),
                leitura.getConsumoM3(),
                leitura.getValorPagar(),
                leitura.getLigacao() == null ? null : leitura.getLigacao().getId()
        );
    }

    private FacturaAguaResponseDTO toFacturaResponse(FacturaAgua factura) {
        CustomerWater consumidor = factura.getConsumidor();
        LeituraAgua leitura = factura.getLeitura();
        return new FacturaAguaResponseDTO(
                factura.getId(),
                factura.getData(),
                factura.getTaxaFixa(),
                factura.getValor(),
                factura.getValorTotal(),
                factura.getEstadoPagamento(),
                factura.getFormaPagamento(),
                consumidor == null ? null : consumidor.getId(),
                consumidor == null ? "Consumidor nao identificado" : consumidor.getName(),
                consumidor == null ? null : consumidor.getHouseNR(),
                leitura == null ? null : leitura.getId()
        );
    }

    private String resolvePhone(AppUser user) {
        return findCustomer(user)
                .map(CustomerProduct::getPhone)
                .orElse("000000000");
    }

    private Funcionario resolveCheckoutFuncionario() {
        return funcionarioRepository.findAll().stream()
                .findFirst()
                .orElseGet(this::createFallbackFuncionario);
    }

    private Funcionario createFallbackFuncionario() {
        Owner owner = proprietarioRepository.findByEmail("checkout@mavingue.local")
                .orElseGet(() -> {
                    Owner createdOwner = new Owner();
                    createdOwner.setNome("Operacao Checkout");
                    createdOwner.setTelefone("000000000");
                    createdOwner.setEmail("checkout@mavingue.local");
                    createdOwner.setNuit("900000000");
                    createdOwner.setPalavraPasse("checkout-system");
                    return proprietarioRepository.save(createdOwner);
                });

        Ferragem ferragem = ferragemRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    Ferragem createdFerragem = new Ferragem();
                    createdFerragem.setName("Loja Principal");
                    createdFerragem.setBairro("Centro");
                    createdFerragem.setOwner(owner);
                    return ferragemRepository.save(createdFerragem);
                });

        Funcionario funcionario = new Funcionario();
        funcionario.setCargo("Operador Checkout");
        funcionario.setNome("Operador do Sistema");
        funcionario.setTelefone("000000000");
        funcionario.setFerragem(ferragem);
        funcionario.setOwner(owner);
        return funcionarioRepository.save(funcionario);
    }
}
