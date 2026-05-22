package progra4.bolsabe.logic;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Empresa {

    @Id
    String cedulaJuridica;

    String nombre;
    String localizacion;
    String correo;
    String telefono;

    @Column(columnDefinition = "TEXT")
    String descripcion;

    // WRITE_ONLY: se recibe en POST/PUT pero NO se devuelve en GET (seguridad)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    String clave;

    // false = pendiente de aprobacion por admin
    Boolean aprobada = false;

    LocalDateTime fechaRegistro;
}
