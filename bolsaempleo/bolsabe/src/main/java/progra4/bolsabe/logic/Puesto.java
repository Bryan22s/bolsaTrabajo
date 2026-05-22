package progra4.bolsabe.logic;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Puesto de trabajo publicado por una Empresa.
 * Puede ser PUBLICO (visible a todos) o PRIVADO (solo oferentes aprobados).
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Puesto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Integer id;

    // Empresa que publicó el puesto
    @ManyToOne
    @JoinColumn(name = "empresa_cedula")
    Empresa empresa;

    @Column(columnDefinition = "TEXT")
    String descripcion;

    Double salario;

    @Enumerated(EnumType.STRING)
    TipoPuesto tipo;   // PUBLICO | PRIVADO

    Boolean activo = true;

    LocalDateTime fechaRegistro;

    // Características requeridas para este puesto
    @OneToMany(mappedBy = "puesto", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    List<PuestoCaracteristica> caracteristicas;
}
