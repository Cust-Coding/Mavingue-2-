package com.custcoding.estaleiromavingue.App.controllers;

import com.resend.Resend;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class EmailValidationController {

    private final Resend resend;
    private final String from;


    public EmailValidationController(
            Resend resend ,
            @Value("${EMAIL_FROM:Acme <onboarding@resend.dev>}") String from
    ){
        this.resend = resend;
        this.from = from;

    }

    @PostMapping("/send")
    public ResponseEntity<?> sendEmail(@RequestBody Map<String, String> body) {
        String to = body.get("to");
        String subject = body.get("subject");
        String message = body.get("message");

        if (to == null || subject == null || message == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Missing required fields: to, subject, message"));
        }

        try {
            var params = CreateEmailOptions.builder()
                    .from(from)
                    .to(to)
                    .subject(subject)
                    .html("<p>" + message + "</p>")
                    .build();

            var response = resend.emails().send(params);
            return ResponseEntity.ok(Map.of("success", true, "id", response.getId()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }

    }


    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException exception) {
        Map<String, String> errors = new HashMap<>();
        exception.getBindingResult().getAllErrors().forEach(error -> {
            var fieldName = ((FieldError) error).getField();
            var errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
}
