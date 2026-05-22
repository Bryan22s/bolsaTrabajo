package progra4.bolsabe.presentation.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import progra4.bolsabe.data.EmpresaRepository;
import progra4.bolsabe.data.OferenteRepository;
import progra4.bolsabe.logic.Empresa;
import progra4.bolsabe.logic.Oferente;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired EmpresaRepository empresaRepository;
    @Autowired OferenteRepository oferenteRepository;

    /**
     * PUBLICO: login del sistema.
     * - Empresa: ingresa con correo + clave
     * - Oferente: ingresa con correo + clave
     * - Admin: ingresa con "admin" + clave
     *
     * AVANCE: clave se compara en texto plano.
     * En entrega final se usara BCrypt + JWT.
     *
     * POST /api/auth/login
     * Body: { "usuario": "correo@ejemplo.com", "clave": "123" }
     */
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> credentials) {
        String usuario = credentials.get("usuario");
        String clave = credentials.get("clave");

        if (usuario == null || clave == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faltan credenciales");
        }

        // ---- 1. Verificar si es Admin ----
        if ("admin".equals(usuario) && "admin123".equals(clave)) {
            Map<String, Object> response = new HashMap<>();
            response.put("rol", "ADMIN");
            response.put("nombre", "Administrador");
            response.put("id", "admin");
            return response;
        }

        // ---- 2. Verificar si es Empresa (login por correo) ----
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
            Map<String, Object> response = new HashMap<>();
            response.put("rol", "EMPRESA");
            response.put("nombre", empresa.getNombre());
            response.put("id", empresa.getCedulaJuridica());
            return response;
        }

        // ---- 3. Verificar si es Oferente (login por correo) ----
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
            Map<String, Object> response = new HashMap<>();
            response.put("rol", "OFERENTE");
            response.put("nombre", oferente.getNombre() + " " + oferente.getPrimerApellido());
            response.put("id", oferente.getCedula());
            return response;
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado");
    }
}
