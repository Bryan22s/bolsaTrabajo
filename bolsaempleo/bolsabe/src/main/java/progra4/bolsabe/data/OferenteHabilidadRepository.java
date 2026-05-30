package progra4.bolsabe.data;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import progra4.bolsabe.logic.OferenteHabilidad;
import progra4.bolsabe.logic.Oferente;

import java.util.List;

@Repository
public interface OferenteHabilidadRepository extends JpaRepository<OferenteHabilidad, Integer> {

    /** Todas las habilidades de un oferente específico. */
    List<OferenteHabilidad> findByOferente(Oferente oferente);

    /**
     * Busca oferentes que tengan AL MENOS UNA de las características indicadas.
     * Devuelve los oferentes distintos (sin duplicados) que estén aprobados.
     *
     * Nota: "al menos una" es el criterio mínimo para la búsqueda.
     * El nivel mínimo no se filtra aquí para no complicar la query;
     * se filtra en el controlador si se desea afinar.
     */
    @Query("SELECT DISTINCT oh.oferente FROM OferenteHabilidad oh " +
            "WHERE oh.caracteristica.id IN :ids " +
            "AND oh.oferente.aprobado = true")
    List<Oferente> buscarOferentesPorHabilidades(@Param("ids") List<Integer> ids);
}