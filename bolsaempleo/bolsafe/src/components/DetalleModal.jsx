import Modal from 'react-modal'

const modalStyles = {
  content: {
    width: '400px',
    maxHeight: '80vh',
    overflowY: 'auto',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    transform: 'translate(-50%, -50%)',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
  },
  overlay: { backgroundColor: 'rgba(0,0,0,0.5)' }
}

/**
 * DetalleModal: muestra el detalle de un puesto incluyendo sus requisitos.
 * El profesot quiere ver la ruta de la característica: "/ TecWeb (nivel 3)"
 */
function DetalleModal({ puesto, allCaracteristicas, onClose }) {
  if (!puesto) return null

  // Construye la ruta completa de una característica usando el árbol
  const buildPath = (caractId) => {
    const map = {}
    allCaracteristicas.forEach(c => { map[c.id] = c })

    const path = []
    let current = map[caractId]
    while (current) {
      path.unshift(current.nombre)
      current = current.padreId ? map[current.padreId] : null
    }
    return path.join(' / ')
  }

  return (
    <Modal
      isOpen={!!puesto}
      onRequestClose={onClose}
      shouldCloseOnOverlayClick={true}
      style={modalStyles}
      contentLabel="Detalle del puesto"
    >
      <div className="detalle-modal">
        <h3 className="detalle-empresa">{puesto.empresa?.nombre}</h3>
        <p className="detalle-descripcion">{puesto.descripcion}</p>
        <p className="detalle-salario">
          <strong>Salario: </strong>
          ₡ {puesto.salario?.toLocaleString('es-CR')}
        </p>
        <p className="detalle-tipo">
          <strong>Tipo: </strong>
          {puesto.tipo}
        </p>

        {puesto.caracteristicas?.length > 0 && (
          <>
            <h4 className="detalle-requisitos-title">Requisitos</h4>
            <ul className="detalle-requisitos">
              {puesto.caracteristicas.map(pc => (
                <li key={pc.id}>
                  • / {buildPath(pc.caracteristica?.id)} ({pc.nivel})
                </li>
              ))}
            </ul>
          </>
        )}

        <div style={{ textAlign: 'right', marginTop: '16px' }}>
          <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </Modal>
  )
}

export default DetalleModal
