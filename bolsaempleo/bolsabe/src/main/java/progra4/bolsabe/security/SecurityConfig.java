package progra4.bolsabe.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import java.util.Arrays;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
            // Desactivamos CSRF (no usamos cookies de sesion, el frontend usa fetch)
            .csrf(AbstractHttpConfigurer::disable)

            // Configuramos CORS para permitir peticiones desde React (puerto 5173)
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
                config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type"));
                return config;
            }))

            // Sin estado: no guardamos sesion en el servidor (preparado para JWT)
            .sessionManagement(sm ->
                sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // AVANCE: todo publico por ahora. En entrega final se restringe por rol.
            .authorizeHttpRequests(auth ->
                auth.anyRequest().permitAll())

            .build();
    }
}
