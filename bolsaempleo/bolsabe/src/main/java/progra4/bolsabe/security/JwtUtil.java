package progra4.bolsabe.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

/**
 * JwtUtil: genera y valida JSON Web Tokens.
 *
 * El token contiene:
 *   - sub   : el "usuario" (correo o "admin")
 *   - rol   : "ADMIN" | "EMPRESA" | "OFERENTE"
 *   - nombre: nombre del usuario
 *   - id    : cédula o cedulaJuridica
 *
 * La clave secreta se configura en application.properties (jwt.secret).
 * La duración se configura con jwt.expiration (en milisegundos).
 */
@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expirationMs;

    // Spring inyecta los valores de application.properties
    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationMs) {

        // La clave debe tener al menos 32 caracteres para HS256
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    /**
     * Genera un token JWT con los datos del usuario.
     *
     * @param usuario  correo o identificador usado para login
     * @param rol      "ADMIN" | "EMPRESA" | "OFERENTE"
     * @param nombre   nombre visible del usuario
     * @param id       cédula o cedulaJuridica
     */
    public String generateToken(String usuario, String rol, String nombre, String id) {
        return Jwts.builder()
                .subject(usuario)
                .claims(Map.of(
                        "rol",    rol,
                        "nombre", nombre,
                        "id",     id
                ))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(secretKey)
                .compact();
    }

    /**
     * Extrae todos los claims del token.
     * Lanza excepción si el token es inválido o expiró.
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /** Extrae el subject (usuario/correo) del token. */
    public String extractUsuario(String token) {
        return extractAllClaims(token).getSubject();
    }

    /** Extrae el rol del token. */
    public String extractRol(String token) {
        return (String) extractAllClaims(token).get("rol");
    }

    /** Extrae el nombre del token. */
    public String extractNombre(String token) {
        return (String) extractAllClaims(token).get("nombre");
    }

    /** Extrae el id (cédula / cedulaJuridica) del token. */
    public String extractId(String token) {
        return (String) extractAllClaims(token).get("id");
    }

    /**
     * Valida que el token sea válido (firma correcta y no expirado).
     * Retorna true si es válido, false si no.
     */
    public boolean isValid(String token) {
        try {
            extractAllClaims(token); // lanza excepción si hay problema
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}