package progra4.bolsabe.presentation.puestos;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import progra4.bolsabe.data.PuestoRepository;
import progra4.bolsabe.logic.Puesto;
import progra4.bolsabe.logic.TipoPuesto;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/puestos")
public class PuestoController {

    @Autowired
    PuestoRepository puestoRepository;

    /**
     * PUBLICO: los 5 puestos mas recientes de tipo PUBLICO y activos.
     * Se muestran en la pagina principal con "Ver detalle".
     * GET /api/puestos/recientes
     */
    @GetMapping("/recientes")
    public List<Puesto> getRecientes() {
        return puestoRepository.findTop5ByTipoAndActivoOrderByFechaRegistroDesc(
            TipoPuesto.PUBLICO, true
        );
    }

    /**
     * PUBLICO: busqueda de puestos por caracteristicas seleccionadas.
     * Si no se selecciona ninguna, devuelve todos los puestos publicos activos.
     * GET /api/puestos/buscar?caracteristicaIds=1,2,3
     */
    @GetMapping("/buscar")
    public List<Puesto> buscar(
        @RequestParam(required = false) List<Integer> caracteristicaIds) {

        if (caracteristicaIds == null || caracteristicaIds.isEmpty()) {
            // Sin filtro: devuelve los 5 mas recientes
            return puestoRepository.findTop5ByTipoAndActivoOrderByFechaRegistroDesc(
                TipoPuesto.PUBLICO, true
            );
        }
        return puestoRepository.buscarPorCaracteristicas(
            caracteristicaIds, TipoPuesto.PUBLICO, true
        );
    }

    /**
     * EMPRESA (autenticada): publicar un nuevo puesto.
     * POST /api/puestos
     */
    @PostMapping
    public Puesto create(@RequestBody Puesto puesto) {
        puesto.setActivo(true);
        puesto.setFechaRegistro(LocalDateTime.now());
        return puestoRepository.save(puesto);
    }

    /**
     * EMPRESA (autenticada): desactivar un puesto ya publicado.
     * PUT /api/puestos/{id}/desactivar
     */
    @PutMapping("/{id}/desactivar")
    public void desactivar(@PathVariable Integer id) {
        Puesto puesto = puestoRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        puesto.setActivo(false);
        puestoRepository.save(puesto);
    }
}
