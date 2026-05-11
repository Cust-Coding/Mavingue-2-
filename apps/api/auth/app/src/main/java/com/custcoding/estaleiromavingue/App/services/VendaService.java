package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.stock.StockAdjustDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaCheckoutItemDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaItemResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaStatusUpdateDTO;
import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import com.custcoding.estaleiromavingue.App.models.Funcionario;
import com.custcoding.estaleiromavingue.App.models.ItemVenda;
import com.custcoding.estaleiromavingue.App.models.Product;
import com.custcoding.estaleiromavingue.App.models.status.Sexo;
import com.custcoding.estaleiromavingue.App.models.Venda;
import com.custcoding.estaleiromavingue.App.models.status.EstadoLevantamento;
import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;
import com.custcoding.estaleiromavingue.App.models.status.TipoMovimento;
import com.custcoding.estaleiromavingue.App.repositories.CustomerRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProductRepository;
import com.custcoding.estaleiromavingue.App.repositories.VendaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class VendaService {
    private static final String WALK_IN_CUSTOMER_PHONE = "BALCAO-CLIENTE";

    private final VendaRepository vendaRepo;
    private final ProductRepository productRepo;
    private final CustomerRepository customerRepo;
    private final StockService stockService;
    private final OperationActorService operationActorService;
    private final AuditLogService auditLogService;

    public VendaService(
            VendaRepository vendaRepo,
            ProductRepository productRepo,
            CustomerRepository customerRepo,
            StockService stockService,
            OperationActorService operationActorService,
            AuditLogService auditLogService
    ) {
        this.vendaRepo = vendaRepo;
        this.productRepo = productRepo;
        this.customerRepo = customerRepo;
        this.stockService = stockService;
        this.operationActorService = operationActorService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<VendaResponseDTO> list() {
        return vendaRepo.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public VendaResponseDTO get(Long id) {
        Venda venda = vendaRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Venda nao encontrada: " + id));
        return toDTO(venda);
    }

    @Transactional
    public VendaResponseDTO create(String userIdFromAuth, VendaCreateDTO dto) {
        if (dto.formaPagamento() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Forma de pagamento e obrigatoria");
        }

        Funcionario funcionario = operationActorService.resolveFuncionario(userIdFromAuth, dto.funcionarioId());
        VendaResponseDTO response = createInternal(
                normalizeItems(dto),
                dto.clienteId(),
                funcionario.getId(),
                dto.formaPagamento(),
                dto.valorPago()
        );
        auditLogService.logByUserId(
                userIdFromAuth,
                "SALE_CREATE",
                "SALE",
                response.id(),
                "Venda registada para " + response.clienteNome() + " com " + response.totalItens() + " item(ns)"
        );
        return response;
    }

    @Transactional
    public VendaResponseDTO createForClientCheckout(
            Long produtoId,
            Long clienteId,
            Long funcionarioId,
            Integer quantidade,
            FormaPagamento formaPagamento
    ) {
        return createInternal(
                List.of(new VendaCheckoutItemDTO(produtoId, quantidade)),
                clienteId,
                funcionarioId,
                formaPagamento,
                null
        );
    }

    @Transactional
    public VendaResponseDTO updatePickupStatus(String userIdFromAuth, Long id, VendaStatusUpdateDTO dto) {
        Venda venda = vendaRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Venda nao encontrada: " + id));

        venda.setEstadoLevantamento(dto.estadoLevantamento());
        venda.setLevantamentoNotas(dto.levantamentoNotas());
        venda.setAtualizadoEm(Instant.now());

        if (dto.estadoLevantamento() == EstadoLevantamento.LEVANTADO) {
            venda.setLevantadoEm(Instant.now());
        } else {
            venda.setLevantadoEm(null);
        }

        VendaResponseDTO response = toDTO(vendaRepo.save(venda));
        auditLogService.logByUserId(
                userIdFromAuth,
                "SALE_PICKUP_UPDATE",
                "SALE",
                response.id(),
                "Levantamento actualizado para " + response.estadoLevantamento()
        );
        return response;
    }

    @Transactional
    public VendaResponseDTO createInternal(
            List<VendaCheckoutItemDTO> items,
            Long clienteId,
            Long funcionarioId,
            FormaPagamento formaPagamento,
            BigDecimal valorPagoInformado
    ) {
        CustomerProduct cliente = resolveCustomer(clienteId);

        Funcionario funcionario = operationActorService.resolveFuncionario(null, funcionarioId);

        Venda venda = new Venda();
        venda.setCliente(cliente);
        venda.setFuncionario(funcionario);
        venda.setFormaPagamento(formaPagamento);
        venda.setEstadoLevantamento(EstadoLevantamento.AGUARDANDO_PREPARACAO);
        venda.setAtualizadoEm(Instant.now());

        Product firstProduct = null;
        int totalQuantidade = 0;
        BigDecimal total = BigDecimal.ZERO;

        for (VendaCheckoutItemDTO itemRequest : items) {
            Product produto = productRepo.findById(itemRequest.produtoId())
                    .orElseThrow(() -> new EntityNotFoundException("Produto nao encontrado: " + itemRequest.produtoId()));

            stockService.adjust(new StockAdjustDTO(
                    produto.getId(),
                    TipoMovimento.SAIDA,
                    itemRequest.quantidade(),
                    "Venda",
                    null
            ));

            BigDecimal subtotal = produto.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantidade()));

            ItemVenda item = new ItemVenda();
            item.setVenda(venda);
            item.setProduto(produto);
            item.setQuantidade(itemRequest.quantidade());
            item.setPrecoUnitario(produto.getPrice());
            item.setSubtotal(subtotal);
            venda.getItems().add(item);

            if (firstProduct == null) {
                firstProduct = produto;
            }

            totalQuantidade += itemRequest.quantidade();
            total = total.add(subtotal);
        }

        venda.setProduto(firstProduct);
        venda.setQuantidade(totalQuantidade);
        venda.setTotal(total);

        BigDecimal valorPago = formaPagamento == FormaPagamento.DINHEIRO_FISICO
                ? (valorPagoInformado == null ? total : valorPagoInformado)
                : total;
        if (valorPago.compareTo(total) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valor pago insuficiente para concluir a venda");
        }

        venda.setValorPago(valorPago);
        venda.setTroco(valorPago.subtract(total));

        return toDTO(vendaRepo.save(venda));
    }

    private CustomerProduct resolveCustomer(Long clienteId) {
        if (clienteId != null) {
            return customerRepo.findById(clienteId)
                    .orElseThrow(() -> new EntityNotFoundException("Cliente nao encontrado: " + clienteId));
        }

        return customerRepo.findByPhone(WALK_IN_CUSTOMER_PHONE)
                .orElseGet(() -> customerRepo.save(CustomerProduct.builder()
                        .name("Cliente de balcao")
                        .sex(Sexo.HOMEM)
                        .phone(WALK_IN_CUSTOMER_PHONE)
                        .email(null)
                        .birthDate(LocalDate.of(2000, 1, 1))
                        .provincia("Maputo")
                        .cidade("Maputo")
                        .bairro("Balcao")
                        .elegivelConta(Boolean.FALSE)
                        .contaActiva(Boolean.FALSE)
                        .temServicoAgua(Boolean.FALSE)
                        .observacoes("Cliente generico para vendas internas sem cadastro.")
                        .build()));
    }

    public VendaResponseDTO toDTO(Venda venda) {
        List<VendaItemResponseDTO> items = toItems(venda);
        VendaItemResponseDTO firstItem = items.isEmpty() ? null : items.getFirst();
        BigDecimal precoUnitario = firstItem == null ? BigDecimal.ZERO : firstItem.precoUnitario();
        BigDecimal total = venda.getTotal() != null
                ? venda.getTotal()
                : items.stream().map(VendaItemResponseDTO::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        String produtoNome = firstItem == null
                ? "Produto removido"
                : items.size() > 1
                ? firstItem.produtoNome() + " +" + (items.size() - 1) + " itens"
                : firstItem.produtoNome();

        return new VendaResponseDTO(
                venda.getId(),
                firstItem == null ? null : firstItem.produtoId(),
                produtoNome,
                firstItem == null ? null : firstItem.categoria(),
                venda.getCliente() == null ? null : venda.getCliente().getId(),
                venda.getCliente() == null ? "Cliente removido" : venda.getCliente().getName(),
                venda.getFuncionario() == null ? null : venda.getFuncionario().getId(),
                venda.getFuncionario() == null ? "Operador nao identificado" : venda.getFuncionario().getNome(),
                venda.getQuantidade(),
                precoUnitario,
                total,
                venda.getFormaPagamento(),
                venda.getEstadoLevantamento() == null
                        ? EstadoLevantamento.AGUARDANDO_PREPARACAO
                        : venda.getEstadoLevantamento(),
                venda.getLevantamentoNotas(),
                venda.getValorPago(),
                venda.getTroco(),
                venda.getCriadoEm(),
                venda.getAtualizadoEm(),
                venda.getLevantadoEm(),
                items.size(),
                items
        );
    }

    private List<VendaCheckoutItemDTO> normalizeItems(VendaCreateDTO dto) {
        if (dto.items() != null && !dto.items().isEmpty()) {
            return dto.items();
        }

        if (dto.produtoId() == null || dto.quantidade() == null || dto.quantidade() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selecione pelo menos um produto com quantidade valida");
        }

        return List.of(new VendaCheckoutItemDTO(dto.produtoId(), dto.quantidade()));
    }

    private List<VendaItemResponseDTO> toItems(Venda venda) {
        if (venda.getItems() != null && !venda.getItems().isEmpty()) {
            return venda.getItems().stream()
                    .map(item -> new VendaItemResponseDTO(
                            item.getProduto().getId(),
                            item.getProduto().getName(),
                            item.getProduto().getCategory(),
                            item.getQuantidade(),
                            item.getPrecoUnitario(),
                            item.getSubtotal()
                    ))
                    .toList();
        }

        if (venda.getProduto() == null) {
            return new ArrayList<>();
        }

        BigDecimal precoUnitario = venda.getProduto().getPrice() == null ? BigDecimal.ZERO : venda.getProduto().getPrice();
        BigDecimal subtotal = venda.getTotal() == null
                ? precoUnitario.multiply(BigDecimal.valueOf(venda.getQuantidade() == null ? 0 : venda.getQuantidade()))
                : venda.getTotal();

        return List.of(new VendaItemResponseDTO(
                venda.getProduto().getId(),
                venda.getProduto().getName(),
                venda.getProduto().getCategory(),
                venda.getQuantidade(),
                precoUnitario,
                subtotal
        ));
    }
}
