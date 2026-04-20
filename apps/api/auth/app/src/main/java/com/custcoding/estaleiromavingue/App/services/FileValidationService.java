package com.custcoding.estaleiromavingue.App.services;


import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.util.Arrays;
import java.util.List;

@Service
public class FileValidationService {


    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/bmp",
            "image/webp",
            "image/svg+xml"
    );


    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"
    );

    public void validateImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Arquivo vazio ou não enviado");
        }


        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Arquivo muito grande. Máximo: 5MB");
        }

        String mimeType = file.getContentType();
        if (mimeType == null || !ALLOWED_MIME_TYPES.contains(mimeType)) {
            throw new IllegalArgumentException(
                    "Formato inválido! Apenas imagens: " + String.join(", ", ALLOWED_MIME_TYPES)
            );
        }


        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !hasAllowedExtension(originalFilename)) {
            throw new IllegalArgumentException("Extensão de arquivo inválida");
        }
    }

    private boolean hasAllowedExtension(String filename) {
        String extension = getFileExtension(filename).toLowerCase();
        return ALLOWED_EXTENSIONS.contains(extension);
    }

    private String getFileExtension(String filename) {
        int lastDot = filename.lastIndexOf(".");
        return lastDot > 0 ? filename.substring(lastDot + 1) : "";
    }
}