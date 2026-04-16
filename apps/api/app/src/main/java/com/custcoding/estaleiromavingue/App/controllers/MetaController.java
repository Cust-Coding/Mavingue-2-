package com.custcoding.estaleiromavingue.App.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/meta")
public class MetaController {

    public record SexoOption(String code, String label) {}

    @GetMapping("/sexos")
    public List<SexoOption> sexos() {
        return List.of(
                new SexoOption("HOMEM", "Homem"),
                new SexoOption("MULHER", "Mulher")
        );
    }
}