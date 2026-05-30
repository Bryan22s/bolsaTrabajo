package progra4.bolsabe.presentation.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import progra4.bolsabe.data.EmpresaRepository;
import progra4.bolsabe.data.OferenteRepository;
import progra4.bolsabe.logic.Empresa;
import progra4.bolsabe.logic.Oferente;
import progra4.bolsabe.security.JwtUtil;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * AuthController: maneja el login y devuelve un JWT.
 *
 * POST /api/auth/login
 *   Body: { "usuario": "correo@x.com", "clave": "xxxx" }
 *
 *   Response 200: {
 *     "token": "eyJhbGci...",
 *     "rol":    "EMPRESA" | "OFERENTE" | "ADMIN",
 *     "nombre": "Nombre del usuario",
 *     "id":     "cédula o cedulaJuridica"
 *   }
 *
 *   Response 401: credenciales incorrectas
 *   Response 403: cuenta no aprobada
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired EmpresaRepository  empresaRepository;
    @Autowired OferenteRepository oferenteRepository;
    @Autowired JwtUtil             jwtUtil;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> credentials) {

        String usuario = credentials.get("usuario");
        String clave   = credentials.get("clave");

        if (usuario == null || clave == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faltan credenciales");
        }

        // ── 1. ADMINISTRADOR ────────────────────────────────────────────────
        if ("admin".equals(usuario) && "admin123".equals(clave)) {
            String token = jwtUtil.generateToken("admin", "ADMIN", "Administrador", "admin");
            return buildResponse(token, "ADMIN", "Administrador", "admin");
        }

        // ── 2. EMPRESA ──────────────────────────────────────────────────────
        Optional<Empresa> empresaOpt = empresaRepository.findByCorreo(usuario);
        if (empresaOpt.isPresent()) {
            Empresa empresa = empresaOpt.get();

            if (!clave.equals(empresa.getClave())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Clave incorrecta");
            }
            if (!empresa.getAprobada()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Su cuenta no ha sido aprobada aún");
            }

            String token = jwtUtil.generateToken(
                    usuario,
                    "EMPRESA",
                    empresa.getNombre(),
                    empresa.getCedulaJuridica()
            );
            return buildResponse(token, "EMPRESA", empresa.getNombre(), empresa.getCedulaJuridica());
        }

        // ── 3. OFERENTE ──────────────────────────────────────────────────────
        Optional<Oferente> oferenteOpt = oferenteRepository.findByCorreo(usuario);
        if (oferenteOpt.isPresent()) {
            Oferente oferente = oferenteOpt.get();

            if (!clave.equals(oferente.getClave())) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Clave incorrecta");
            }
            if (!oferente.getAprobado()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                        "Su cuenta no ha sido aprobada aún");
            }

            String nombre = oferente.getNombre() + " " + oferente.getPrimerApellido();
            String token  = jwtUtil.generateToken(usuario, "OFERENTE", nombre, oferente.getCedula());
            return buildResponse(token, "OFERENTE", nombre, oferente.getCedula());
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado");
    }

    /** Construye el mapa de respuesta con token + datos del usuario. */
    private Map<String, Object> buildResponse(String token, String rol,
                                              String nombre, String id) {
        Map<String, Object> response = new HashMap<>();
        response.put("token",  token);
        response.put("rol",    rol);
        response.put("nombre", nombre);
        response.put("id",     id);
        return response;
    }
}