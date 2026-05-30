package progra4.bolsabe.logic;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

/**
 * Característica requerida para un puesto, con su nivel mínimo.
 * Ej: Puesto "Full Stack Dev" requiere "JavaScript" con nivel 3.
 *
 * Se ignora "puesto" en JSON para evitar referencia circular:
 *   Puesto → PuestoCaracteristica → Puesto → ...
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"puesto"})
public class PuestoCaracteristica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;


    @ManyToOne
    @JoinColumn(name = "puesto_id")
    Puesto puesto;


    @ManyToOne
    @JoinColumn(name = "caracteristica_id")
    Caracteristica caracteristica;


    Integer nivel;
}
