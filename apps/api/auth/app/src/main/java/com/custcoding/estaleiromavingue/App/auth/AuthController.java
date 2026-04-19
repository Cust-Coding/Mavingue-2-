package com.custcoding.estaleiromavingue.App.auth;

import com.custcoding.estaleiromavingue.App.auth.dto.*;
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
    public ResponseEntity<String> register(@Valid @RequestBody RegisterClientRequest req) {
        service.registerClient(req);
        return ResponseEntity.ok("Verifique o seu email para ativar a conta");
    }

    @GetMapping("/email/verify/{userId}/{token}")
    public ResponseEntity<String> verify (
            @PathVariable Long userId,
            @PathVariable String token){
        service.verifyAccount(userId, token);
        return ResponseEntity.ok("Conta Activada com Sucesso");
    }

    @PostMapping("/verify-code")
    public ResponseEntity<String> verifyCode(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String code = body.get("code");
        if (email == null || code == null) {
            return ResponseEntity.badRequest().body("Email e código são obrigatórios");
        }
        service.verifyAccountByCode(email, code);
        return ResponseEntity.ok("Conta ativada com sucesso");
    }

    @PostMapping("/resend-token")
    public ResponseEntity<String> resendToken(@RequestBody Map<String, String> body) {
        service.resendVerificationToken(body.get("email"));
        return ResponseEntity.ok("Email de verificação reenviado.");
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ){
        service.requestPasswordReset(request);
        return ResponseEntity.ok("Email de Redifinição enviado");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ){
        service.resetPassword(request);
        return ResponseEntity.ok("Senha redefinida com sucesso");
    }
}