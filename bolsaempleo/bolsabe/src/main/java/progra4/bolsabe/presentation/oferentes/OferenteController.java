package progra4.bolsabe.presentation.oferentes;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import progra4.bolsabe.data.OferenteHabilidadRepository;
import progra4.bolsabe.data.OferenteRepository;
import progra4.bolsabe.logic.Oferente;
import progra4.bolsabe.logic.OferenteHabilidad;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * OferenteController: todos los endpoints relacionados con oferentes.
 *
 * Endpoints:
 *   POST   /api/oferentes/registro              → público
 *   GET    /api/oferentes/pendientes            → ADMIN
 *   PUT    /api/oferentes/{cedula}/aprobar      → ADMIN
 *   GET    /api/oferentes/{cedula}              → EMPRESA | ADMIN | OFERENTE propio
 *   GET    /api/oferentes/buscar                → EMPRESA
 *   GET    /api/oferentes/{cedula}/habilidades  → OFERENTE | EMPRESA | ADMIN
 *   POST   /api/oferentes/{cedula}/habilidades  → OFERENTE
 *   DELETE /api/oferentes/{cedula}/habilidades/{id} → OFERENTE
 *   POST   /api/oferentes/{cedula}/curriculum   → OFERENTE
 */
@RestController
@RequestMapping("/api/oferentes")
public class OferenteController {

    @Autowired OferenteRepository           oferenteRepository;
    @Autowired OferenteHabilidadRepository  habilidadRepository;

    // Directorio donde se guardan los PDFs (configurable en application.properties)
    @Value("${app.upload.dir:uploads/curriculos}")
    private String uploadDir;

    // ── REGISTRO (público) ──────────────────────────────────────────────
    @PostMapping("/registro")
    public void registro(@RequestBody Oferente oferente) {
        if (oferenteRepository.existsById(oferente.getCedula())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Ya existe un oferente con esa cédula");
        }
        oferente.setAprobado(false);
        oferenteRepository.save(oferente);
    }

    // ── PENDIENTES (ADMIN) ──────────────────────────────────────────────
    @GetMapping("/pendientes")
    public List<Oferente> getPendientes() {
        return oferenteRepository.findByAprobado(false);
    }

    // ── APROBAR (ADMIN) ─────────────────────────────────────────────────
    @PutMapping("/{cedula}/aprobar")
    public void aprobar(@PathVariable String cedula) {
        Oferente oferente = oferenteRepository.findById(cedula)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        oferente.setAprobado(true);
        oferenteRepository.save(oferente);
    }

    // ── VER DETALLE (EMPRESA | ADMIN | OFERENTE propio) ────────────────
    @GetMapping("/{cedula}")
    public Oferente getDetalle(@PathVariable String cedula) {
        return oferenteRepository.findById(cedula)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
    }

    // ── BUSCAR POR HABILIDADES (EMPRESA) ───────────────────────────────
    @GetMapping("/buscar")
    public List<Oferente> buscar(
            @RequestParam(required = false) List<Integer> caracteristicaIds) {

        if (caracteristicaIds == null || caracteristicaIds.isEmpty()) {
            // Sin filtro: devuelve todos los aprobados
            return oferenteRepository.findByAprobado(true);
        }
        return habilidadRepository.buscarOferentesPorHabilidades(caracteristicaIds);
    }

    // ── LISTAR HABILIDADES (OFERENTE | EMPRESA | ADMIN) ────────────────
    @GetMapping("/{cedula}/habilidades")
    public List<OferenteHabilidad> getHabilidades(@PathVariable String cedula) {
        Oferente oferente = oferenteRepository.findById(cedula)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        return habilidadRepository.findByOferente(oferente);
    }

    // ── AGREGAR HABILIDAD (OFERENTE) ────────────────────────────────────
    @PostMapping("/{cedula}/habilidades")
    public OferenteHabilidad addHabilidad(
            @PathVariable String cedula,
            @RequestBody OferenteHabilidad habilidad) {

        Oferente oferente = oferenteRepository.findById(cedula)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        habilidad.setOferente(oferente);
        return habilidadRepository.save(habilidad);
    }

    // ── ELIMINAR HABILIDAD (OFERENTE) ───────────────────────────────────
    @DeleteMapping("/{cedula}/habilidades/{habId}")
    public void deleteHabilidad(
            @PathVariable String cedula,
            @PathVariable Integer habId) {

        // Verificar que el oferente existe
        if (!oferenteRepository.existsById(cedula)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        // Verificar que la habilidad existe
        if (!habilidadRepository.existsById(habId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND);
        }
        habilidadRepository.deleteById(habId);
    }

    // ── SUBIR CURRÍCULO PDF (OFERENTE) ──────────────────────────────────
    @PostMapping("/{cedula}/curriculum")
    public Map<String, String> subirCurriculum(
            @PathVariable String cedula,
            @RequestParam("file") MultipartFile file) {

        // Verificar que el oferente existe
        Oferente oferente = oferenteRepository.findById(cedula)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        // Validar que es un PDF
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Solo se permiten archivos PDF");
        }

        try {
            // Crear el directorio si no existe
            Path dirPath = Paths.get(uploadDir);
            Files.createDirectories(dirPath);

            // Nombre único para el archivo: cedula_uuid.pdf
            String fileName = cedula + "_" + UUID.randomUUID() + ".pdf";
            Path filePath = dirPath.resolve(fileName);

            // Guardar el archivo en disco
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Si ya tenía un currículo anterior, eliminar el archivo viejo
            if (oferente.getCurriculumUrl() != null) {
                try {
                    String oldFileName = oferente.getCurriculumUrl()
                            .replace("/curriculos/", "");
                    Path oldPath = dirPath.resolve(oldFileName);
                    Files.deleteIfExists(oldPath);
                } catch (Exception ignored) {
                    // Si no se puede borrar el viejo, no es crítico
                }
            }

            // Guardar la URL relativa en la base de datos
            String urlRelativa = "/curriculos/" + fileName;
            oferente.setCurriculumUrl(urlRelativa);
            oferenteRepository.save(oferente);

            // Devolver la URL para que el frontend la muestre
            Map<String, String> response = new HashMap<>();
            response.put("curriculumUrl", urlRelativa);
            return response;

        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "Error al guardar el archivo: " + e.getMessage());
        }
    }
}