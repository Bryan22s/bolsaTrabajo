package progra4.bolsabe.logic;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

/**
 * OferenteHabilidad: destreza que tiene un oferente.
 * Similar a PuestoCaracteristica pero para el perfil del oferente.
 *
 * Ejemplo: "Juan tiene JavaScript con nivel 4"
 *
 * Se ignora "oferente" en JSON para evitar referencia circular:
 *   Oferente → OferenteHabilidad → Oferente → ...
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"oferente"})
public class OferenteHabilidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne
    @JoinColumn(name = "oferente_cedula")
    Oferente oferente;

    @ManyToOne
    @JoinColumn(name = "caracteristica_id")
    Caracteristica caracteristica;

    Integer nivel;
}