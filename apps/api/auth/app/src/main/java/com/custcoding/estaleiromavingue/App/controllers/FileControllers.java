package com.custcoding.estaleiromavingue.App.controllers;


import com.custcoding.estaleiromavingue.App.services.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileControllers {

    private final CloudinaryService cloudinary;

    @PostMapping("/upload")
    public ResponseEntity<String> upload(@RequestParam("file") MultipartFile file) {
        try{
            String folder = "products_upload";
            String url = cloudinary.uploadFile(file, folder);
            return ResponseEntity.ok("Upload Realizado com sucesso! URL: " + url);
        }catch (IOException e){
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Falha no Upload: " + e.getMessage());
        }

    }
}
