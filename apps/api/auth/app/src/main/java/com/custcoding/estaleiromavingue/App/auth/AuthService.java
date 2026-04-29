package com.custcoding.estaleiromavingue.App.auth;

import com.custcoding.estaleiromavingue.App.auth.dto.ForgotPasswordRequest;
import com.custcoding.estaleiromavingue.App.auth.dto.LoginRequest;
import com.custcoding.estaleiromavingue.App.auth.dto.LoginResponse;
import com.custcoding.estaleiromavingue.App.auth.dto.MeResponse;
import com.custcoding.estaleiromavingue.App.auth.dto.RegisterClientRequest;
import com.custcoding.estaleiromavingue.App.auth.dto.ResetPasswordRequest;
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
import com.custcoding.estaleiromavingue.App.services.AccountSyncService;
import com.custcoding.estaleiromavingue.App.services.EmailValidatorService;
import com.custcoding.estaleiromavingue.App.services.PasswordPolicyService;
import com.custcoding.estaleiromavingue.App.services.PermissionService;
import com.custcoding.estaleiromavingue.App.services.PhoneNumberService;
import com.custcoding.estaleiromavingue.App.users.AppUser;
import com.custcoding.estaleiromavingue.App.users.AppUserRepository;
import com.custcoding.estaleiromavingue.App.users.AppPermission;
import com.custcoding.estaleiromavingue.App.users.Role;
import com.custcoding.estaleiromavingue.App.users.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
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
    private final PhoneNumberService phoneNumberService;
    private final AccountSyncService accountSyncService;
    private final PermissionService permissionService;
    private final PasswordPolicyService passwordPolicyService;

    private final Map<String, List<LocalDateTime>> requestsPerEmail = new ConcurrentHashMap<>();
    private final Integer maxEmailPerDay = 5;

    @Value("${app.front-url}")
    private String frontendUrl;

    public Optional<AppUser> findByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) {
            return Optional.empty();
        }

        String trimmed = identifier.trim();
        if (trimmed.contains("@")) {
            return userRepo.findByEmail(trimmed.toLowerCase(Locale.ROOT));
        }

        String normalizedPhone = phoneNumberService.normalize(trimmed);
        if (normalizedPhone != null) {
            return userRepo.findByPhone(normalizedPhone);
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Use um email ou número de telefone valido");
    }

    public LoginResponse login(LoginRequest req) {
        AppUser user = findByIdentifier(req.identifier())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Email, Número ou senha inválidos"));

        if (!encoder.matches(req.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Email, Número ou senha inválidos");
        }

        UserStatus status = resolveStatus(user);
        if (status != UserStatus.ATIVO) {
            throw buildStatusException(status);
        }

        return new LoginResponse(jwt.generate(user));
    }

    public MeResponse me(String userIdFromAuth) {
        Long id = Long.parseLong(userIdFromAuth);
        AppUser user = userRepo.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Utilizador não encontrado"));

        return new MeResponse(
                user.getId(),
                user.getNome(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                resolveStatus(user),
                permissionService.effectivePermissionKeys(user)
        );
    }

    @Transactional
    public UserStatus registerClient(RegisterClientRequest req) {
        String normalizedEmail = normalizeEmail(req.email());
        String normalizedPhone = phoneNumberService.normalizeRequired(req.telefone());

        if (normalizedEmail != null && userRepo.existsByEmail(normalizedEmail)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ja existe uma conta com este email");
        }
        if (userRepo.existsByPhone(normalizedPhone)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ja existe uma conta com este numero de telefone");
        }

        AppUser user = new AppUser();
        user.setNome(req.nome().trim());
        user.setPhone(normalizedPhone);
        user.setEmail(normalizedEmail);
        passwordPolicyService.validatePublicPassword(req.password());
        user.setPasswordHash(encoder.encode(req.password()));
        user.setRole(Role.CLIENTE);
        user.setStatus(normalizedEmail == null ? UserStatus.PENDENTE_REVISAO : UserStatus.PENDENTE_VERIFICACAO);
        user.setEnabled(false);
        user.setPermissions(new java.util.LinkedHashSet<>(AppPermission.defaultForRole(Role.CLIENTE)));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user = userRepo.save(user);

        CustomerProduct customer = customerRepo.findByPhone(normalizedPhone)
                .or(() -> normalizedEmail == null ? Optional.empty() : customerRepo.findByEmail(normalizedEmail))
                .orElseGet(CustomerProduct::new);

        customer.setName(req.nome().trim());
        customer.setSex(req.sexo());
        customer.setPhone(normalizedPhone);
        customer.setEmail(normalizedEmail);
        customer.setBirthDate(req.dataNascimento());
        customer.setProvincia(req.provincia().trim());
        customer.setCidade(req.cidade().trim());
        customer.setBairro(req.bairro().trim());
        customer.setAppUser(user);
        customer.setElegivelConta(Boolean.TRUE);
        customer.setContaActiva(Boolean.FALSE);
        customer = customerRepo.save(customer);

        if (Boolean.TRUE.equals(req.pedirAgua())) {
            CustomerWater water = new CustomerWater();
            water.setName(req.nome().trim());
            water.setPhone(normalizedPhone);
            water.setEmail(normalizedEmail);
            water.setCustomer(customer);
            water.setAppUser(user);
            water.setReferenciaLocal("Pedido inicial criado no registo");
            water.setEstado(EstadoServicoAgua.PENDENTE_APROVACAO);
            water.setPedidoAgua(true);
            water.setActivo(false);
            water.setObservacoes("Pedido criado no registo da conta");
            water.setUpdated(LocalDateTime.now());
            customerWaterRepository.save(water);

            customer.setTemServicoAgua(Boolean.TRUE);
            customerRepo.save(customer);
        }

        accountSyncService.syncUser(user);

        if (normalizedEmail != null) {
            sendVerification(user);
        }

        return resolveStatus(user);
    }

    private void sendVerification(AppUser user) {
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            return;
        }

        verifyLimit(user.getEmail());
        tokenRepository.findByUser(user).ifPresent(tokenRepository::delete);

        String tokenValue = UUID.randomUUID().toString();
        String code = String.format("%06d", (int) (Math.random() * 1000000));

        VerificationToken token = new VerificationToken();
        token.setToken(tokenValue);
        token.setCode(code);
        token.setUser(user);
        token.setExpiryDate(LocalDateTime.now().plusHours(24));
        tokenRepository.save(token);

        emailValidatorService.sendVerificationEmail(user.getEmail(), code);
    }

    @Transactional
    public void verifyAccount(Long userId, String token) {
        AppUser user = userRepo.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Utilizador nao encontrado"));

        VerificationToken verificationToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token invalido"));

        if (!verificationToken.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token invalido");
        }

        if (verificationToken.isExpired()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token expirado. Solicite um novo codigo.");
        }

        activateUser(user);
        tokenRepository.delete(verificationToken);
    }

    @Transactional
    public void verifyAccountByCode(String email, String code) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email invalido");
        }

        AppUser user = userRepo.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email nao encontrado"));

        VerificationToken verificationToken = tokenRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codigo de verificacao nao encontrado. Solicite um novo codigo."));

        if (verificationToken.isExpired()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codigo expirado. Solicite um novo codigo.");
        }

        String normalizedCode = normalizeCode(code);
        if (!normalizedCode.equals(verificationToken.getCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codigo invalido ou expirado");
        }

        activateUser(user);
        tokenRepository.delete(verificationToken);
    }

    public void resendVerificationToken(String email) {
        String normalizedEmail = normalizeEmail(email);
        if (normalizedEmail == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email invalido");
        }

        AppUser user = userRepo.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizador nao encontrado"));

        if (resolveStatus(user) == UserStatus.ATIVO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Conta ja esta activa");
        }

        sendVerification(user);
    }

    public void requestPasswordReset(ForgotPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (normalizedEmail == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email invalido");
        }

        AppUser user = userRepo.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizador nao encontrado"));

        verifyLimit(user.getEmail());
        resetPassowordTokenRepository.findByUser(user).ifPresent(resetPassowordTokenRepository::delete);

        String code = String.format("%06d", (int) (Math.random() * 1000000));

        ResetPasswordToken token = new ResetPasswordToken();
        token.setToken(UUID.randomUUID().toString());
        token.setCode(code);
        token.setUser(user);
        token.setExpiryDate(LocalDateTime.now().plusHours(1));
        resetPassowordTokenRepository.save(token);

        emailValidatorService.sendPasswordResetEmail(user.getEmail(), code);
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        if (normalizedEmail == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email invalido");
        }

        AppUser user = userRepo.findByEmail(normalizedEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizador nao encontrado"));

        ResetPasswordToken token = resetPassowordTokenRepository.findByUser(user)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codigo invalido. Solicite um novo codigo."));

        if (token.isExpired()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codigo expirado. Solicite um novo codigo.");
        }

        if (!normalizeCode(request.code()).equals(token.getCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codigo invalido ou expirado");
        }

        passwordPolicyService.validatePublicPassword(request.newPassword());

        user.setPasswordHash(encoder.encode(request.newPassword().trim()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepo.save(user);
        resetPassowordTokenRepository.delete(token);
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanupExpiredData() {
        var expiredVerificationTokens = tokenRepository.findAll().stream()
                .filter(VerificationToken::isExpired)
                .toList();

        for (VerificationToken token : expiredVerificationTokens) {
            AppUser user = token.getUser();
            if (resolveStatus(user) == UserStatus.PENDENTE_VERIFICACAO) {
                customerRepo.findByAppUser_Id(user.getId()).ifPresent(customer -> {
                    customer.setAppUser(null);
                    customer.setContaActiva(Boolean.FALSE);
                    customerRepo.save(customer);
                });
                userRepo.delete(user);
            }
            tokenRepository.delete(token);
        }

        var expiredResetTokens = resetPassowordTokenRepository.findAll().stream()
                .filter(ResetPasswordToken::isExpired)
                .toList();

        for (ResetPasswordToken token : expiredResetTokens) {
            resetPassowordTokenRepository.delete(token);
        }
    }

    public void verifyLimit(String email) {
        if (email == null || email.isBlank()) {
            return;
        }

        LocalDateTime aDayAgo = LocalDateTime.now().minusDays(1);
        List<LocalDateTime> requests = requestsPerEmail.computeIfAbsent(email, key -> new ArrayList<>());
        requests.removeIf(time -> time.isBefore(aDayAgo));

        if (requests.size() >= maxEmailPerDay) {
            throw new ResponseStatusException(
                    HttpStatus.TOO_MANY_REQUESTS,
                    "Limite diario de emails atingido. Tente novamente amanha."
            );
        }

        requests.add(LocalDateTime.now());
    }

    private void activateUser(AppUser user) {
        user.setStatus(UserStatus.ATIVO);
        user.setEnabled(true);
        user.setUpdatedAt(LocalDateTime.now());
        userRepo.save(user);
        accountSyncService.syncUser(user);
    }

    private UserStatus resolveStatus(AppUser user) {
        if (user.getStatus() != null) {
            return user.getStatus();
        }
        return Boolean.TRUE.equals(user.getEnabled()) ? UserStatus.ATIVO : UserStatus.PENDENTE_REVISAO;
    }

    private ResponseStatusException buildStatusException(UserStatus status) {
        return switch (status) {
            case PENDENTE_VERIFICACAO -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta pendente de verificacao por email.");
            case PENDENTE_REVISAO -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta pendente de verificacao pela equipa.");
            case INATIVO -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta inactiva. Contacte um administrador.");
            case ATIVO -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Conta indisponivel.");
        };
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        String normalized = email.trim().toLowerCase(Locale.ROOT);
        return normalized.isBlank() ? null : normalized;
    }

    private String normalizeCode(String code) {
        try {
            String cleanCode = code == null ? "" : code.replaceAll("[^0-9]", "");
            return String.format("%06d", Integer.parseInt(cleanCode));
        } catch (NumberFormatException ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Codigo invalido");
        }
    }
}
