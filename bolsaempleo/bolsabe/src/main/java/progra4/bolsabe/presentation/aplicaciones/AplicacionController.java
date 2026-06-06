package progra4.bolsabe.presentation.aplicaciones;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import progra4.bolsabe.data.AplicacionRepository;
import progra4.bolsabe.data.OferenteRepository;
import progra4.bolsabe.data.PuestoRepository;
import progra4.bolsabe.logic.Aplicacion;
import progra4.bolsabe.logic.Oferente;
import progra4.bolsabe.logic.Puesto;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/aplicaciones")
public class AplicacionController {

    @Autowired AplicacionRepository aplicacionRepository;
    @Autowired OferenteRepository   oferenteRepository;
    @Autowired PuestoRepository     puestoRepository;

    // POST /api/aplicaciones
    // Body: { "cedula": "...", "puestoId": 1 }
    @PostMapping
    public ResponseEntity<?> aplicar(@RequestBody Map<String, Object> body) {
        String cedula  = (String) body.get("cedula");
        Integer puestoId = (Integer) body.get("puestoId");

        // Evitar duplicados
        Optional<Aplicacion> existente =
                aplicacionRepository.findByOferenteCedulaAndPuestoId(cedula, puestoId);
        if (existente.isPresent()) {
            return ResponseEntity.badRequest().body("Ya aplicaste a este puesto.");
        }

        Oferente oferente = oferenteRepository.findById(cedula)
                .orElseThrow(() -> new RuntimeException("Oferente no encontrado"));
        Puesto puesto = puestoRepository.findById(puestoId)
                .orElseThrow(() -> new RuntimeException("Puesto no encontrado"));

        Aplicacion nueva = new Aplicacion();
        nueva.setOferente(oferente);
        nueva.setPuesto(puesto);

        return ResponseEntity.ok(aplicacionRepository.save(nueva));
    }

    // GET /api/aplicaciones/puesto/1  → para la empresa
    @GetMapping("/puesto/{puestoId}")
    public ResponseEntity<List<Aplicacion>> getByPuesto(@PathVariable Integer puestoId) {
        return ResponseEntity.ok(aplicacionRepository.findByPuestoId(puestoId));
    }

    // GET /api/aplicaciones/oferente/1234567  → para el oferente
    @GetMapping("/oferente/{cedula}")
    public ResponseEntity<List<Aplicacion>> getByOferente(@PathVariable String cedula) {
        return ResponseEntity.ok(aplicacionRepository.findByOferenteCedula(cedula));
    }

    // DELETE /api/aplicaciones/5  → cancelar aplicación
    @DeleteMapping("/{id}")
    public ResponseEntity<?> cancelar(@PathVariable Integer id) {
        if (!aplicacionRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        aplicacionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}