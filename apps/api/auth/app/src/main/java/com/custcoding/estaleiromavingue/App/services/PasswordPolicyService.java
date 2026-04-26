package com.custcoding.estaleiromavingue.App.services;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PasswordPolicyService {

    public void validatePublicPassword(String password) {
        String value = password == null ? "" : password.trim();

        if (value.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha e obrigatoria");
        }
        if (value.length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha deve ter pelo menos 6 caracteres");
        }
        if (!value.matches(".*[A-Za-z].*") || !value.matches(".*\\d.*")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use pelo menos uma letra e um numero na senha");
        }
    }

    public void validateInternalPassword(String password) {
        validatePublicPassword(password);
    }

    public void validateManagedClientPassword(String password) {
        String value = password == null ? "" : password.trim();
        if (value.length() < 4) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A senha deve ter pelo menos 4 caracteres");
        }
    }
}
