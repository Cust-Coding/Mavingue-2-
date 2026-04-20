package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.factura_compra.FacturaCompraCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_compra.FacturaCompraResponseDTO;
import com.custcoding.estaleiromavingue.App.models.FacturaCompra;
import com.custcoding.estaleiromavingue.App.models.Funcionario;
import com.custcoding.estaleiromavingue.App.models.Product;
import com.custcoding.estaleiromavingue.App.models.status.TipoMovimento;
import com.custcoding.estaleiromavingue.App.repositories.FacturaCompraRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class FacturaCompraService {

    private final FacturaCompraRepository repo;
    private final ProductRepository productRepo;
    private final StockService stockService;
    private final OperationActorService operationActorService;

    public FacturaCompraService(
            FacturaCompraRepository repo,
            ProductRepository productRepo,
            StockService stockService,
            OperationActorService operationActorService
    ) {
        this.repo = repo;
        this.productRepo = productRepo;
        this.stockService = stockService;
        this.operationActorService = operationActorService;
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
        Product produto = productRepo.findById(dto.produtoId())
                .orElseThrow(() -> new EntityNotFoundException("Produto nao encontrado: " + dto.produtoId()));

        Funcionario funcionario = operationActorService.resolveFuncionario(userIdFromAuth, dto.funcionarioId());

        stockService.adjust(new com.custcoding.estaleiromavingue.App.dtos.stock.StockAdjustDTO(
                produto.getId(), TipoMovimento.ENTRADA, dto.quantidade(), "Compra"
        ));

        FacturaCompra factura = new FacturaCompra();
        factura.setProduto(produto);
        factura.setFuncionario(funcionario);
        factura.setQuantidade(dto.quantidade());
        factura.setPrecoUnit(produto.getPrice());
        factura.setTotal(produto.getPrice().multiply(BigDecimal.valueOf(dto.quantidade())));

        return toDTO(repo.save(factura));
    }

    private FacturaCompraResponseDTO toDTO(FacturaCompra factura) {
        return new FacturaCompraResponseDTO(
                factura.getId(),
                factura.getProduto().getId(),
                factura.getProduto().getName(),
                factura.getQuantidade(),
                factura.getFuncionario().getId(),
                factura.getFuncionario().getNome(),
                factura.getPrecoUnit(),
                factura.getTotal(),
                factura.getCriadoEm()
        );
    }
}
