package com.custcoding.estaleiromavingue.App.auth;

import com.custcoding.estaleiromavingue.App.auth.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

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
    public LoginResponse register(@Valid @RequestBody RegisterClientRequest req) {
        return service.registerClient(req);
    }
}