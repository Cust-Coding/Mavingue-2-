package com.custcoding.estaleiromavingue.App.auth;

import com.custcoding.estaleiromavingue.App.auth.dto.ForgotPasswordRequest;
import com.custcoding.estaleiromavingue.App.auth.dto.LoginRequest;
import com.custcoding.estaleiromavingue.App.auth.dto.LoginResponse;
import com.custcoding.estaleiromavingue.App.auth.dto.MeResponse;
import com.custcoding.estaleiromavingue.App.auth.dto.RegisterClientRequest;
import com.custcoding.estaleiromavingue.App.auth.dto.ResetPasswordRequest;
import com.custcoding.estaleiromavingue.App.users.UserStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService service;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return service.login(req);
    }

    @GetMapping("/me")
    public MeResponse me(Authentication auth) {
        return service.me(auth.getName());
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, String>> register(@Valid @RequestBody RegisterClientRequest req) {
        UserStatus status = service.registerClient(req);
        String message = status == UserStatus.PENDENTE_VERIFICACAO
                ? "Conta criada. Verifique o seu email para activar a conta."
                : "Conta criada. Aguarde a verificacao da equipa para activar o acesso.";
        return ResponseEntity.ok(Map.of(
                "message", message,
                "status", status.name()
        ));
    }

    @GetMapping("/email/verify/{userId}/{token}")
    public ResponseEntity<String> verify(@PathVariable Long userId, @PathVariable String token) {
        service.verifyAccount(userId, token);
        return ResponseEntity.ok("Conta activada com sucesso");
    }

    @PostMapping("/verify-code")
    public ResponseEntity<String> verifyCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        if (email == null || code == null) {
            return ResponseEntity.badRequest().body("Email e codigo sao obrigatorios");
        }
        service.verifyAccountByCode(email, code);
        return ResponseEntity.ok("Conta activada com sucesso");
    }

    @PostMapping("/resend-token")
    public ResponseEntity<String> resendToken(@RequestBody Map<String, String> body) {
        service.resendVerificationToken(body.get("email"));
        return ResponseEntity.ok("Email de verificacao reenviado");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        service.requestPasswordReset(request);
        return ResponseEntity.ok("Codigo de redefinicao enviado");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        service.resetPassword(request);
        return ResponseEntity.ok("Senha redefinida com sucesso");
    }
}
