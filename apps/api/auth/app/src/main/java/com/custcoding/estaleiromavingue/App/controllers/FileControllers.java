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
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileControllers {

    private final CloudinaryService cloudinary;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> upload(@RequestParam("file") MultipartFile file) {

        Map<String, Object> response = new HashMap<>();
        try {
            String folder = "products_upload";
            String url = cloudinary.uploadFile(file, folder);
            response.put( "success", true);
            response.put("message", "Upload realizado com sucesso");
            response.put("url", url);

            return ResponseEntity.ok(response);

        }catch (IllegalArgumentException e) {
                response.put("success", false);
                response.put("message", e.getMessage());
                return ResponseEntity.badRequest().body(response);

        }catch (IOException e){
            response.put("message", "Falha no upload: " + e.getMessage());
            response.put("success", false);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);


        }

    }
}
