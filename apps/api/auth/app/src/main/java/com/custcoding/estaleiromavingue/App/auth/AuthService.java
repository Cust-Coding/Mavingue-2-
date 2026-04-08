package com.custcoding.estaleiromavingue.App.auth;

import com.custcoding.estaleiromavingue.App.auth.dto.*;
import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import com.custcoding.estaleiromavingue.App.repositories.CustomerRepository;
import com.custcoding.estaleiromavingue.App.security.JwtService;
import com.custcoding.estaleiromavingue.App.security.VerificationToken;
import com.custcoding.estaleiromavingue.App.security.VerificationTokenRepository;
import com.custcoding.estaleiromavingue.App.services.EmailValidatorService;
import com.custcoding.estaleiromavingue.App.users.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository userRepo;
    private final CustomerRepository customerRepo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    private final VerificationTokenRepository tokenRepository;
    private final EmailValidatorService emailValidatorService;


    @Value("${app.base-url}")
    private String baseUrl;


    public LoginResponse login(LoginRequest req) {
        AppUser u = userRepo.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas"));

        if (!encoder.matches(req.password(), u.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciais inválidas");
        }

        return new LoginResponse(jwt.generate(u));
    }

    public MeResponse me(String userIdFromAuth) {
        Long id = Long.parseLong(userIdFromAuth);
        AppUser u = userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilizador não encontrado"));
        return new MeResponse(u.getId(), u.getNome(), u.getEmail(), u.getRole());
    }

    // ✅ NOVO: Registo do cliente com senha + perfil
    public LoginResponse registerClient(RegisterClientRequest req) {

        // email não pode repetir (conta)
        if (userRepo.findByEmail(req.email()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já existe");
        }

        // email não pode repetir (perfil)
        if (customerRepo.existsByEmail(req.email())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já existe no cadastro de cliente");
        }

        if (req.nuit() != null && !req.nuit().isBlank() && customerRepo.existsByNuit(req.nuit())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "NUIT já existe");
        }

        // 1) cria AppUser (login)
        AppUser u = new AppUser();
        u.setNome(req.nome());
        u.setEmail(req.email());
        u.setPasswordHash(encoder.encode(req.password()));
        u.setRole(Role.CLIENTE);
        u = userRepo.save(u);

        // 2) cria perfil do cliente (CustomerProduct)
        CustomerProduct c = new CustomerProduct();
        c.setName(req.nome());
        c.setSex(req.sexo());
        c.setPhone(req.telefone());
        c.setEmail(req.email());
        c.setBirthDate(req.dataNascimento());
        c.setProvincia(req.provincia());
        c.setCidade(req.cidade());
        c.setBairro(req.bairro());
        c.setEndereco(req.endereco());
        c.setNuit(req.nuit());
        c.setTipoDocumento(req.tipoDocumento());
        c.setNumeroDocumento(req.numeroDocumento());
        customerRepo.save(c);

        // 3) devolve token já logado
        return new LoginResponse(jwt.generate(u));
    }

    private void sendVerification(AppUser user){
        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);

        String tokenValue = UUID.randomUUID().toString();

        VerificationToken token = new VerificationToken();
        token.setToken(tokenValue);
        token.setUser(user);
        token.setExpiryDate(LocalDateTime.now().plusHours(24));
        tokenRepository.save(token);

        String verificationUrl = baseUrl + "/auth/verify?token=" + tokenValue;
        emailValidatorService.sendVerificationEmail(user.getEmail(),  verificationUrl);

   }

   public void verifyAccount(String tokenValue){
        VerificationToken token = tokenRepository.findByToken(tokenValue)
                .orElseThrow(() -> new RuntimeException("Token Invalido"));
        if (token.isExpired()){
            throw new RuntimeException("Token Expirado");
        }
        AppUser user  = token.getUser();
        user.setEnabled(true);
        userRepo.save(user);

        tokenRepository.delete(token);
   }


    public void resendVerificationToken(String email) {
        AppUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));

        if (user.isEnabled()) {
            throw new RuntimeException("Conta já verificada");
        }

        sendVerification(user);
    }


}