package progra4.bolsabe.presentation.puestos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import progra4.bolsabe.data.PuestoRepository;
import progra4.bolsabe.logic.Puesto;
import progra4.bolsabe.logic.TipoPuesto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * PuestoController: gestión de puestos de trabajo.
 *
 * Regla de visibilidad de puestos:
 *   - Sin login (público):        solo puestos PUBLICOS
 *   - OFERENTE autenticado:       puestos PUBLICOS + PRIVADOS
 *   - EMPRESA / ADMIN autenticado: todos sus propios puestos (/todos)
 */
@RestController
@RequestMapping("/api/puestos")
public class PuestoController {

    @Autowired
    PuestoRepository puestoRepository;

    // ── HOME: 5 puestos recientes ────────────────────────────────────────
    /**
     * GET /api/puestos/recientes
     * Público: devuelve top 5 públicos.
     * Oferente autenticado: devuelve top 5 de cualquier tipo (públicos + privados).
     */
    @GetMapping("/recientes")
    public List<Puesto> getRecientes() {
        if (esOferente()) {
            // Oferente aprobado: puede ver públicos Y privados
            return puestoRepository.findTop5ByActivoOrderByFechaRegistroDesc(true);
        }
        // Sin login o cualquier otro rol: solo públicos
        return puestoRepository.findTop5ByTipoAndActivoOrderByFechaRegistroDesc(
                TipoPuesto.PUBLICO, true);
    }

    // ── BUSCAR puestos ───────────────────────────────────────────────────
    /**
     * GET /api/puestos/buscar?caracteristicaIds=1,2,3
     * Público: solo puestos PUBLICOS.
     * Oferente autenticado: puestos PUBLICOS + PRIVADOS.
     */
    @GetMapping("/buscar")
    public List<Puesto> buscar(
            @RequestParam(required = false) List<Integer> caracteristicaIds) {

        boolean soloPublicos = !esOferente();

        if (caracteristicaIds == null || caracteristicaIds.isEmpty()) {
            if (soloPublicos) {
                return puestoRepository.findTop5ByTipoAndActivoOrderByFechaRegistroDesc(
                        TipoPuesto.PUBLICO, true);
            } else {
                return puestoRepository.findTop5ByActivoOrderByFechaRegistroDesc(true);
            }
        }

        if (soloPublicos) {
            return puestoRepository.buscarPorCaracteristicas(
                    caracteristicaIds, TipoPuesto.PUBLICO, true);
        } else {
            return puestoRepository.buscarTodosTiposPorCaracteristicas(
                    caracteristicaIds, true);
        }
    }

    // ── TODOS los puestos (dashboard empresa) ────────────────────────────
    /**
     * GET /api/puestos/todos
     * Solo EMPRESA: ve todos sus puestos (activos + inactivos, público + privado).
     * Protegido en SecurityConfig con hasRole("EMPRESA").
     */
    @GetMapping("/todos")
    public List<Puesto> getTodos() {
        return puestoRepository.findAll();
    }

    // ── CREAR puesto ─────────────────────────────────────────────────────
    /**
     * POST /api/puestos
     * Solo EMPRESA. Requiere rol EMPRESA (SecurityConfig).
     */
    @PostMapping
    public Puesto create(@RequestBody Puesto puesto) {
        puesto.setActivo(true);
        puesto.setFechaRegistro(LocalDateTime.now());
        // Asignar la referencia bidireccional en cada característica
        if (puesto.getCaracteristicas() != null) {
            puesto.getCaracteristicas().forEach(pc -> pc.setPuesto(puesto));
        }
        return puestoRepository.save(puesto);
    }

    // ── DESACTIVAR puesto ────────────────────────────────────────────────
    /**
     * PUT /api/puestos/{id}/desactivar
     * Solo EMPRESA.
     */
    @PutMapping("/{id}/desactivar")
    public void desactivar(@PathVariable Integer id) {
        Puesto puesto = puestoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        puesto.setActivo(false);
        puestoRepository.save(puesto);
    }

    // ── Utilitario: detectar si el usuario actual es OFERENTE ────────────
    /**
     * Lee la autenticación del SecurityContext (puesta por JwtFilter).
     * Retorna true si el token corresponde a un OFERENTE.
     */
    private boolean esOferente() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OFERENTE"));
    }
}