package progra4.bolsabe.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration}") long expirationMs) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String usuario, String rol, String nombre, String id) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("rol",    rol);
        claims.put("nombre", nombre);
        claims.put("id",     id);

        return Jwts.builder()
                .claims(claims)
                .subject(usuario)        // subject DESPUÉS de claims
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(secretKey)
                .compact();
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractUsuario(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractRol(String token) {
        return (String) extractAllClaims(token).get("rol");
    }

    public String extractNombre(String token) {
        return (String) extractAllClaims(token).get("nombre");
    }

    public String extractId(String token) {
        return (String) extractAllClaims(token).get("id");
    }

    public boolean isValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}