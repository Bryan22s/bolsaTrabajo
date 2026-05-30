package progra4.bolsabe.logic;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import java.util.List;

/**
 * Caracteristica jerárquica (ej: Lenguajes → Java, Python; Tecnologías Web → HTML, CSS)
 * Se serializa a JSON plano: { id, nombre, padreId }
 * El frontend construye el árbol usando padreId.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@JsonIgnoreProperties({"padre", "hijos"})
public class Caracteristica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    String nombre;


    @ManyToOne
    @JoinColumn(name = "padre_id")
    Caracteristica padre;

    // Lista de hijos (se ignora en JSON, se usa internamente)
    @OneToMany(mappedBy = "padre", fetch = FetchType.LAZY)
    List<Caracteristica> hijos;

    /**
     * Getter manual: devuelve el ID del padre (o null si es raíz).
     * Jackson lo serializa como "padreId" en el JSON.
     */
    public Integer getPadreId() {
        return padre != null ? padre.getId() : null;
    }
}
