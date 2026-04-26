package com.custcoding.estaleiromavingue.App.common;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> illegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new ApiError(messageOrDefault(e.getMessage(), "Pedido invalido"), 400, Instant.now()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException e) {
        LinkedHashMap<String, String> fieldErrors = new LinkedHashMap<>();
        e.getBindingResult().getFieldErrors().forEach(error ->
                fieldErrors.putIfAbsent(error.getField(), messageOrDefault(error.getDefaultMessage(), "Campo invalido"))
        );

        return ResponseEntity.badRequest().body(new ApiError(
                "Corrija os campos assinalados.",
                400,
                Instant.now(),
                fieldErrors
        ));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiError> constraintViolation(ConstraintViolationException e) {
        LinkedHashMap<String, String> fieldErrors = new LinkedHashMap<>();
        e.getConstraintViolations().forEach(violation -> {
            String path = violation.getPropertyPath() == null ? "campo" : violation.getPropertyPath().toString();
            String field = path.contains(".") ? path.substring(path.lastIndexOf('.') + 1) : path;
            fieldErrors.putIfAbsent(field, messageOrDefault(violation.getMessage(), "Campo invalido"));
        });

        return ResponseEntity.badRequest().body(new ApiError(
                "Corrija os campos assinalados.",
                400,
                Instant.now(),
                fieldErrors
        ));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> notFound(EntityNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiError(messageOrDefault(e.getMessage(), "Recurso nao encontrado"), HttpStatus.NOT_FOUND.value(), Instant.now()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> responseStatus(ResponseStatusException e) {
        String msg = messageOrDefault(e.getReason(), "Falha ao processar a requisicao");
        return ResponseEntity.status(e.getStatusCode())
                .body(new ApiError(msg, e.getStatusCode().value(), Instant.now()));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> dataIntegrity(DataIntegrityViolationException e) {
        String raw = e.getMostSpecificCause() == null ? "" : e.getMostSpecificCause().getMessage();
        String lower = raw.toLowerCase(Locale.ROOT);

        Map<String, String> fieldErrors = new LinkedHashMap<>();
        String msg = "Operacao rejeitada por conflito de dados.";

        if (lower.contains("app_user") && lower.contains("email")) {
            fieldErrors.put("email", "Ja existe uma conta com este email.");
            msg = "Ja existe uma conta com este email.";
        } else if (lower.contains("app_user") && lower.contains("phone")) {
            fieldErrors.put("telefone", "Ja existe uma conta com este numero de telefone.");
            msg = "Ja existe uma conta com este numero de telefone.";
        } else if (lower.contains("t_customer_product") && lower.contains("email")) {
            fieldErrors.put("email", "Ja existe um cadastro com este email.");
            msg = "Ja existe um cadastro com este email.";
        } else if (lower.contains("t_customer_product") && lower.contains("phone")) {
            fieldErrors.put("telefone", "Ja existe um cadastro com este numero de telefone.");
            msg = "Ja existe um cadastro com este numero de telefone.";
        } else if (lower.contains("customer_water") && lower.contains("email")) {
            fieldErrors.put("email", "Ja existe um registo de agua com este email.");
            msg = "Ja existe um registo de agua com este email.";
        } else if (lower.contains("customer_water") && lower.contains("phone")) {
            fieldErrors.put("phone", "Ja existe um registo de agua com este numero de telefone.");
            msg = "Ja existe um registo de agua com este numero de telefone.";
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ApiError(msg, HttpStatus.BAD_REQUEST.value(), Instant.now(), fieldErrors));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> generic(Exception e) {
        return ResponseEntity.internalServerError()
                .body(new ApiError("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value(), Instant.now()));
    }

    private String messageOrDefault(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
