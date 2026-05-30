package progra4.bolsabe.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * JwtFilter: se ejecuta UNA VEZ por request.
 *
 * Flujo:
 *  1. Lee el header "Authorization: Bearer <token>"
 *  2. Si no hay token → deja pasar (Spring Security decide si el endpoint es público)
 *  3. Si hay token → valida, extrae claims y carga la autenticación en el SecurityContext
 *
 * El rol del token se convierte a GrantedAuthority con prefijo "ROLE_"
 * para que @PreAuthorize("hasRole('ADMIN')") funcione correctamente.
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        // Si no viene el header o no empieza con "Bearer ", continuar sin autenticar
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7); // quitar "Bearer "

        // Si el token no es válido, continuar sin autenticar (Spring Security rechazará si el endpoint es protegido)
        if (!jwtUtil.isValid(token)) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extraer claims del token
        Claims claims = jwtUtil.extractAllClaims(token);
        String usuario = claims.getSubject();
        String rol     = (String) claims.get("rol");

        // Construir la autenticación de Spring Security con el rol
        // El prefijo ROLE_ es requerido por Spring Security para hasRole()
        var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + rol));

        var authentication = new UsernamePasswordAuthenticationToken(
                usuario,   // principal (quién es)
                null,      // credentials (no necesitamos la clave aquí)
                authorities
        );

        // Cargar en el contexto de seguridad para este request
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}