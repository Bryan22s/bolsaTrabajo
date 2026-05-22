/**
 * PuestoCard: tarjeta que muestra un puesto de trabajo.
 * Al hacer clic en "Ver detalle" abre el modal con los requisitos.
 * Sigue el diseño de las imágenes de referencia del proyecto.
 */
function PuestoCard({ puesto, onVerDetalle }) {
  const salarioFormateado = puesto.salario
    ? `₡ ${puesto.salario.toLocaleString('es-CR')}`
    : 'No especificado'

  return (
    <div className="puesto-card">
      <p className="card-empresa">{puesto.empresa?.nombre}</p>
      <p className="card-descripcion">{puesto.descripcion}</p>
      <p className="card-salario">{salarioFormateado}</p>
      <button
        className="btn-ver-detalle"
        onClick={() => onVerDetalle(puesto)}>
        Ver detalle
      </button>
    </div>
  )
}

export default PuestoCard
