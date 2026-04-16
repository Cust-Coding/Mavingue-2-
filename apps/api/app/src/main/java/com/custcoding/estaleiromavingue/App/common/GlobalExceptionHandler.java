package com.custcoding.estaleiromavingue.App.common;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> illegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new ApiError(e.getMessage(), 400, Instant.now()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> validation(MethodArgumentNotValidException e) {
        String msg = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .orElse("Validation error");
        return ResponseEntity.badRequest().body(new ApiError(msg, 400, Instant.now()));
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiError> notFound(EntityNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ApiError(e.getMessage(), HttpStatus.NOT_FOUND.value(), Instant.now()));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ApiError> responseStatus(ResponseStatusException e) {
        String msg = (e.getReason() != null && !e.getReason().isBlank())
                ? e.getReason()
                : "Falha ao processar a requisicao";
        return ResponseEntity.status(e.getStatusCode())
                .body(new ApiError(msg, e.getStatusCode().value(), Instant.now()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> generic(Exception e) {
        return ResponseEntity.internalServerError()
                .body(new ApiError("Erro interno do servidor", HttpStatus.INTERNAL_SERVER_ERROR.value(), Instant.now()));
    }
}
