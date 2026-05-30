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

    /** Top 5 puestos públicos activos más recientes (página Home, sin login). */
    List<Puesto> findTop5ByTipoAndActivoOrderByFechaRegistroDesc(
            TipoPuesto tipo, Boolean activo);

    /**
     * Top 5 puestos activos más recientes SIN filtrar por tipo.
     * Usado en Home cuando el usuario está autenticado como OFERENTE
     * (puede ver públicos Y privados).
     */
    List<Puesto> findTop5ByActivoOrderByFechaRegistroDesc(Boolean activo);

    /** Buscar puestos públicos activos por características. */
    @Query("SELECT DISTINCT p FROM Puesto p JOIN p.caracteristicas pc " +
            "WHERE pc.caracteristica.id IN :ids " +
            "AND p.tipo = :tipo AND p.activo = :activo " +
            "ORDER BY p.fechaRegistro DESC")
    List<Puesto> buscarPorCaracteristicas(
            @Param("ids") List<Integer> ids,
            @Param("tipo") TipoPuesto tipo,
            @Param("activo") Boolean activo);

    /**
     * Buscar puestos activos (públicos + privados) por características.
     * Usado cuando el oferente está autenticado.
     */
    @Query("SELECT DISTINCT p FROM Puesto p JOIN p.caracteristicas pc " +
            "WHERE pc.caracteristica.id IN :ids " +
            "AND p.activo = :activo " +
            "ORDER BY p.fechaRegistro DESC")
    List<Puesto> buscarTodosTiposPorCaracteristicas(
            @Param("ids") List<Integer> ids,
            @Param("activo") Boolean activo);

    /** Todos los puestos (activos e inactivos) para el dashboard de empresa. */
    List<Puesto> findAll();
}