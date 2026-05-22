package progra4.bolsabe.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import progra4.bolsabe.logic.Empresa;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, String> {
    Optional<Empresa> findByCorreo(String correo);
    List<Empresa> findByAprobada(Boolean aprobada);
}
