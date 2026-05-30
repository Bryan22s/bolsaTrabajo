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


    @GetMapping
    public List<Caracteristica> getAll() {
        return caracteristicaRepository.findAll();
    }

    @PostMapping
    public Caracteristica create(@RequestBody Caracteristica caracteristica) {
        return caracteristicaRepository.save(caracteristica);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        if (!caracteristicaRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        caracteristicaRepository.deleteById(id);
    }
}
