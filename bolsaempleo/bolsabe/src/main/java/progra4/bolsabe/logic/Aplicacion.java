package progra4.bolsabe.logic;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Aplicacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "oferente_cedula")
    Oferente oferente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "puesto_id")
    Puesto puesto;

    LocalDateTime fechaAplicacion = LocalDateTime.now();
}