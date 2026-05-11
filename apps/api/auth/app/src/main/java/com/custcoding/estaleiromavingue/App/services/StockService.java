package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.stock.MovimentoStockResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.stock.StockAdjustDTO;
import com.custcoding.estaleiromavingue.App.dtos.stock.StockResponseDTO;
import com.custcoding.estaleiromavingue.App.models.Ferragem;
import com.custcoding.estaleiromavingue.App.models.MovimentoStock;
import com.custcoding.estaleiromavingue.App.models.Product;
import com.custcoding.estaleiromavingue.App.models.Stock;
import com.custcoding.estaleiromavingue.App.models.status.TipoMovimento;
import com.custcoding.estaleiromavingue.App.repositories.FerragemRepository;
import com.custcoding.estaleiromavingue.App.repositories.MovimentoStockRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProductRepository;
import com.custcoding.estaleiromavingue.App.repositories.StockRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class StockService {

    private final StockRepository stockRepo;
    private final ProductRepository productRepo;
    private final MovimentoStockRepository movRepo;
    private final FerragemRepository ferragemRepo;

    public StockService(
            StockRepository stockRepo,
            ProductRepository productRepo,
            MovimentoStockRepository movRepo,
            FerragemRepository ferragemRepo
    ) {
        this.stockRepo = stockRepo;
        this.productRepo = productRepo;
        this.movRepo = movRepo;
        this.ferragemRepo = ferragemRepo;
    }

    @Transactional(readOnly = true)
    public List<StockResponseDTO> list() {
        return stockRepo.findAll().stream()
                .map(this::toStockResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MovimentoStockResponseDTO> listMovements() {
        return movRepo.findAll().stream()
                .sorted((left, right) -> right.getCriadoEm().compareTo(left.getCriadoEm()))
                .map(movimento -> new MovimentoStockResponseDTO(
                        movimento.getId(),
                        movimento.getProduto() == null ? null : movimento.getProduto().getId(),
                        movimento.getProduto() == null ? "Produto removido" : movimento.getProduto().getName(),
                        movimento.getProduto() == null ? null : movimento.getProduto().getCategory(),
                        movimento.getProduto() == null ? BigDecimal.ZERO : movimento.getProduto().getPrice(),
                        movimento.getFerragem() == null ? null : movimento.getFerragem().getId(),
                        movimento.getFerragem() == null ? "Ferragem nao definida" : movimento.getFerragem().getName(),
                        movimento.getTipo(),
                        movimento.getQuantidade(),
                        movimento.getMotivo(),
                        movimento.getCriadoEm()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public StockResponseDTO getByProduto(Long produtoId) {
        Stock stock = stockRepo.findByProduto_Id(produtoId)
                .orElseThrow(() -> new EntityNotFoundException("Stock nao encontrado para produto: " + produtoId));
        return toStockResponse(stock);
    }

    @Transactional
    public StockResponseDTO adjust(StockAdjustDTO dto) {
        Product product = productRepo.findById(dto.produtoId())
                .orElseThrow(() -> new EntityNotFoundException("Produto nao encontrado: " + dto.produtoId()));

        Stock stock = stockRepo.findByProduto_Id(product.getId()).orElseGet(() -> {
            Stock next = new Stock();
            next.setProduto(product);
            next.setQuantidade(0);
            next.setStockMinimo(0);
            return next;
        });

        if (stock.getFerragem() == null) {
            stock.setFerragem(resolveFerragem());
        }

        int current = stock.getQuantidade() == null ? 0 : stock.getQuantidade();
        int nextQuantity;

        if (dto.tipo() == TipoMovimento.ENTRADA) {
            nextQuantity = current + dto.quantidade();
        } else {
            nextQuantity = current - dto.quantidade();
            if (nextQuantity < 0) {
                throw new IllegalArgumentException("Stock insuficiente. Atual=" + current + ", a tirar=" + dto.quantidade());
            }
        }

        if (dto.stockMinimo() != null) {
            stock.setStockMinimo(dto.stockMinimo());
        } else if (stock.getStockMinimo() == null) {
            stock.setStockMinimo(0);
        }

        stock.setQuantidade(nextQuantity);
        stock = stockRepo.save(stock);

        MovimentoStock movement = new MovimentoStock();
        movement.setProduto(product);
        movement.setFerragem(stock.getFerragem());
        movement.setTipo(dto.tipo());
        movement.setQuantidade(dto.quantidade());
        movement.setMotivo(dto.motivo());
        movRepo.save(movement);

        return toStockResponse(stock);
    }

    private StockResponseDTO toStockResponse(Stock stock) {
        BigDecimal precoUnitario = stock.getProduto().getPrice() == null ? BigDecimal.ZERO : stock.getProduto().getPrice();
        int quantidade = stock.getQuantidade() == null ? 0 : stock.getQuantidade();

        return new StockResponseDTO(
                stock.getProduto().getId(),
                stock.getProduto().getName(),
                stock.getProduto().getCategory(),
                precoUnitario,
                quantidade,
                stock.getStockMinimo() == null ? 0 : stock.getStockMinimo(),
                precoUnitario.multiply(BigDecimal.valueOf(quantidade))
        );
    }

    private Ferragem resolveFerragem() {
        return ferragemRepo.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Crie pelo menos uma ferragem antes de movimentar stock."
                ));
    }
}
