package com.custcoding.estaleiromavingue.App.auth;

import com.custcoding.estaleiromavingue.App.auth.dto.*;
import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import com.custcoding.estaleiromavingue.App.models.CustomerWater;
import com.custcoding.estaleiromavingue.App.models.status.EstadoServicoAgua;
import com.custcoding.estaleiromavingue.App.repositories.CustomerRepository;
import com.custcoding.estaleiromavingue.App.repositories.CustomerWaterRepository;
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
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AppUserRepository userRepo;
    private final CustomerRepository customerRepo;
    private final CustomerWaterRepository customerWaterRepository;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    private final VerificationTokenRepository tokenRepository;
    private final EmailValidatorService emailValidatorService;

    private final ResetPassowordTokenRepository resetPassowordTokenRepository;

    private final Map<String, List<LocalDateTime>> requestsPerEmail = new  ConcurrentHashMap<>();

    private final Integer MAX_EMAIL_PER_DAY=5;


    @Value("${app.front-url}")
    private String frontendUrl;



    public Optional<AppUser> findByIdentifier(String identifier) {

        if (identifier == null) return Optional.empty();

        if (identifier.matches("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$")){
            return userRepo.findByEmail(identifier);
        } else if (identifier.matches("^\\d{1,9}$")) {
            return userRepo.findByPhone("+258" + identifier);
            
        }else {
            throw new IllegalArgumentException("Use um email ou número de phone válido");
        }

    }

    public LoginResponse login(LoginRequest req) {

        AppUser u = findByIdentifier(req.identifier())
                .orElseThrow(() -> new IllegalArgumentException("Credenciais Inválidas"));

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
        return new MeResponse(u.getId(), u.getNome(), u.getEmail(), u.getPhone(),u.getRole());
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

        if (customerRepo.existsByPhone(req.phone())){
            throw  new ResponseStatusException(HttpStatus.BAD_REQUEST, "Numero de phone já cadastrado");
        }

        // 1) cria AppUser (login)
        AppUser u = new AppUser();
        u.setNome(req.nome());
        u.setPhone(req.phone());
        u.setEmail(req.email());
        u.setPasswordHash(encoder.encode(req.password()));
        u.setRole(Role.CLIENTE);
        u.setEnabled(false);
        u = userRepo.save(u);

        // 2) cria perfil do cliente (CustomerProduct)
        CustomerProduct c = new CustomerProduct();
        c.setName(req.nome());
        c.setSex(req.sexo());
        c.setPhone(req.phone());
        c.setEmail(req.email());
        c.setBirthDate(req.dataNascimento());
        c.setProvincia(req.provincia());
        c.setCidade(req.cidade());
        c.setBairro(req.bairro());

        customerRepo.save(c);

        if (Boolean.TRUE.equals(req.pedirAgua())) {
            CustomerWater water = new CustomerWater();
            water.setName(req.nome());
            water.setPhone(req.phone());
            water.setEmail(req.email());
            water.setReferenciaLocal("Pedido inicial criado no registo");
            water.setEstado(EstadoServicoAgua.PENDENTE_APROVACAO);
            water.setPedidoAgua(true);
            water.setActivo(false);
            water.setObservacoes("Pedido criado no registo da conta");
            customerWaterRepository.save(water);
        }

        // 3) Envia email de verificacao
        sendVerification(u);

    }

    private void sendVerification(AppUser user){
        verifyLimit(user.getEmail());
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

    public void verifyAccount(Long userId, String token) {
        AppUser user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Utilizador não encontrado"));

        VerificationToken vt = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido"));

        if (!vt.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token não pertence a este utilizador");
        }

        if (vt.isExpired()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expirado. Solicite um novo.");
        }

        user.setEnabled(true);
        userRepo.save(user);
        tokenRepository.delete(vt);
    }

   public void verifyAccountByCode(String email, String code) {
       System.out.println("Tentando verificar código para email: " + email + ", código digitado: " + code);

       // Normalizar o email (trim e lowercase)
       String normalizedEmail = email != null ? email.trim().toLowerCase() : "";
       System.out.println("Email normalizado: " + normalizedEmail);

       AppUser user = userRepo.findByEmail(normalizedEmail)
               .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email não encontrado"));
       System.out.println("Usuário encontrado: " + user.getEmail() + ", enabled: " + user.getEnabled());

       VerificationToken vt = tokenRepository.findByUser(user)
               .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código de verificação não encontrado. Solicite um novo código."));
       System.out.println("Token encontrado, código salvo: '" + vt.getCode() + "', expirado: " + vt.isExpired());

       if (vt.isExpired()) {
           throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código expirado. Solicite um novo.");
       }

       // Normalizar o código para 6 dígitos com zeros à esquerda
       String normalizedCode;
       try {
           // Remove qualquer caractere não numérico e normaliza
           String cleanCode = code != null ? code.replaceAll("[^0-9]", "") : "";
           normalizedCode = String.format("%06d", Integer.parseInt(cleanCode));
           System.out.println("Código normalizado: '" + normalizedCode + "'");
       } catch (NumberFormatException e) {
           System.out.println("Erro ao parsear código: " + code);
           throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código inválido");
       }

       // Comparação direta sem trim extra (já normalizado acima)
       if (!normalizedCode.equals(vt.getCode())) {
           System.out.println("Código não bate: esperado '" + vt.getCode() + "', recebido '" + normalizedCode + "'");
           throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código inválido ou expirado");
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
        // Normalizar email
        String normalizedEmail = request.email() != null ? request.email().trim().toLowerCase() : "";
        
        AppUser user = userRepo.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));

        verifyLimit(user.getEmail());

        resetPassowordTokenRepository.findByUser(user).ifPresent(resetPassowordTokenRepository::delete);

        String tokenValue = UUID.randomUUID().toString();
        String code = String.format("%06d", (int)(Math.random() * 1000000));

        ResetPasswordToken token = new ResetPasswordToken();
        token.setToken(tokenValue);
        token.setCode(code);
        token.setUser(user);
        token.setExpiryDate(LocalDateTime.now().plusHours(1));

        resetPassowordTokenRepository.save(token);

        System.out.println("Código de redefinição de senha gerado para " + user.getEmail() + ": " + code);

        try {
            emailValidatorService.sendPasswordResetEmail(user.getEmail(), code);
        } catch (Exception e) {
            System.err.println("Failed to send password reset email: " + e.getMessage());
        }


    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request){

        // Normalizar o email
        String normalizedEmail = request.email() != null ? request.email().trim().toLowerCase() : "";
        
        AppUser user = userRepo.findByEmail(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("Utilizador não encontrado"));

        ResetPasswordToken token = resetPassowordTokenRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Token Inválido. Solicite um novo código."));
        
        if(token.isExpired()){
            throw new RuntimeException("Código expirado. Solicite um novo.");
        }

        // Normalizar o código - remove caracteres não numéricos
        String normalizedCode;
        try {
            String cleanCode = request.code() != null ? request.code().replaceAll("[^0-9]", "") : "";
            normalizedCode = String.format("%06d", Integer.parseInt(cleanCode));
        } catch (NumberFormatException e) {
            throw new RuntimeException("Código inválido");
        }

        if (!normalizedCode.equals(token.getCode())) {
            throw new RuntimeException("Código inválido ou expirado");
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

    public void verifyLimit(String email) {
        LocalDateTime aDayAgo = LocalDateTime.now().minusDays(1);

        List<LocalDateTime> requests = requestsPerEmail
                .computeIfAbsent(email, k -> new ArrayList<>());

        requests.removeIf(t -> t.isBefore(aDayAgo));

        if (requests.size() >= MAX_EMAIL_PER_DAY){
            throw  new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Limite diário de emails atingido. Tente novamente amanhã."
            );
        }

        requests.add(LocalDateTime.now());
    }



}
