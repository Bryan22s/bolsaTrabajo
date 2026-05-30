package progra4.bolsabe.logic;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Oferente {

    @Id
    String cedula;

    String nombre;
    String primerApellido;
    String nacionalidad;
    String telefono;
    String correo;
    String lugarResidencia;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    String clave;

    Boolean aprobado = false;

    String curriculumUrl;
}
