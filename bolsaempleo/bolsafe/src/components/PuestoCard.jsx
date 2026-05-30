import { useState } from 'react'
import DetalleModal from './DetalleModal'

/**
 * PuestoCard: tarjeta de puesto.
 * - Hover: muestra un preview suave con los requisitos
 * - Clic en "Ver detalle": abre modal completo
 */
function PuestoCard({ puesto, allCaracteristicas = [] }) {
    const [hover, setHover]           = useState(false)
    const [modalAbierto, setModal]    = useState(false)

    const salarioFormateado = puesto.salario
        ? `₡ ${puesto.salario.toLocaleString('es-CR')}`
        : 'No especificado'

    // Construye la ruta jerárquica de una característica
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
        <>
            <div
                className={`puesto-card ${hover ? 'puesto-card--hover' : ''}`}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                <p className="card-empresa">{puesto.empresa?.nombre}</p>

                {puesto.tipo === 'PRIVADO' && (
                    <span className="badge-privado">🔒 Privado</span>
                )}

                <p className="card-descripcion">{puesto.descripcion}</p>
                <p className="card-salario">{salarioFormateado}</p>

                {/* Preview de requisitos al hacer hover */}
                {hover && puesto.caracteristicas?.length > 0 && (
                    <div className="puesto-hover-preview">
                        <p className="hover-requisitos-title"><strong>Requisitos</strong></p>
                        <ul className="hover-requisitos">
                            {puesto.caracteristicas.map(pc => (
                                <li key={pc.id}>
                                    • / {buildPath(pc.caracteristica?.id)} ({pc.nivel})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                <button
                    className="btn-ver-detalle"
                    onClick={() => setModal(true)}>
                    Ver detalle
                </button>
            </div>

            {/* Modal de detalle completo al hacer clic */}
            <DetalleModal
                puesto={modalAbierto ? puesto : null}
                allCaracteristicas={allCaracteristicas}
                onClose={() => setModal(false)}
            />
        </>
    )
}

export default PuestoCard