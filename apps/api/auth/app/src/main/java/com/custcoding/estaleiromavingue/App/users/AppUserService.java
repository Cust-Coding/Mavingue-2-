package com.custcoding.estaleiromavingue.App.users;

import com.custcoding.estaleiromavingue.App.models.Adress;
import com.custcoding.estaleiromavingue.App.models.CustomerProduct;
import com.custcoding.estaleiromavingue.App.models.CustomerWater;
import com.custcoding.estaleiromavingue.App.models.UserProfile;
import com.custcoding.estaleiromavingue.App.models.status.EstadoServicoAgua;
import com.custcoding.estaleiromavingue.App.models.status.Sexo;
import com.custcoding.estaleiromavingue.App.repositories.AdressRepository;
import com.custcoding.estaleiromavingue.App.repositories.CustomerRepository;
import com.custcoding.estaleiromavingue.App.repositories.CustomerWaterRepository;
import com.custcoding.estaleiromavingue.App.repositories.UserProfileRepository;
import com.custcoding.estaleiromavingue.App.services.AccountSyncService;
import com.custcoding.estaleiromavingue.App.services.PasswordPolicyService;
import com.custcoding.estaleiromavingue.App.services.PermissionService;
import com.custcoding.estaleiromavingue.App.services.PhoneNumberService;
import com.custcoding.estaleiromavingue.App.users.dto.UserCreateFullRequest;
import com.custcoding.estaleiromavingue.App.users.dto.UserPasswordResetRequest;
import com.custcoding.estaleiromavingue.App.users.dto.UserPermissionDefinitionResponse;
import com.custcoding.estaleiromavingue.App.users.dto.UserPermissionUpdateRequest;
import com.custcoding.estaleiromavingue.App.users.dto.UserResponse;
import com.custcoding.estaleiromavingue.App.users.dto.UserStatusUpdateRequest;
import com.custcoding.estaleiromavingue.App.users.dto.UserUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AppUserService {

    private final AppUserRepository repo;
    private final UserProfileRepository profileRepo;
    private final CustomerRepository customerRepository;
    private final CustomerWaterRepository customerWaterRepository;
    private final AdressRepository adressRepository;
    private final PasswordEncoder encoder;
    private final PhoneNumberService phoneNumberService;
    private final AccountSyncService accountSyncService;
    private final PermissionService permissionService;
    private final PasswordPolicyService passwordPolicyService;

    @Transactional(readOnly = true)
    public List<UserResponse> list() {
        return repo.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> listPending() {
        return repo.findAll().stream()
                .filter(user -> resolveStatus(user) != UserStatus.ATIVO)
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse get(Long id) {
        return toResponse(findUser(id));
    }

    @Transactional
    public UserResponse createFull(UserCreateFullRequest req, String creatorIdFromJwt) {
        AppUser creator = getCreator(creatorIdFromJwt);
        Role creatorRole = creator.getRole();

        if (creatorRole == Role.CLIENTE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Cliente nao pode criar utilizadores");
        }
        if (creatorRole == Role.FUNCIONARIO && req.role() == Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Funcionario nao pode criar administradores");
        }

        String normalizedEmail = normalizeEmail(req.email());
        String normalizedPhone = phoneNumberService.normalizeRequired(req.telefone());
        validateManagedUser(req, normalizedEmail, normalizedPhone);

        AppUser user = AppUser.builder()
                .nome(req.nome().trim())
                .email(normalizedEmail)
                .phone(normalizedPhone)
                .passwordHash(encoder.encode(resolveManagedPassword(req)))
                .role(req.role())
                .status(UserStatus.ATIVO)
                .enabled(true)
                .permissions(new LinkedHashSet<>(AppPermission.defaultForRole(req.role())))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        user = repo.save(user);
        upsertUserProfile(user, req, normalizedPhone);

        if (req.role() == Role.CLIENTE) {
            CustomerProduct customer = upsertCustomerProfile(user, req, normalizedEmail, normalizedPhone, Boolean.TRUE.equals(req.elegivelConta()) || req.criarContaAgua() == null || Boolean.TRUE.equals(req.criarContaAgua()));
            if (Boolean.TRUE.equals(req.criarContaAgua())) {
                upsertWaterAccount(user, customer, req);
            }
            accountSyncService.syncUser(user);
        }

        return toResponse(user);
    }

    @Transactional
    public UserResponse update(Long id, UserUpdateRequest req) {
        AppUser user = findUser(id);

        if (req.nome() != null && !req.nome().isBlank()) {
            user.setNome(req.nome().trim());
        }

        if (req.email() != null) {
            String normalizedEmail = normalizeEmail(req.email());
            if (normalizedEmail != null && !normalizedEmail.equalsIgnoreCase(user.getEmail())) {
                ensureEmailAvailable(normalizedEmail, user.getId());
                user.setEmail(normalizedEmail);
            }
            if (req.email().isBlank()) {
                user.setEmail(null);
            }
        }

        if (req.phone() != null && !req.phone().isBlank()) {
            String normalizedPhone = phoneNumberService.normalizeRequired(req.phone());
            ensurePhoneAvailable(normalizedPhone, user.getId());
            user.setPhone(normalizedPhone);
        }

        if (req.password() != null && !req.password().isBlank()) {
            passwordPolicyService.validateManagedClientPassword(req.password());
            user.setPasswordHash(encoder.encode(req.password().trim()));
        }

        if (req.role() != null) {
            Role currentRole = user.getRole();
            user.setRole(req.role());
            if (req.role() == Role.ADMIN) {
                user.setPermissions(new LinkedHashSet<>(AppPermission.allPermissions()));
            } else if (currentRole != req.role()) {
                user.setPermissions(new LinkedHashSet<>(AppPermission.defaultForRole(req.role())));
            } else if (user.getPermissions() == null || user.getPermissions().isEmpty()) {
                user.setPermissions(new LinkedHashSet<>(AppPermission.defaultForRole(req.role())));
            }
        }

        if (req.status() != null) {
            applyStatus(user, req.status());
        }

        user.setUpdatedAt(LocalDateTime.now());
        AppUser saved = repo.save(user);
        accountSyncService.syncUser(saved);
        return toResponse(saved);
    }

    @Transactional
    public UserResponse updateStatus(Long id, UserStatusUpdateRequest req) {
        AppUser user = findUser(id);
        applyStatus(user, req.status());
        user.setUpdatedAt(LocalDateTime.now());
        AppUser saved = repo.save(user);
        accountSyncService.syncUser(saved);
        return toResponse(saved);
    }

    @Transactional
    public UserResponse resetPassword(Long id, UserPasswordResetRequest req) {
        AppUser user = findUser(id);
        String nextPassword = req == null || req.newPassword() == null || req.newPassword().isBlank()
                ? "1234"
                : req.newPassword().trim();

        passwordPolicyService.validateManagedClientPassword(nextPassword);

        user.setPasswordHash(encoder.encode(nextPassword));
        user.setUpdatedAt(LocalDateTime.now());
        return toResponse(repo.save(user));
    }

    @Transactional(readOnly = true)
    public List<UserPermissionDefinitionResponse> permissionCatalog() {
        return AppPermission.allPermissions().stream()
                .map(permission -> new UserPermissionDefinitionResponse(
                        permission.getKey(),
                        permission.getGroup(),
                        permission.getDescription()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public Set<String> userPermissions(Long id) {
        AppUser user = findUser(id);
        return permissionService.effectivePermissionKeys(user);
    }

    @Transactional
    public UserResponse updatePermissions(Long id, UserPermissionUpdateRequest req) {
        AppUser user = findUser(id);

        if (user.getRole() != Role.FUNCIONARIO) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "As permissoes individuais so podem ser atribuidas a funcionarios");
        }

        Set<AppPermission> permissions = new LinkedHashSet<>();
        if (req != null && req.permissions() != null) {
            for (String permissionKey : req.permissions()) {
                permissions.add(AppPermission.fromKey(permissionKey));
            }
        }

        user.setPermissions(permissions);
        user.setUpdatedAt(LocalDateTime.now());
        return toResponse(repo.save(user));
    }

    @Transactional
    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizador nao encontrado");
        }
        repo.deleteById(id);
    }

    private void validateManagedUser(UserCreateFullRequest req, String normalizedEmail, String normalizedPhone) {
        if (req.role() != Role.CLIENTE && normalizedEmail == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email e obrigatorio para contas internas");
        }

        if (normalizedEmail != null) {
            ensureEmailAvailable(normalizedEmail, null);
        }
        ensurePhoneAvailable(normalizedPhone, null);

        if (req.role() != Role.CLIENTE) {
            passwordPolicyService.validateInternalPassword(req.password());
        }
    }

    private String resolveManagedPassword(UserCreateFullRequest req) {
        if (req.role() == Role.CLIENTE) {
            String customPassword = req.password() == null ? "" : req.password().trim();
            if (customPassword.isBlank()) {
                return "1234";
            }
            passwordPolicyService.validateManagedClientPassword(customPassword);
            return customPassword;
        }

        return req.password().trim();
    }

    private void ensureEmailAvailable(String email, Long currentUserId) {
        if (email == null) {
            return;
        }

        repo.findByEmail(email).ifPresent(existing -> {
            if (currentUserId == null || !existing.getId().equals(currentUserId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ja existe uma conta com este email");
            }
        });
    }

    private void ensurePhoneAvailable(String phone, Long currentUserId) {
        repo.findByPhone(phone).ifPresent(existing -> {
            if (currentUserId == null || !existing.getId().equals(currentUserId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ja existe uma conta com este numero de telefone");
            }
        });
    }

    private void upsertUserProfile(AppUser user, UserCreateFullRequest req, String normalizedPhone) {
        UserProfile profile = profileRepo.findByUser_Id(user.getId()).orElseGet(UserProfile::new);
        profile.setUser(user);
        profile.setSexo(req.sexo());
        profile.setTelefone(normalizedPhone);
        profile.setDataNascimento(req.dataNascimento());
        profile.setProvincia(req.provincia().trim());
        profile.setCidade(req.cidade().trim());
        profile.setBairro(req.bairro().trim());
        profileRepo.save(profile);
    }

    private CustomerProduct upsertCustomerProfile(AppUser user, UserCreateFullRequest req, String normalizedEmail, String normalizedPhone, boolean eligibleForAccount) {
        CustomerProduct customer = customerRepository.findByAppUser_Id(user.getId())
                .or(() -> customerRepository.findByPhone(normalizedPhone))
                .or(() -> normalizedEmail == null ? java.util.Optional.empty() : customerRepository.findByEmail(normalizedEmail))
                .orElseGet(CustomerProduct::new);

        customer.setName(req.nome().trim());
        customer.setSex(Sexo.valueOf(req.sexo().trim().toUpperCase(Locale.ROOT)));
        customer.setPhone(normalizedPhone);
        customer.setEmail(normalizedEmail);
        customer.setBirthDate(req.dataNascimento());
        customer.setProvincia(req.provincia().trim());
        customer.setCidade(req.cidade().trim());
        customer.setBairro(req.bairro().trim());
        customer.setAppUser(user);
        customer.setContaActiva(Boolean.TRUE);
        customer.setElegivelConta(eligibleForAccount);
        customer.setObservacoes("Conta criada e sincronizada pela equipa.");
        return customerRepository.save(customer);
    }

    private void upsertWaterAccount(AppUser user, CustomerProduct customer, UserCreateFullRequest req) {
        CustomerWater water = new CustomerWater();

        water.setName(customer.getName());
        water.setPhone(customer.getPhone());
        water.setEmail(customer.getEmail());
        water.setCustomer(customer);
        water.setAppUser(user);
        water.setReferenciaLocal(req.referenciaLocal() == null || req.referenciaLocal().isBlank()
                ? "Conta de agua criada pela equipa"
                : req.referenciaLocal().trim());
        water.setHouseNR(req.houseNR() == null || req.houseNR().isBlank() ? null : req.houseNR().trim());
        water.setAdressId(resolveAdress(req.adressId()));
        water.setEstado((water.getHouseNR() == null || water.getAdressId() == null)
                ? EstadoServicoAgua.AGUARDANDO_DADOS_CASA
                : EstadoServicoAgua.ATIVO);
        water.setPedidoAgua(Boolean.TRUE);
        water.setActivo(water.getEstado() == EstadoServicoAgua.ATIVO);
        water.setObservacoes("Conta de agua associada ao cliente pela equipa.");
        water.setUpdated(LocalDateTime.now());
        customerWaterRepository.save(water);

        customer.setTemServicoAgua(Boolean.TRUE);
        customerRepository.save(customer);
    }

    private Adress resolveAdress(Long adressId) {
        if (adressId == null) {
            return null;
        }
        return adressRepository.findById(adressId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Endereco nao encontrado"));
    }

    private void applyStatus(AppUser user, UserStatus status) {
        user.setStatus(status);
        user.setEnabled(status == UserStatus.ATIVO);
    }

    private AppUser findUser(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizador nao encontrado"));
    }

    private AppUser getCreator(String creatorIdFromJwt) {
        Long id;
        try {
            id = Long.parseLong(creatorIdFromJwt);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token invalido");
        }
        return repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilizador autenticado nao encontrado"));
    }

    private UserStatus resolveStatus(AppUser user) {
        if (user.getStatus() != null) {
            return user.getStatus();
        }
        return Boolean.TRUE.equals(user.getEnabled()) ? UserStatus.ATIVO : UserStatus.PENDENTE_REVISAO;
    }

    private String normalizeEmail(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return normalized.isBlank() ? null : normalized;
    }

    private UserResponse toResponse(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getNome(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                resolveStatus(user),
                permissionService.effectivePermissionKeys(user)
        );
    }
}
