package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.factura_compra.FacturaCompraCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_compra.FacturaCompraResponseDTO;
import com.custcoding.estaleiromavingue.App.models.FacturaCompra;
import com.custcoding.estaleiromavingue.App.models.Funcionario;
import com.custcoding.estaleiromavingue.App.models.Product;
import com.custcoding.estaleiromavingue.App.models.status.TipoMovimento;
import com.custcoding.estaleiromavingue.App.repositories.FacturaCompraRepository;
import com.custcoding.estaleiromavingue.App.repositories.FuncionarioRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FacturaCompraService {

    private final FacturaCompraRepository repo;
    private final ProductRepository productRepo;
    private final FuncionarioRepository funcionarioRepo;
    private final StockService stockService;

    public FacturaCompraService(
            FacturaCompraRepository repo,
            ProductRepository productRepo,
            FuncionarioRepository funcionarioRepo,
            StockService stockService
    ) {
        this.repo = repo;
        this.productRepo = productRepo;
        this.funcionarioRepo = funcionarioRepo;
        this.stockService = stockService;
    }

    public List<FacturaCompraResponseDTO> list() {
        return repo.findAll().stream().map(this::toDTO).toList();
    }

    public FacturaCompraResponseDTO get(Long id) {
        FacturaCompra f = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Factura compra não encontrada: " + id));
        return toDTO(f);
    }

    @Transactional
    public FacturaCompraResponseDTO create(FacturaCompraCreateDTO dto) {
        Product p = productRepo.findById(dto.produtoId())
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + dto.produtoId()));

        Funcionario func = funcionarioRepo.findById(dto.funcionarioId())
                .orElseThrow(() -> new EntityNotFoundException("Funcionário não encontrado: " + dto.funcionarioId()));

        // Ajusta stock (ENTRADA)
        stockService.adjust(new com.custcoding.estaleiromavingue.App.dtos.stock.StockAdjustDTO(
                p.getId(), TipoMovimento.ENTRADA, dto.quantidade(), "Compra"
        ));

        FacturaCompra f = new FacturaCompra();
        f.setProduto(p);
        f.setFuncionario(func);
        f.setQuantidade(dto.quantidade());

        f = repo.save(f);
        return toDTO(f);
    }

    private FacturaCompraResponseDTO toDTO(FacturaCompra f) {
        return new FacturaCompraResponseDTO(
                f.getId(),
                f.getProduto().getId(),
                f.getQuantidade(),
                f.getFuncionario().getId()
        );
    }
}
