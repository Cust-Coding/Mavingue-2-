package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.auth.dto.MeResponse;
import com.custcoding.estaleiromavingue.App.dtos.client_area.ClientAreaProfileDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer.CustomerResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_agua.FacturaAguaPagamentoDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_agua.FacturaAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.leitura_agua.LeituraAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.ligacao_agua.LigacaoAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaResponseDTO;
import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import com.custcoding.estaleiromavingue.App.models.CustomerWater;
import com.custcoding.estaleiromavingue.App.models.FacturaAgua;
import com.custcoding.estaleiromavingue.App.models.LeituraAgua;
import com.custcoding.estaleiromavingue.App.models.LigacaoAgua;
import com.custcoding.estaleiromavingue.App.models.Venda;
import com.custcoding.estaleiromavingue.App.models.status.EstadoPagamento;
import com.custcoding.estaleiromavingue.App.repositories.CustomerRepository;
import com.custcoding.estaleiromavingue.App.repositories.CustomerWaterRepository;
import com.custcoding.estaleiromavingue.App.repositories.FacturaAguaRepository;
import com.custcoding.estaleiromavingue.App.repositories.LeituraAguaRepository;
import com.custcoding.estaleiromavingue.App.repositories.LigacaoAguaRepository;
import com.custcoding.estaleiromavingue.App.repositories.VendaRepository;
import com.custcoding.estaleiromavingue.App.users.AppUser;
import com.custcoding.estaleiromavingue.App.users.AppUserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
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

    public ClientAreaProfileDTO profile(String userIdFromAuth) {
        AppUser user = findCurrentUser(userIdFromAuth);

        return new ClientAreaProfileDTO(
                new MeResponse(user.getId(), user.getNome(), user.getEmail(), user.getRole()),
                findCustomer(user).map(this::toCustomerResponse).orElse(null),
                findWaterCustomer(user).map(this::toWaterCustomerResponse).orElse(null)
        );
    }

    public List<VendaResponseDTO> compras(String userIdFromAuth) {
        AppUser user = findCurrentUser(userIdFromAuth);

        return findCustomer(user)
                .map(customer -> vendaRepository.findByCliente_IdOrderByIdDesc(customer.getId()).stream()
                        .map(this::toVendaResponse)
                        .toList())
                .orElse(List.of());
    }

    public VendaResponseDTO compra(String userIdFromAuth, Long id) {
        AppUser user = findCurrentUser(userIdFromAuth);
        CustomerProduct customer = findCustomer(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil de cliente nao encontrado"));

        Venda venda = vendaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Compra nao encontrada: " + id));

        if (!venda.getCliente().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Compra nao encontrada");
        }

        return toVendaResponse(venda);
    }

    public List<LigacaoAguaResponseDTO> waterContracts(String userIdFromAuth) {
        AppUser user = findCurrentUser(userIdFromAuth);

        return findWaterCustomer(user)
                .map(customer -> ligacaoAguaRepository.findByConsumidor_IdOrderByDataDesc(customer.getId()).stream()
                        .map(this::toLigacaoResponse)
                        .toList())
                .orElse(List.of());
    }

    public List<LeituraAguaResponseDTO> waterReadings(String userIdFromAuth) {
        AppUser user = findCurrentUser(userIdFromAuth);

        return findWaterCustomer(user)
                .map(customer -> leituraAguaRepository.findByLigacao_Consumidor_IdOrderByDataDesc(customer.getId()).stream()
                        .map(this::toLeituraResponse)
                        .toList())
                .orElse(List.of());
    }

    public List<FacturaAguaResponseDTO> waterBills(String userIdFromAuth) {
        AppUser user = findCurrentUser(userIdFromAuth);

        return findWaterCustomer(user)
                .map(customer -> facturaAguaRepository.findByConsumidor_IdOrderByDataDesc(customer.getId()).stream()
                        .map(this::toFacturaResponse)
                        .toList())
                .orElse(List.of());
    }

    public FacturaAguaResponseDTO payWaterBill(String userIdFromAuth, Long id, FacturaAguaPagamentoDTO dto) {
        AppUser user = findCurrentUser(userIdFromAuth);
        CustomerWater customer = findWaterCustomer(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Consumidor de agua nao encontrado"));

        FacturaAgua factura = facturaAguaRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Factura de agua nao encontrada: " + id));

        if (!factura.getConsumidor().getId().equals(customer.getId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Factura de agua nao encontrada");
        }

        factura.setEstadoPagamento(EstadoPagamento.PAGO);
        factura.setFormaPagamento(dto.formaPagamento());
        return toFacturaResponse(facturaAguaRepository.save(factura));
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
        return customerWaterRepository.findByEmail(user.getEmail());
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
                customer.getEndereco(),
                customer.getNuit(),
                customer.getNumeroDocumento(),
                customer.getTipoDocumento(),
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
                customerWater.getHouseNR(),
                adress,
                customerWater.getCreated()
        );
    }

    private LigacaoAguaResponseDTO toLigacaoResponse(LigacaoAgua ligacao) {
        return new LigacaoAguaResponseDTO(
                ligacao.getId(),
                ligacao.getData(),
                ligacao.getEstado(),
                ligacao.getConsumidor().getId(),
                ligacao.getConsumidor().getName(),
                ligacao.getFuncionario().getId(),
                ligacao.getFuncionario().getNome()
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
                leitura.getLigacao().getId()
        );
    }

    private FacturaAguaResponseDTO toFacturaResponse(FacturaAgua factura) {
        return new FacturaAguaResponseDTO(
                factura.getId(),
                factura.getData(),
                factura.getTaxaFixa(),
                factura.getValor(),
                factura.getValorTotal(),
                factura.getEstadoPagamento(),
                factura.getFormaPagamento(),
                factura.getConsumidor().getId(),
                factura.getConsumidor().getName(),
                factura.getLeitura().getId()
        );
    }

    private VendaResponseDTO toVendaResponse(Venda venda) {
        BigDecimal unit = venda.getProduto().getPrice();
        BigDecimal total = unit.multiply(BigDecimal.valueOf(venda.getQuantidade() == null ? 0 : venda.getQuantidade()));

        return new VendaResponseDTO(
                venda.getId(),
                venda.getProduto().getId(),
                venda.getProduto().getName(),
                venda.getCliente().getId(),
                venda.getFuncionario().getId(),
                venda.getQuantidade(),
                unit,
                total,
                venda.getFormaPagamento()
        );
    }
}
