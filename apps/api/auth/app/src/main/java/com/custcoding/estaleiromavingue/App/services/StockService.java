package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.stock.StockAdjustDTO;
import com.custcoding.estaleiromavingue.App.dtos.stock.MovimentoStockResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.stock.StockResponseDTO;
import com.custcoding.estaleiromavingue.App.models.MovimentoStock;
import com.custcoding.estaleiromavingue.App.models.Product;
import com.custcoding.estaleiromavingue.App.models.Stock;
import com.custcoding.estaleiromavingue.App.models.status.TipoMovimento;
import com.custcoding.estaleiromavingue.App.repositories.MovimentoStockRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProductRepository;
import com.custcoding.estaleiromavingue.App.repositories.StockRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockService {

    private final StockRepository stockRepo;
    private final ProductRepository productRepo;
    private final MovimentoStockRepository movRepo;

    public StockService(StockRepository stockRepo, ProductRepository productRepo, MovimentoStockRepository movRepo) {
        this.stockRepo = stockRepo;
        this.productRepo = productRepo;
        this.movRepo = movRepo;
    }

    @Transactional(readOnly = true)
    public List<StockResponseDTO> list() {
        return stockRepo.findAll().stream()
                .map(s -> new StockResponseDTO(s.getProduto().getId(), s.getProduto().getName(), s.getQuantidade()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MovimentoStockResponseDTO> listMovements() {
        return movRepo.findAll().stream()
                .sorted((left, right) -> right.getCriadoEm().compareTo(left.getCriadoEm()))
                .map(movimento -> new MovimentoStockResponseDTO(
                        movimento.getId(),
                        movimento.getProduto().getId(),
                        movimento.getProduto().getName(),
                        movimento.getFerragem().getId(),
                        movimento.getFerragem().getName(),
                        movimento.getTipo(),
                        movimento.getQuantidade(),
                        movimento.getMotivo(),
                        movimento.getCriadoEm()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public StockResponseDTO getByProduto(Long produtoId) {
        Stock s = stockRepo.findByProduto_Id(produtoId)
                .orElseThrow(() -> new EntityNotFoundException("Stock não encontrado para produto: " + produtoId));
        return new StockResponseDTO(s.getProduto().getId(), s.getProduto().getName(), s.getQuantidade());
    }

    @Transactional
    public StockResponseDTO adjust(StockAdjustDTO dto) {
        Product p = productRepo.findById(dto.produtoId())
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + dto.produtoId()));

        Stock stock = stockRepo.findByProduto_Id(p.getId()).orElseGet(() -> {
            Stock s = new Stock();
            s.setProduto(p);
            s.setQuantidade(0);
            s.setStockMinimo(0);
            return s;
        });

        int atual = stock.getQuantidade() == null ? 0 : stock.getQuantidade();
        int novo;

        if (dto.tipo() == TipoMovimento.ENTRADA) {
            novo = atual + dto.quantidade();
        } else {
            novo = atual - dto.quantidade();
            if (novo < 0) {
                throw new IllegalArgumentException("Stock insuficiente. Atual=" + atual + ", a tirar=" + dto.quantidade());
            }
        }

        if (stock.getFerragem() == null) {
            throw new IllegalStateException("Stock sem ferragem associada para o produto: " + p.getId());
        }

        stock.setQuantidade(novo);
        stock = stockRepo.save(stock);

        MovimentoStock mov = new MovimentoStock();
        mov.setProduto(p);
        mov.setFerragem(stock.getFerragem());
        mov.setTipo(dto.tipo());
        mov.setQuantidade(dto.quantidade());
        mov.setMotivo(dto.motivo());
        movRepo.save(mov);

        return new StockResponseDTO(p.getId(), p.getName(), stock.getQuantidade());
    }
}
