package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.factura_compra.FacturaCompraCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_compra.FacturaCompraItemCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_compra.FacturaCompraItemResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_compra.FacturaCompraResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.stock.StockAdjustDTO;
import com.custcoding.estaleiromavingue.App.models.FacturaCompra;
import com.custcoding.estaleiromavingue.App.models.FacturaCompraItem;
import com.custcoding.estaleiromavingue.App.models.Funcionario;
import com.custcoding.estaleiromavingue.App.models.Product;
import com.custcoding.estaleiromavingue.App.models.status.FormaPagamento;
import com.custcoding.estaleiromavingue.App.models.status.TipoMovimento;
import com.custcoding.estaleiromavingue.App.repositories.FacturaCompraRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class FacturaCompraService {

    private final FacturaCompraRepository repo;
    private final ProductRepository productRepo;
    private final StockService stockService;
    private final OperationActorService operationActorService;
    private final AuditLogService auditLogService;

    public FacturaCompraService(
            FacturaCompraRepository repo,
            ProductRepository productRepo,
            StockService stockService,
            OperationActorService operationActorService,
            AuditLogService auditLogService
    ) {
        this.repo = repo;
        this.productRepo = productRepo;
        this.stockService = stockService;
        this.operationActorService = operationActorService;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<FacturaCompraResponseDTO> list() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    @Transactional(readOnly = true)
    public FacturaCompraResponseDTO get(Long id) {
        FacturaCompra factura = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Factura compra nao encontrada: " + id));
        return toDTO(factura);
    }

    @Transactional
    public FacturaCompraResponseDTO create(String userIdFromAuth, FacturaCompraCreateDTO dto) {
        Funcionario funcionario = operationActorService.resolveFuncionario(userIdFromAuth, dto.funcionarioId());
        List<FacturaCompraItemCreateDTO> requestedItems = normalizeItems(dto);
        FormaPagamento formaPagamento = dto.formaPagamento() == null ? FormaPagamento.DINHEIRO_FISICO : dto.formaPagamento();

        FacturaCompra factura = new FacturaCompra();
        factura.setFuncionario(funcionario);

        Product firstProduct = null;
        BigDecimal firstPrice = BigDecimal.ZERO;
        int totalQuantidade = 0;
        BigDecimal total = BigDecimal.ZERO;

        for (FacturaCompraItemCreateDTO itemRequest : requestedItems) {
            Product produto = productRepo.findByIdAndAtivoTrue(itemRequest.produtoId())
                    .orElseThrow(() -> new EntityNotFoundException("Produto nao encontrado: " + itemRequest.produtoId()));

            stockService.adjust(new StockAdjustDTO(
                    produto.getId(),
                    TipoMovimento.ENTRADA,
                    itemRequest.quantidade(),
                    "Compra",
                    null
            ));

            BigDecimal subtotal = produto.getPrice().multiply(BigDecimal.valueOf(itemRequest.quantidade()));

            FacturaCompraItem item = new FacturaCompraItem();
            item.setFacturaCompra(factura);
            item.setProduto(produto);
            item.setQuantidade(itemRequest.quantidade());
            item.setPrecoUnitario(produto.getPrice());
            item.setSubtotal(subtotal);
            factura.getItems().add(item);

            if (firstProduct == null) {
                firstProduct = produto;
                firstPrice = produto.getPrice();
            }

            totalQuantidade += itemRequest.quantidade();
            total = total.add(subtotal);
        }

        factura.setProduto(firstProduct);
        factura.setQuantidade(totalQuantidade);
        factura.setPrecoUnit(firstPrice);
        factura.setTotal(total);
        factura.setFormaPagamento(formaPagamento);

        BigDecimal valorPago = formaPagamento == FormaPagamento.DINHEIRO_FISICO
                ? (dto.valorPago() == null ? total : dto.valorPago())
                : total;
        if (valorPago.compareTo(total) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Valor pago insuficiente para concluir a compra");
        }

        factura.setValorPago(valorPago);
        factura.setTroco(valorPago.subtract(total));

        FacturaCompra saved = repo.save(factura);
        auditLogService.logByUserId(
                userIdFromAuth,
                "PURCHASE_CREATE",
                "PURCHASE",
                saved.getId(),
                "Compra registada com " + requestedItems.size() + " item(ns)"
        );
        return toDTO(saved);
    }

    private FacturaCompraResponseDTO toDTO(FacturaCompra factura) {
        List<FacturaCompraItemResponseDTO> items = toItems(factura);
        FacturaCompraItemResponseDTO firstItem = items.isEmpty() ? null : items.getFirst();
        String produtoNome = firstItem == null
                ? "Produto removido"
                : items.size() > 1
                ? firstItem.produtoNome() + " +" + (items.size() - 1) + " itens"
                : firstItem.produtoNome();

        return new FacturaCompraResponseDTO(
                factura.getId(),
                firstItem == null ? null : firstItem.produtoId(),
                produtoNome,
                firstItem == null ? null : firstItem.categoria(),
                factura.getQuantidade(),
                factura.getFuncionario().getId(),
                factura.getFuncionario().getNome(),
                firstItem == null ? factura.getPrecoUnit() : firstItem.precoUnitario(),
                factura.getTotal(),
                factura.getFormaPagamento(),
                factura.getValorPago(),
                factura.getTroco(),
                factura.getCriadoEm(),
                items.size(),
                items
        );
    }

    private List<FacturaCompraItemCreateDTO> normalizeItems(FacturaCompraCreateDTO dto) {
        if (dto.items() != null && !dto.items().isEmpty()) {
            return dto.items();
        }

        if (dto.produtoId() == null || dto.quantidade() == null || dto.quantidade() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe pelo menos um produto com quantidade valida");
        }

        return List.of(new FacturaCompraItemCreateDTO(dto.produtoId(), dto.quantidade()));
    }

    private List<FacturaCompraItemResponseDTO> toItems(FacturaCompra factura) {
        if (factura.getItems() != null && !factura.getItems().isEmpty()) {
            return factura.getItems().stream()
                    .map(item -> new FacturaCompraItemResponseDTO(
                            item.getProduto().getId(),
                            item.getProduto().getName(),
                            item.getProduto().getCategory(),
                            item.getQuantidade(),
                            item.getPrecoUnitario(),
                            item.getSubtotal()
                    ))
                    .toList();
        }

        if (factura.getProduto() == null) {
            return new ArrayList<>();
        }

        BigDecimal precoUnitario = factura.getPrecoUnit() == null ? factura.getProduto().getPrice() : factura.getPrecoUnit();
        BigDecimal subtotal = factura.getTotal() == null
                ? precoUnitario.multiply(BigDecimal.valueOf(factura.getQuantidade() == null ? 0 : factura.getQuantidade()))
                : factura.getTotal();

        return List.of(new FacturaCompraItemResponseDTO(
                factura.getProduto().getId(),
                factura.getProduto().getName(),
                factura.getProduto().getCategory(),
                factura.getQuantidade(),
                precoUnitario,
                subtotal
        ));
    }
}
