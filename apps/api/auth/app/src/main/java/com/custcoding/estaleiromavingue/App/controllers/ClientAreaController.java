package com.custcoding.estaleiromavingue.App.controllers;

import com.custcoding.estaleiromavingue.App.dtos.client_area.ClientAreaProfileDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterClientUpdateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterRequestCreateDTO;
import com.custcoding.estaleiromavingue.App.dtos.customer_water.CustomerWaterResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_agua.FacturaAguaPagamentoDTO;
import com.custcoding.estaleiromavingue.App.dtos.factura_agua.FacturaAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.leitura_agua.LeituraAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.ligacao_agua.LigacaoAguaResponseDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaClientCheckoutDTO;
import com.custcoding.estaleiromavingue.App.dtos.venda.VendaResponseDTO;
import com.custcoding.estaleiromavingue.App.services.ClientAreaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/client-area")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CLIENTE')")
public class ClientAreaController {

    private final ClientAreaService clientAreaService;

    @GetMapping("/profile")
    public ClientAreaProfileDTO profile(Authentication authentication) {
        return clientAreaService.profile(authentication.getName());
    }

    @GetMapping("/compras")
    public List<VendaResponseDTO> compras(Authentication authentication) {
        return clientAreaService.compras(authentication.getName());
    }

    @PostMapping("/compras/checkout")
    public List<VendaResponseDTO> checkout(
            @Valid @RequestBody VendaClientCheckoutDTO dto,
            Authentication authentication
    ) {
        return clientAreaService.checkout(authentication.getName(), dto);
    }

    @GetMapping("/compras/{id}")
    public VendaResponseDTO compra(@PathVariable Long id, Authentication authentication) {
        return clientAreaService.compra(authentication.getName(), id);
    }

    @GetMapping("/agua/ligacoes")
    public List<LigacaoAguaResponseDTO> ligacoes(Authentication authentication) {
        return clientAreaService.waterContracts(authentication.getName());
    }

    @GetMapping("/agua/leituras")
    public List<LeituraAguaResponseDTO> leituras(Authentication authentication) {
        return clientAreaService.waterReadings(authentication.getName());
    }

    @GetMapping("/agua/facturas")
    public List<FacturaAguaResponseDTO> facturas(Authentication authentication) {
        return clientAreaService.waterBills(authentication.getName());
    }

    @PostMapping("/agua/solicitacoes")
    public CustomerWaterResponseDTO criarPedidoAgua(
            @Valid @RequestBody CustomerWaterRequestCreateDTO dto,
            Authentication authentication
    ) {
        return clientAreaService.createWaterRequest(authentication.getName(), dto);
    }

    @PatchMapping("/agua/solicitacao")
    public CustomerWaterResponseDTO completarPedidoAgua(
            @Valid @RequestBody CustomerWaterClientUpdateDTO dto,
            Authentication authentication
    ) {
        return clientAreaService.updateLatestWaterRequest(authentication.getName(), dto);
    }

    @PatchMapping("/agua/solicitacoes/{id}")
    public CustomerWaterResponseDTO completarPedidoAguaPorId(
            @PathVariable Long id,
            @Valid @RequestBody CustomerWaterClientUpdateDTO dto,
            Authentication authentication
    ) {
        return clientAreaService.updateWaterRequest(authentication.getName(), id, dto);
    }

    @PatchMapping("/agua/facturas/{id}/pagamento")
    public FacturaAguaResponseDTO pagarFactura(
            @PathVariable Long id,
            @Valid @RequestBody FacturaAguaPagamentoDTO dto,
            Authentication authentication
    ) {
        return clientAreaService.payWaterBill(authentication.getName(), id, dto);
    }
}
