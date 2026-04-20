package com.custcoding.estaleiromavingue.App.services;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final FileValidationService fileValidation;
    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file , String  folderName) throws IOException {
        fileValidation.validateImage(file);

        File tempFile = convertMultiPartToFile(file);

        try {

            Map<?, ?> uploadResult = cloudinary.uploader().upload(tempFile, ObjectUtils.asMap(
                    "folder", folderName,
                    "resource_type", "image"
            ));
            return uploadResult.get("secure_url").toString();
        }finally {
            if (tempFile.exists()){
                tempFile.delete();
            }
        }
    }

    private File convertMultiPartToFile(MultipartFile file) throws IOException {
        String fileName = System.currentTimeMillis() + "_" + Objects.requireNonNull(file.getOriginalFilename());
        File convFile = new File(System.getProperty("java.io.tmpdir"), fileName);
        try (FileOutputStream fos = new FileOutputStream(convFile)) {
            fos.write(file.getBytes());
        }
        return convFile;
    }

}
