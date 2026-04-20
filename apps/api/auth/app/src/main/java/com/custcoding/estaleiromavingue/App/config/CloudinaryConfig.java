package com.custcoding.estaleiromavingue.App.config;


import com.cloudinary.Cloudinary;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;


@Configuration
public class CloudinaryConfig {


    private static final Logger log = LoggerFactory.getLogger(CloudinaryConfig.class);


    @Value("${cloudinary.url}")
    private String cloudinaryUrl;


    @Bean
    public Cloudinary cloudinary(){
        String logUrl = cloudinaryUrl.length() > 15
                ? cloudinaryUrl.substring(0,15) + "..."
                : cloudinaryUrl.substring(0, Math.min(cloudinaryUrl.length(),10)) + "...";
        log.info("Configurando Cloudinary com Url: {}", logUrl);
        return new Cloudinary(cloudinaryUrl);
    }


}
