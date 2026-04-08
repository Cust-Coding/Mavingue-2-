package com.custcoding.estaleiromavingue.App.services;


import lombok.AllArgsConstructor;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;


@Service
public class EmailValidatorService {


    @Value("${resend.api.key}")
    private String apiKey;

    @Value("${email.from}")
    private String from;

    private final OkHttpClient client = new OkHttpClient();

    public void sendVerificationEmail(String toEmail, String verificationUrl){
        String body = """
                {
                    "from" : "%s",
                    "to" : "%s",
                    "subject", "Confirme o seu email",
                    "html": "<p>Clique no link para activar a sua conta:</p><a href='%s'>%s</a>",
                
                }
                """.formatted(from, toEmail, verificationUrl, verificationUrl);

        Request request = new Request.Builder()
                .url("https://api.resend.com/emails")
                .header("Authorization", "Bearer " + apiKey)
                .header("Content-Type", "application/json")
                .post(RequestBody.create(body, MediaType.parse("application/json")))
                .build();

        try(Response response = client.newCall(request).execute()){
            if(!response.isSuccessful()){
                throw new RuntimeException("Erro ao enviar email: " + response.body().string()) ;
            }

        } catch (IOException e) {
            throw new RuntimeException("Falha ao conectar ao Resend API "+ e);
        }
    }



}
