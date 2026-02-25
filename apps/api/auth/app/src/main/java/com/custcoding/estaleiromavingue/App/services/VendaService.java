package com.custcoding.estaleiromavingue.App.services;

import com.custcoding.estaleiromavingue.App.dtos.venda.VendaCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaResponseDTO;
import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import com.custcoding.estaleiromavingue.App.models.Funcionario;
import com.custcoding.estaleiromavingue.App.models.Product;
import com.custcoding.estaleiromavingue.App.models.Venda;
import com.custcoding.estaleiromavingue.App.models.status.TipoMovimento;
import com.custcoding.estaleiromavingue.App.repositories.CustomerRepository;
import com.custcoding.estaleiromavingue.App.repositories.FuncionarioRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProductRepository;
import com.custcoding.estaleiromavingue.App.repositories.VendaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class VendaService {

    private final VendaRepository vendaRepo;
    private final ProductRepository productRepo;
    private final CustomerRepository customerRepo;
    private final FuncionarioRepository funcionarioRepo;
    private final StockService stockService;

    public VendaService(
            VendaRepository vendaRepo,
            ProductRepository productRepo,
            CustomerRepository customerRepo,
            FuncionarioRepository funcionarioRepo,
            StockService stockService
    ) {
        this.vendaRepo = vendaRepo;
        this.productRepo = productRepo;
        this.customerRepo = customerRepo;
        this.funcionarioRepo = funcionarioRepo;
        this.stockService = stockService;
    }

    public List<VendaResponseDTO> list() {
        return vendaRepo.findAll().stream().map(this::toDTO).toList();
    }

    public VendaResponseDTO get(Long id) {
        Venda v = vendaRepo.findById(id).orElseThrow(() -> new EntityNotFoundException("Venda não encontrada: " + id));
        return toDTO(v);
    }

    @Transactional
    public VendaResponseDTO create(VendaCreateDTO dto) {
        Product p = productRepo.findById(dto.produtoId())
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado: " + dto.produtoId()));

        // Ajusta stock (SAÍDA)
        stockService.adjust(new com.custcoding.estaleiromavingue.App.dtos.stock.StockAdjustDTO(
                p.getId(), TipoMovimento.SAIDA, dto.quantidade(), "Venda"
        ));

        CustomerProduct cliente = customerRepo.findById(dto.clienteId())
                .orElseThrow(() -> new EntityNotFoundException("Cliente não encontrado: " + dto.clienteId()));

        Funcionario func = funcionarioRepo.findById(dto.funcionarioId())
                .orElseThrow(() -> new EntityNotFoundException("Funcionário não encontrado: " + dto.funcionarioId()));

        Venda v = new Venda();
        v.setProduto(p);
        v.setCliente(cliente);
        v.setFuncionario(func);
        v.setQuantidade(dto.quantidade());
        v.setFormaPagamento(dto.formaPagamento());

        v = vendaRepo.save(v);
        return toDTO(v);
    }

    private VendaResponseDTO toDTO(Venda v) {
        BigDecimal unit = v.getProduto().getPrice();
        BigDecimal total = unit.multiply(BigDecimal.valueOf(v.getQuantidade() == null ? 0 : v.getQuantidade()));
        return new VendaResponseDTO(
                v.getId(),
                v.getProduto().getId(),
                v.getProduto().getName(),
                v.getCliente().getId(),
                v.getFuncionario().getId(),
                v.getQuantidade(),
                unit,
                total,
                v.getFormaPagamento()
        );
    }
}
