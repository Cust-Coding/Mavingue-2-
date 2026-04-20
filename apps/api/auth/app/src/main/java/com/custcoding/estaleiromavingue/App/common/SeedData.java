package com.custcoding.estaleiromavingue.App.common;

import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import com.custcoding.estaleiromavingue.App.models.Adress;
import com.custcoding.estaleiromavingue.App.models.Ferragem;
import com.custcoding.estaleiromavingue.App.models.Funcionario;
import com.custcoding.estaleiromavingue.App.models.Owner;
import com.custcoding.estaleiromavingue.App.models.Product;
import com.custcoding.estaleiromavingue.App.models.Stock;
import com.custcoding.estaleiromavingue.App.models.status.Sexo;
import com.custcoding.estaleiromavingue.App.repositories.CustomerRepository;
import com.custcoding.estaleiromavingue.App.repositories.AdressRepository;
import com.custcoding.estaleiromavingue.App.repositories.FerragemRepository;
import com.custcoding.estaleiromavingue.App.repositories.FuncionarioRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProductRepository;
import com.custcoding.estaleiromavingue.App.repositories.ProprietarioRepository;
import com.custcoding.estaleiromavingue.App.repositories.StockRepository;
import com.custcoding.estaleiromavingue.App.users.AppUser;
import com.custcoding.estaleiromavingue.App.users.AppUserRepository;
import com.custcoding.estaleiromavingue.App.users.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;

@Component
@RequiredArgsConstructor
public class SeedData implements CommandLineRunner {

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder encoder;
    private final ProprietarioRepository proprietarioRepository;
    private final FerragemRepository ferragemRepository;
    private final FuncionarioRepository funcionarioRepository;
    private final ProductRepository productRepository;
    private final StockRepository stockRepository;
    private final CustomerRepository customerRepository;
    private final AdressRepository adressRepository;

    @Override
    public void run(String... args) {
        AppUser admin = ensureUser("Admin Sistema", "adminsystem@mavingue.com", Role.ADMIN);
        AppUser funcionarioUser = ensureUser("Funcionario Mavingue", "funcionario@maving.com", Role.FUNCIONARIO);

        Owner owner = proprietarioRepository.findByEmail(admin.getEmail())
                .orElseGet(() -> {
                    Owner created = new Owner();
                    created.setNome(admin.getNome());
                    created.setTelefone("840000001");
                    created.setEmail(admin.getEmail());
                    created.setNuit("400000001");
                    created.setPalavraPasse("mavingue1234#");
                    return proprietarioRepository.save(created);
                });

        Ferragem ferragem = ferragemRepository.findAll().stream()
                .findFirst()
                .orElseGet(() -> {
                    Ferragem created = new Ferragem();
                    created.setName("Mavingue Loja Principal");
                    created.setBairro("Baixa");
                    created.setOwner(owner);
                    return ferragemRepository.save(created);
                });

        ensureFuncionario(admin.getNome(), "Administrador", "840000001", ferragem, owner);
        ensureFuncionario(funcionarioUser.getNome(), "Operador de Loja", "840000002", ferragem, owner);

        ensureCustomer("Cliente Demo", "cliente.demo@mavingue.com", "870000001", Sexo.MULHER, "500000001");
        ensureAdress("Zona Central", "Central", ferragem);
        ensureAdress("Zona Museu", "Polana", ferragem);

        ensureProduct("Cimento 32.5", "Saco de cimento para obra geral", new BigDecimal("480.00"), "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=1200&q=80", ferragem, 120);
        ensureProduct("Bloco 15", "Bloco de construcao resistente", new BigDecimal("55.00"), "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80", ferragem, 800);
        ensureProduct("Torneira Cromada", "Torneira para cozinha e lavatorio", new BigDecimal("950.00"), "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=1200&q=80", ferragem, 45);
        ensureProduct("Tubo PVC 1/2", "Tubo PVC para canalizacao", new BigDecimal("210.00"), "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1200&q=80", ferragem, 150);
    }

    private AppUser ensureUser(String nome, String email, Role role) {
        return appUserRepository.findByEmail(email).map(existing -> {
            existing.setNome(nome);
            existing.setRole(role);
            existing.setPasswordHash(encoder.encode("mavingue1234#"));
            existing.setEnabled(true);
            return appUserRepository.save(existing);
        }).orElseGet(() -> appUserRepository.save(AppUser.builder()
                .nome(nome)
                .email(email)
                .passwordHash(encoder.encode("mavingue1234#"))
                .role(role)
                .enabled(true)
                .build()));
    }

    private void ensureFuncionario(String nome, String cargo, String telefone, Ferragem ferragem, Owner owner) {
        funcionarioRepository.findFirstByNomeIgnoreCase(nome).orElseGet(() -> {
            Funcionario funcionario = new Funcionario();
            funcionario.setNome(nome);
            funcionario.setCargo(cargo);
            funcionario.setTelefone(telefone);
            funcionario.setFerragem(ferragem);
            funcionario.setOwner(owner);
            return funcionarioRepository.save(funcionario);
        });
    }

    private void ensureCustomer(String nome, String email, String telefone, Sexo sexo, String nuit) {
        customerRepository.findByEmail(email).orElseGet(() -> {
            CustomerProduct customer = new CustomerProduct();
            customer.setName(nome);
            customer.setEmail(email);
            customer.setPhone(telefone);
            customer.setSex(sexo);
            customer.setBirthDate(LocalDate.of(1996, 6, 15));
            customer.setProvincia("Maputo");
            customer.setCidade("Maputo");
            customer.setBairro("Central");
            customer.setEndereco("Avenida 25 de Setembro");
            customer.setNuit(nuit);
            customer.setTipoDocumento("BI");
            customer.setNumeroDocumento("110100000000A");
            return customerRepository.save(customer);
        });
    }

    private void ensureProduct(String nome, String descricao, BigDecimal preco, String urlImg, Ferragem ferragem, int quantidadeStock) {
        Product product = productRepository.findAll().stream()
                .filter(item -> item.getName().equalsIgnoreCase(nome))
                .findFirst()
                .orElseGet(() -> productRepository.save(Product.builder()
                        .name(nome)
                        .description(descricao)
                        .price(preco)
                        .urlImg(urlImg)
                        .build()));

        stockRepository.findByProduto_Id(product.getId()).orElseGet(() -> {
            Stock stock = new Stock();
            stock.setProduto(product);
            stock.setFerragem(ferragem);
            stock.setQuantidade(quantidadeStock);
            stock.setStockMinimo(10);
            return stockRepository.save(stock);
        });
    }

    private void ensureAdress(String nome, String bairro, Ferragem ferragem) {
        boolean exists = adressRepository.findAll().stream()
                .anyMatch(adress -> adress.getName().equalsIgnoreCase(nome));
        if (!exists) {
            Adress adress = new Adress();
            adress.setName(nome);
            adress.setBairro(bairro);
            adress.setFerragem(ferragem);
            adressRepository.save(adress);
        }
    }
}
