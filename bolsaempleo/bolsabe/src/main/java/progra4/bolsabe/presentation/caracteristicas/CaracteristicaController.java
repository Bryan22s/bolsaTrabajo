package progra4.bolsabe.presentation.caracteristicas;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import progra4.bolsabe.data.CaracteristicaRepository;
import progra4.bolsabe.logic.Caracteristica;
import java.util.List;

@RestController
@RequestMapping("/api/caracteristicas")
public class CaracteristicaController {

    @Autowired
    CaracteristicaRepository caracteristicaRepository;

    /**
     * PUBLICO: devuelve todas las caracteristicas (lista plana).
     * El frontend construye el arbol usando padreId.
     * GET /api/caracteristicas
     */
    @GetMapping
    public List<Caracteristica> getAll() {
        return caracteristicaRepository.findAll();
    }

    /**
     * ADMIN: crear nueva caracteristica.
     * POST /api/caracteristicas
     */
    @PostMapping
    public Caracteristica create(@RequestBody Caracteristica caracteristica) {
        return caracteristicaRepository.save(caracteristica);
    }

    /**
     * ADMIN: eliminar caracteristica.
     * DELETE /api/caracteristicas/{id}
     */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        if (!caracteristicaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        caracteristicaRepository.deleteById(id);
    }
}
