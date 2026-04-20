package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.stock.StockAdjustDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaStatusUpdateDTO;
import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import com.custcoding.estaleiromavingue.App.models.Funcionario;
import com.custcoding.estaleiromavingue.App.models.Product;
import com.custcoding.estaleiromavingue.App.models.Venda;
import com.custcoding.estaleiromavingue.App.models.status.EstadoLevantamento;
import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;
import com.custcoding.estaleiromavingue.App.models.status.TipoMovimento;
import com.custcoding.estaleiromavingue.App.repositories.CustomerRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProductRepository;
import com.custcoding.estaleiromavingue.App.repositories.VendaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
public class VendaService {

    private final VendaRepository vendaRepo;
    private final ProductRepository productRepo;
    private final CustomerRepository customerRepo;
    private final StockService stockService;
    private final OperationActorService operationActorService;

    public VendaService(
            VendaRepository vendaRepo,
            ProductRepository productRepo,
            CustomerRepository customerRepo,
            StockService stockService,
            OperationActorService operationActorService
    ) {
        this.vendaRepo = vendaRepo;
        this.productRepo = productRepo;
        this.customerRepo = customerRepo;
        this.stockService = stockService;
        this.operationActorService = operationActorService;
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
        Funcionario funcionario = operationActorService.resolveFuncionario(userIdFromAuth, dto.funcionarioId());
        return createInternal(dto.produtoId(), dto.clienteId(), funcionario.getId(), dto.quantidade(), dto.formaPagamento());
    }

    @Transactional
    public VendaResponseDTO createForClientCheckout(
            Long produtoId,
            Long clienteId,
            Long funcionarioId,
            Integer quantidade,
            FormaPagamento formaPagamento
    ) {
        return createInternal(produtoId, clienteId, funcionarioId, quantidade, formaPagamento);
    }

    @Transactional
    public VendaResponseDTO updatePickupStatus(Long id, VendaStatusUpdateDTO dto) {
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

        return toDTO(vendaRepo.save(venda));
    }

    @Transactional
    public VendaResponseDTO createInternal(
            Long produtoId,
            Long clienteId,
            Long funcionarioId,
            Integer quantidade,
            FormaPagamento formaPagamento
    ) {
        Product produto = productRepo.findById(produtoId)
                .orElseThrow(() -> new EntityNotFoundException("Produto nao encontrado: " + produtoId));

        stockService.adjust(new StockAdjustDTO(produto.getId(), TipoMovimento.SAIDA, quantidade, "Venda"));

        CustomerProduct cliente = customerRepo.findById(clienteId)
                .orElseThrow(() -> new EntityNotFoundException("Cliente nao encontrado: " + clienteId));

        Funcionario funcionario = operationActorService.resolveFuncionario(null, funcionarioId);

        Venda venda = new Venda();
        venda.setProduto(produto);
        venda.setCliente(cliente);
        venda.setFuncionario(funcionario);
        venda.setQuantidade(quantidade);
        venda.setFormaPagamento(formaPagamento);
        venda.setTotal(produto.getPrice().multiply(BigDecimal.valueOf(quantidade == null ? 0 : quantidade)));
        venda.setEstadoLevantamento(EstadoLevantamento.AGUARDANDO_PREPARACAO);
        venda.setAtualizadoEm(Instant.now());

        return toDTO(vendaRepo.save(venda));
    }

    public VendaResponseDTO toDTO(Venda venda) {
        BigDecimal precoUnitario = venda.getProduto() != null && venda.getProduto().getPrice() != null
                ? venda.getProduto().getPrice()
                : BigDecimal.ZERO;
        BigDecimal total = venda.getTotal() != null
                ? venda.getTotal()
                : precoUnitario.multiply(BigDecimal.valueOf(venda.getQuantidade() == null ? 0 : venda.getQuantidade()));

        return new VendaResponseDTO(
                venda.getId(),
                venda.getProduto() == null ? null : venda.getProduto().getId(),
                venda.getProduto() == null ? "Produto removido" : venda.getProduto().getName(),
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
                venda.getCriadoEm(),
                venda.getAtualizadoEm(),
                venda.getLevantadoEm()
        );
    }
}
