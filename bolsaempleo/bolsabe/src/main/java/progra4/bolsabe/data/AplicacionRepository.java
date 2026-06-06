package progra4.bolsabe.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import progra4.bolsabe.logic.Aplicacion;

import java.util.List;
import java.util.Optional;

@Repository
public interface AplicacionRepository extends JpaRepository<Aplicacion, Integer> {

    // Para la empresa: ver quién aplicó a un puesto
    List<Aplicacion> findByPuestoId(Integer puestoId);

    // Para el oferente: ver sus aplicaciones
    List<Aplicacion> findByOferenteCedula(String cedula);

    // Para evitar duplicados
    Optional<Aplicacion> findByOferenteCedulaAndPuestoId(String cedula, Integer puestoId);
}