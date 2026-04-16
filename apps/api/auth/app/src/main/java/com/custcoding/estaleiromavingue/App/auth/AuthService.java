package com.custcoding.estaleiromavingue.App.auth;

import com.custcoding.estaleiromavingue.App.auth.dto.*;
import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import com.custcoding.estaleiromavingue.App.repositories.CustomerRepository;
import com.custcoding.estaleiromavingue.App.security.JwtService;
import com.custcoding.estaleiromavingue.App.security.tokens.resetpassword.ResetPassowordTokenRepository;
import com.custcoding.estaleiromavingue.App.security.tokens.resetpassword.ResetPasswordToken;
import com.custcoding.estaleiromavingue.App.security.tokens.verification.VerificationToken;
import com.custcoding.estaleiromavingue.App.security.tokens.verification.VerificationTokenRepository;
import com.custcoding.estaleiromavingue.App.services.EmailValidatorService;
import com.custcoding.estaleiromavingue.App.users.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

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

    private final ResetPassowordTokenRepository resetPassowordTokenRepository;

    @Value("${app.front-url}")
    private String frontendUrl;


    public LoginResponse login(LoginRequest req) {
        AppUser u = userRepo.findByEmail(req.email())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais inválidas"));

        if (!encoder.matches(req.password(), u.getPasswordHash())) {
            throw new IllegalArgumentException("Credenciais inválidas");
        }

        if(!u.getEnabled()){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta não verificada. Verifique o seu email.");
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
    @Transactional
    public void registerClient(RegisterClientRequest req) {

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
        u.setEnabled(false);
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

        // 3) Envia email de verificacao
        sendVerification(u);

    }

    private void sendVerification(AppUser user){
        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);

        String tokenValue = UUID.randomUUID().toString();
        String code = String.format("%06d", (int)(Math.random() * 1000000));

        VerificationToken token = new VerificationToken();
        token.setToken(tokenValue);
        token.setCode(code);
        token.setUser(user);
        token.setExpiryDate(LocalDateTime.now().plusHours(24));
        tokenRepository.save(token);

        System.out.println("Código de verificação gerado e salvo para " + user.getEmail() + ": " + code);

        try {
            emailValidatorService.sendVerificationEmail(user.getEmail(), code);
        } catch (Exception e) {
            // Log the error, but don't fail the registration
            System.err.println("Failed to send verification email: " + e.getMessage());
            System.err.println("Verification code: " + code);
        }

   }

   public void verifyAccount(String tokenValue){
       VerificationToken vt = tokenRepository.findByToken(tokenValue)
               .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido"));

       if (vt.isExpired()) {
           throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expirado. Solicite um novo.");
       }

       AppUser u = vt.getUser();
       u.setEnabled(true);
       userRepo.save(u);
       tokenRepository.delete(vt);
   }

   public void verifyAccountByCode(String email, String code) {
       System.out.println("Tentando verificar código para email: " + email + ", código digitado: " + code);

       AppUser user = userRepo.findByEmail(email)
               .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email não encontrado"));
       System.out.println("Usuário encontrado: " + user.getEmail() + ", enabled: " + user.getEnabled());

       VerificationToken vt = tokenRepository.findByUser(user)
               .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código de verificação não encontrado"));
       System.out.println("Token encontrado, código salvo: '" + vt.getCode() + "', expirado: " + vt.isExpired());

       if (vt.isExpired()) {
           throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código expirado. Solicite um novo.");
       }

       // Normalizar o código para 6 dígitos com zeros à esquerda
       String normalizedCode;
       try {
           normalizedCode = String.format("%06d", Integer.parseInt(code.trim()));
           System.out.println("Código normalizado: '" + normalizedCode + "'");
       } catch (NumberFormatException e) {
           System.out.println("Erro ao parsear código: " + code);
           throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código inválido");
       }

       if (!normalizedCode.equals(vt.getCode())) {
           System.out.println("Código não bate: esperado '" + vt.getCode() + "', recebido '" + normalizedCode + "'");
           throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código inválido");
       }

       System.out.println("Código válido, ativando conta");
       user.setEnabled(true);
       userRepo.save(user);
       tokenRepository.delete(vt);
   }


    public void resendVerificationToken(String email) {
        AppUser user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));

        if (user.getEnabled()) {
            throw new RuntimeException("Conta já verificada");
        }

        sendVerification(user);
    }

    public void requestPasswordReset(ForgotPasswordRequest request)
    {
        AppUser user = userRepo.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));

        resetPassowordTokenRepository.findByUser(user).ifPresent(resetPassowordTokenRepository::delete);

        String tokenValue = UUID.randomUUID().toString();
        String code = String.format("%06d", (int)(Math.random() * 1000000));

        ResetPasswordToken token = new ResetPasswordToken();
        token.setToken(tokenValue);
        token.setCode(code);
        token.setUser(user);
        token.setExpiryDate(LocalDateTime.now().plusHours(1));

        resetPassowordTokenRepository.save(token);

        try {
            emailValidatorService.sendPasswordResetEmail(user.getEmail(), code);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
        }


    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request){

        AppUser user = userRepo.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));

        ResetPasswordToken token = resetPassowordTokenRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Token Invalido"));
        if(token.isExpired()){
            throw new RuntimeException("Token Expirado");
        }

        // Normalizar o código
        String normalizedCode;
        try {
            normalizedCode = String.format("%06d", Integer.parseInt(request.code().trim()));
        } catch (NumberFormatException e) {
            throw new RuntimeException("Código inválido");
        }

        if (!normalizedCode.equals(token.getCode())) {
            throw new RuntimeException("Código inválido");
        }

        user.setPasswordHash(encoder.encode(request.newPassword()));
        userRepo.save(user);
        resetPassowordTokenRepository.delete(token);

    }

    // Limpeza automática de contas pendentes e tokens expirados a cada hora
    @Scheduled(fixedRate = 3600000) // 1 hora em milissegundos
    @Transactional
    public void cleanupExpiredData() {
        LocalDateTime now = LocalDateTime.now();

        // Remover tokens de verificação expirados e suas contas associadas não verificadas
        var expiredVerificationTokens = tokenRepository.findAll().stream()
                .filter(VerificationToken::isExpired)
                .toList();

        for (VerificationToken token : expiredVerificationTokens) {
            AppUser user = token.getUser();
            if (!user.getEnabled()) {
                // Remover conta do cliente se existir
                customerRepo.findByEmail(user.getEmail()).ifPresent(customerRepo::delete);
                // Remover usuário
                userRepo.delete(user);
                System.out.println("Removida conta pendente expirada: " + user.getEmail());
            }
            // Remover token
            tokenRepository.delete(token);
        }

        // Remover tokens de reset de senha expirados
        var expiredResetTokens = resetPassowordTokenRepository.findAll().stream()
                .filter(ResetPasswordToken::isExpired)
                .toList();

        for (ResetPasswordToken token : expiredResetTokens) {
            resetPassowordTokenRepository.delete(token);
            System.out.println("Removido token de reset expirado para: " + token.getUser().getEmail());
        }

        System.out.println("Limpeza automática executada em " + now);
    }



}