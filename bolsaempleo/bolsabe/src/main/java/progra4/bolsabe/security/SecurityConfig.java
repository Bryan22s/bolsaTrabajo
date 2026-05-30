package progra4.bolsabe.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.Arrays;
import java.util.List;


@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)

                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration config = new CorsConfiguration();
                    config.setAllowedOrigins(List.of(
                            "http://localhost:5173",
                            "http://localhost:8081"
                    ));
                    config.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE","OPTIONS"));
                    config.setAllowedHeaders(Arrays.asList("Authorization","Content-Type"));
                    config.setExposedHeaders(List.of("Authorization"));
                    return config;
                }))

                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // ── PÚBLICOS ──────────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/api/auth/login").permitAll()
                        .requestMatchers(HttpMethod.POST,   "/api/empresas/registro").permitAll()
                        .requestMatchers(HttpMethod.POST,   "/api/oferentes/registro").permitAll()
                        .requestMatchers(HttpMethod.GET,    "/api/puestos/recientes").permitAll()
                        .requestMatchers(HttpMethod.GET,    "/api/puestos/buscar").permitAll()
                        .requestMatchers(HttpMethod.GET,    "/api/caracteristicas").permitAll()
                        // PDFs de currículos servidos como recursos estáticos
                        .requestMatchers(HttpMethod.GET,    "/curriculos/**").permitAll()

                        // ── SOLO ADMIN ────────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET,    "/api/empresas/pendientes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/empresas/*/aprobar").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/api/oferentes/pendientes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/oferentes/*/aprobar").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/caracteristicas").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/caracteristicas/*").hasRole("ADMIN")

                        // ── EMPRESA ───────────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET,    "/api/puestos/todos").hasRole("EMPRESA")
                        .requestMatchers(HttpMethod.POST,   "/api/puestos").hasRole("EMPRESA")
                        .requestMatchers(HttpMethod.PUT,    "/api/puestos/*/desactivar").hasRole("EMPRESA")
                        .requestMatchers(HttpMethod.GET,    "/api/oferentes/buscar").hasRole("EMPRESA")

                        // ── EMPRESA o ADMIN pueden ver perfil y habilidades del oferente ──
                        .requestMatchers(HttpMethod.GET,    "/api/oferentes/*/habilidades")
                        .hasAnyRole("OFERENTE","EMPRESA","ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/api/oferentes/*")
                        .hasAnyRole("OFERENTE","EMPRESA","ADMIN")

                        // ── SOLO OFERENTE: gestionar sus propias habilidades y CV ──
                        .requestMatchers(HttpMethod.POST,   "/api/oferentes/*/habilidades").hasRole("OFERENTE")
                        .requestMatchers(HttpMethod.DELETE, "/api/oferentes/*/habilidades/*").hasRole("OFERENTE")
                        .requestMatchers(HttpMethod.POST,   "/api/oferentes/*/curriculum").hasRole("OFERENTE")

                        // ── TODO LO DEMÁS requiere autenticación ──────────────────
                        .anyRequest().authenticated()
                )

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}