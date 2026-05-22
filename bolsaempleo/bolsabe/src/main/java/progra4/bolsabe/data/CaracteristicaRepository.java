package progra4.bolsabe.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import progra4.bolsabe.logic.Caracteristica;

@Repository
public interface CaracteristicaRepository extends JpaRepository<Caracteristica, Integer> {
}
