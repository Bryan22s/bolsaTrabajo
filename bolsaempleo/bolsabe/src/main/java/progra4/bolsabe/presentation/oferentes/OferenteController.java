package progra4.bolsabe.presentation.oferentes;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import progra4.bolsabe.data.OferenteRepository;
import progra4.bolsabe.logic.Oferente;
import java.util.List;

@RestController
@RequestMapping("/api/oferentes")
public class OferenteController {

    @Autowired
    OferenteRepository oferenteRepository;

    /**
     * PUBLICO: registro de nuevo oferente.
     * POST /api/oferentes/registro
     */
    @PostMapping("/registro")
    public void registro(@RequestBody Oferente oferente) {
        if (oferenteRepository.existsById(oferente.getCedula())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Ya existe un oferente con esa cédula");
        }
        oferente.setAprobado(false);
        oferenteRepository.save(oferente);
    }

    /**
     * ADMIN: listar oferentes pendientes de aprobacion.
     * GET /api/oferentes/pendientes
     */
    @GetMapping("/pendientes")
    public List<Oferente> getPendientes() {
        return oferenteRepository.findByAprobado(false);
    }

    /**
     * ADMIN: aprobar un oferente.
     * PUT /api/oferentes/{cedula}/aprobar
     */
    @PutMapping("/{cedula}/aprobar")
    public void aprobar(@PathVariable String cedula) {
        Oferente oferente = oferenteRepository.findById(cedula)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        oferente.setAprobado(true);
        oferenteRepository.save(oferente);
    }
}
