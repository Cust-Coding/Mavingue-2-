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

    @GetMapping("/verify")
    public ResponseEntity<String> verify (@RequestParam String token){
        service.verifyAccount(token);
        return ResponseEntity.ok("Conta Activada com Sucesso");
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
            @RequestBody ResetPasswordRequest request
    ){
        service.resetPassword(request);
        return ResponseEntity.ok("Senha redefinida com sucesso.");
    }
}