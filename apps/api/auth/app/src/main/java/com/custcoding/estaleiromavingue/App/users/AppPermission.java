package com.custcoding.estaleiromavingue.App.users;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

public enum AppPermission {
    USERS_VIEW("users.view", "Utilizadores", "Ver utilizadores registados"),
    USERS_MANAGE("users.manage", "Utilizadores", "Criar e editar contas de utilizadores"),
    USERS_VERIFY("users.verify", "Utilizadores", "Verificar e activar contas pendentes"),
    USERS_RESET_PASSWORD("users.reset-password", "Utilizadores", "Resetar senha de outros utilizadores"),
    USERS_PERMISSIONS_MANAGE("users.permissions.manage", "Permissoes", "Gerir permissoes individuais"),

    CUSTOMERS_VIEW("customers.view", "Cadastros", "Ver pessoas e clientes registados"),
    CUSTOMERS_MANAGE("customers.manage", "Cadastros", "Criar, editar e sincronizar pessoas e clientes"),

    WATER_OVERVIEW("water.overview", "Agua", "Ver o resumo do modulo de agua"),
    WATER_REQUESTS_REVIEW("water.requests.review", "Agua", "Aprovar ou rejeitar solicitacoes de agua"),
    WATER_CUSTOMERS_VIEW("water.customers.view", "Agua", "Ver clientes e contas de agua"),
    WATER_CUSTOMERS_MANAGE("water.customers.manage", "Agua", "Criar e sincronizar contas de agua"),
    WATER_CONTRACTS_MANAGE("water.contracts.manage", "Agua", "Criar e actualizar ligacoes de agua"),
    WATER_READINGS_MANAGE("water.readings.manage", "Agua", "Registar leituras de agua"),
    WATER_BILLS_MANAGE("water.bills.manage", "Agua", "Gerir facturas e pagamentos de agua");

    private final String key;
    private final String group;
    private final String description;

    AppPermission(String key, String group, String description) {
        this.key = key;
        this.group = group;
        this.description = description;
    }

    public String getKey() {
        return key;
    }

    public String getGroup() {
        return group;
    }

    public String getDescription() {
        return description;
    }

    public static AppPermission fromKey(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Permissao invalida");
        }

        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return Arrays.stream(values())
                .filter(permission -> permission.key.equalsIgnoreCase(normalized) || permission.name().equalsIgnoreCase(normalized))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Permissao invalida: " + value));
    }

    public static Set<AppPermission> allPermissions() {
        return new LinkedHashSet<>(Arrays.asList(values()));
    }

    public static Set<AppPermission> defaultForRole(Role role) {
        LinkedHashSet<AppPermission> defaults = new LinkedHashSet<>();

        if (role == null) {
            return defaults;
        }

        if (role == Role.ADMIN) {
            defaults.addAll(allPermissions());
            return defaults;
        }

        if (role == Role.FUNCIONARIO) {
            defaults.add(USERS_VIEW);
            defaults.add(USERS_MANAGE);
            defaults.add(USERS_VERIFY);
            defaults.add(CUSTOMERS_VIEW);
            defaults.add(CUSTOMERS_MANAGE);
            defaults.add(WATER_OVERVIEW);
            defaults.add(WATER_REQUESTS_REVIEW);
            defaults.add(WATER_CUSTOMERS_VIEW);
            defaults.add(WATER_CUSTOMERS_MANAGE);
            defaults.add(WATER_CONTRACTS_MANAGE);
            defaults.add(WATER_READINGS_MANAGE);
            defaults.add(WATER_BILLS_MANAGE);
        }

        return defaults;
    }
}
