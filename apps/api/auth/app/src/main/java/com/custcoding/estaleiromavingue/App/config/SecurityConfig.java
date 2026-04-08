package com.custcoding.estaleiromavingue.App.config;

import com.custcoding.estaleiromavingue.App.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth


                        .requestMatchers("/swagger-ui/index.html").permitAll()
                        // --------------------
                        // AUTH (PÚBLICO)
                        // --------------------
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/auth/register").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/api/auth/me").authenticated()

                        // --------------------89
                        // PÚBLICO (sem login)
                        // --------------------
                        // Catálogo
                        .requestMatchers(HttpMethod.GET, "/api/products/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/ferragem/**").permitAll()

                        // Meta (ex: sexos) - público para cadastro
                        .requestMatchers(HttpMethod.GET, "/api/meta/**").permitAll()

                        // Cadastro de cliente restrito a admin/funcionario (aceita / e sem /)
                        .requestMatchers(HttpMethod.POST,
                                "/api/customer",
                                "/api/customer/",
                                "/api/customer/**"
                        ).hasAnyRole("ADMIN", "FUNCIONARIO")

                        // --------------------
                        // USERS (ADMIN)
                        // --------------------
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // --------------------
                        // PRODUCTS
                        // --------------------
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                        // GET já está permitAll acima

                        // --------------------
                        // CLIENTES (admin/staff lê; admin altera/apaga)
                        // --------------------
                        .requestMatchers(HttpMethod.GET, "/api/customer/**").hasAnyRole("ADMIN", "FUNCIONARIO")
                        .requestMatchers(HttpMethod.PUT, "/api/customer/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/customer/**").hasRole("ADMIN")

                        // --------------------
                        // STOCK / VENDAS / COMPRAS (admin ou funcionário)
                        // --------------------
                        .requestMatchers("/api/stock/**").hasAnyRole("ADMIN", "FUNCIONARIO")
                        .requestMatchers("/api/vendas/**").hasAnyRole("ADMIN", "FUNCIONARIO")
                        .requestMatchers("/api/facturas-compra/**").hasAnyRole("ADMIN", "FUNCIONARIO")
                        .requestMatchers("/api/customer-water/**").hasAnyRole("ADMIN", "FUNCIONARIO")
                        .requestMatchers("/api/ligacoes-agua/**").hasAnyRole("ADMIN", "FUNCIONARIO")
                        .requestMatchers("/api/leituras-agua/**").hasAnyRole("ADMIN", "FUNCIONARIO")

                        // Endereços: admin/staff
                        .requestMatchers("/api/address/**").hasAnyRole("ADMIN", "FUNCIONARIO")

                        // Ferragem: escrever só admin (GET já é público)
                        .requestMatchers(HttpMethod.POST, "/api/ferragem/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/ferragem/**").hasRole("ADMIN")

                        // --------------------
                        // Default
                        // --------------------


                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
