import { useState } from 'react'
import DetalleModal from './DetalleModal'

function PuestoCard({ puesto, allCaracteristicas = [] }) {
    const [hover, setHover]        = useState(false)
    const [popupPos, setPopupPos]  = useState({ x: 0, y: 0 })
    const [modalAbierto, setModal] = useState(false)

    const salarioFormateado = puesto.salario
        ? `₡ ${puesto.salario.toLocaleString('es-CR')}`
        : 'No especificado'

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

    const handleMouseEnter = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = rect.right + 8
        const y = rect.top
        setPopupPos({ x, y })
        setHover(true)
    }

    const tieneRequisitos = puesto.caracteristicas?.length > 0

    return (
        <>
            <div
                className="puesto-card"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setHover(false)}
            >
                <p className="card-empresa">{puesto.empresa?.nombre}</p>

                {puesto.tipo === 'PRIVADO' && (
                    <span className="badge-privado">🔒 Privado</span>
                )}

                <p className="card-descripcion">{puesto.descripcion}</p>
                <p className="card-salario">{salarioFormateado}</p>

                <button
                    className="btn-ver-detalle"
                    onClick={(e) => {
                        e.stopPropagation()
                        setHover(false)
                        setModal(true)
                    }}>
                    Ver detalle
                </button>
            </div>

            {/* Popup flotante con position:fixed — no afecta el layout */}
            {hover && tieneRequisitos && (
                <div
                    className="puesto-popup-flotante"
                    style={{
                        position: 'fixed',
                        left: Math.min(popupPos.x, window.innerWidth - 290),
                        top: popupPos.y,
                        zIndex: 9999
                    }}
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                >
                    <p className="popup-empresa">{puesto.empresa?.nombre}</p>
                    <p className="popup-descripcion">{puesto.descripcion}</p>
                    <p className="popup-salario">{salarioFormateado}</p>
                    {puesto.tipo === 'PRIVADO' && (
                        <span className="badge-privado" style={{ marginBottom: 8 }}>🔒 Privado</span>
                    )}
                    <div className="popup-divider" />
                    <p className="popup-requisitos-title"><strong>Requisitos</strong></p>
                    <ul className="popup-requisitos">
                        {puesto.caracteristicas.map(pc => (
                            <li key={pc.id}>
                                • / {buildPath(pc.caracteristica?.id)} ({pc.nivel})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {modalAbierto && (
                <DetalleModal
                    puesto={puesto}
                    allCaracteristicas={allCaracteristicas}
                    onClose={() => setModal(false)}
                />
            )}
        </>
    )
}

export default PuestoCard