package progra4.bolsabe.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import progra4.bolsabe.logic.Oferente;
import java.util.List;
import java.util.Optional;

@Repository
public interface OferenteRepository extends JpaRepository<Oferente, String> {
    Optional<Oferente> findByCorreo(String correo);
    List<Oferente> findByAprobado(Boolean aprobado);
}
