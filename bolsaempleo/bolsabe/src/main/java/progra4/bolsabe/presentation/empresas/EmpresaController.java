package progra4.bolsabe.presentation.empresas;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import progra4.bolsabe.data.EmpresaRepository;
import progra4.bolsabe.logic.Empresa;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/empresas")
public class EmpresaController {

    @Autowired
    EmpresaRepository empresaRepository;

    /**
     * PUBLICO: registro de nueva empresa.
     * POST /api/empresas/registro
     */
    @PostMapping("/registro")
    public void registro(@RequestBody Empresa empresa) {
        if (empresaRepository.existsById(empresa.getCedulaJuridica())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Ya existe una empresa con esa cédula jurídica");
        }
        empresa.setAprobada(false);
        empresa.setFechaRegistro(LocalDateTime.now());
        empresaRepository.save(empresa);
    }

    /**
     * ADMIN: listar empresas pendientes de aprobacion.
     * GET /api/empresas/pendientes
     */
    @GetMapping("/pendientes")
    public List<Empresa> getPendientes() {
        return empresaRepository.findByAprobada(false);
    }

    /**
     * ADMIN: aprobar una empresa.
     * PUT /api/empresas/{cedulaJuridica}/aprobar
     */
    @PutMapping("/{cedulaJuridica}/aprobar")
    public void aprobar(@PathVariable String cedulaJuridica) {
        Empresa empresa = empresaRepository.findById(cedulaJuridica)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        empresa.setAprobada(true);
        empresaRepository.save(empresa);
    }

    /**
     * EMPRESA: obtener sus propios datos.
     * GET /api/empresas/{cedulaJuridica}
     */
    @GetMapping("/{cedulaJuridica}")
    public Empresa get(@PathVariable String cedulaJuridica) {
        return empresaRepository.findById(cedulaJuridica)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }
}
