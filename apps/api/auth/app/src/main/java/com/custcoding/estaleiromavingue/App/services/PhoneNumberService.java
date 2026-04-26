package com.custcoding.estaleiromavingue.App.services;

import org.springframework.stereotype.Service;

@Service
public class PhoneNumberService {

    public String normalizeRequired(String value) {
        String normalized = normalize(value);
        if (normalized == null) {
            throw new IllegalArgumentException("Numero de telefone invalido");
        }
        return normalized;
    }

    public String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        String digits = value.replaceAll("\\D", "");

        if (digits.length() == 9 && digits.startsWith("8")) {
            return "+258" + digits;
        }

        if (digits.length() == 12 && digits.startsWith("2588")) {
            return "+" + digits;
        }

        return null;
    }

    public boolean isValid(String value) {
        return normalize(value) != null;
    }
}
