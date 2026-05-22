package progra4.bolsabe.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import progra4.bolsabe.logic.Puesto;
import progra4.bolsabe.logic.TipoPuesto;
import java.util.List;

@Repository
public interface PuestoRepository extends JpaRepository<Puesto, Integer> {

    // Los 5 puestos publicos mas recientes activos
    List<Puesto> findTop5ByTipoAndActivoOrderByFechaRegistroDesc(TipoPuesto tipo, Boolean activo);

    // Busqueda: puestos que tengan AL MENOS UNA de las caracteristicas seleccionadas
    @Query("SELECT DISTINCT p FROM Puesto p JOIN p.caracteristicas pc " +
           "WHERE pc.caracteristica.id IN :ids " +
           "AND p.tipo = :tipo AND p.activo = :activo " +
           "ORDER BY p.fechaRegistro DESC")
    List<Puesto> buscarPorCaracteristicas(
        @Param("ids") List<Integer> ids,
        @Param("tipo") TipoPuesto tipo,
        @Param("activo") Boolean activo
    );
}
