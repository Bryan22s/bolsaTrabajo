import { useState } from 'react'
import DetalleModal from './DetalleModal'
import { useAuth } from '../context/AuthContext'
import { apiFetch } from '../services/api'

function PuestoCard({ puesto, allCaracteristicas = [] }) {
    const { user, setLoginModalOpen } = useAuth()
    const [hover, setHover]           = useState(false)
    const [popupPos, setPopupPos]     = useState({ x: 0, y: 0 })
    const [modalAbierto, setModal]    = useState(false)
    const [aplicando, setAplicando]   = useState(false)
    const [msgAplicar, setMsgAplicar] = useState('')

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
        setPopupPos({ x: rect.right + 8, y: rect.top })
        setHover(true)
    }

    const aplicar = async (e) => {
        e.stopPropagation()

        // Si no hay sesion, abrir el modal de login
        if (!user) {
            setLoginModalOpen(true)
            return
        }

        // Si hay sesion pero no es oferente, no hacer nada
        if (user.rol !== 'OFERENTE') return

        setAplicando(true)
        setMsgAplicar('')
        try {
            const res = await apiFetch('/api/aplicaciones', {
                method: 'POST',
                body: JSON.stringify({ cedula: user.id, puestoId: puesto.id })
            })
            if (!res.ok) {
                const texto = await res.text()
                setMsgAplicar(texto)
            } else {
                setMsgAplicar('Aplicacion enviada correctamente.')
            }
        } catch (err) {
            setMsgAplicar('Error: ' + err.message)
        } finally {
            setAplicando(false)
        }
    }

    const tieneRequisitos = puesto.caracteristicas?.length > 0
    // Mostrar el boton si no hay sesion, o si el usuario es oferente
    const mostrarAplicar = !user || user.rol === 'OFERENTE'

    return (
        <>
            <div
                className="puesto-card"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={() => setHover(false)}
            >
                <p className="card-empresa">{puesto.empresa?.nombre}</p>

                {puesto.tipo === 'PRIVADO' && (
                    <span className="badge-privado">Privado</span>
                )}

                <p className="card-descripcion">{puesto.descripcion}</p>
                <p className="card-salario">{salarioFormateado}</p>

                <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    <button
                        className="btn-ver-detalle"
                        onClick={(e) => {
                            e.stopPropagation()
                            setHover(false)
                            setModal(true)
                        }}>
                        Ver detalle
                    </button>

                    {mostrarAplicar && (
                        <button
                            className="btn-ver-detalle"
                            onClick={aplicar}
                            disabled={aplicando}>
                            {aplicando ? 'Enviando...' : 'Aplicar'}
                        </button>
                    )}
                </div>

                {msgAplicar && (
                    <p style={{
                        fontSize: '0.8rem',
                        marginTop: 6,
                        color: msgAplicar.startsWith('Aplicacion') ? 'green' : '#c0392b'
                    }}>
                        {msgAplicar}
                    </p>
                )}
            </div>

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
                        <span className="badge-privado" style={{ marginBottom: 8 }}>Privado</span>
                    )}
                    <div className="popup-divider" />
                    <p className="popup-requisitos-title"><strong>Requisitos</strong></p>
                    <ul className="popup-requisitos">
                        {puesto.caracteristicas.map(pc => (
                            <li key={pc.id}>
                                {buildPath(pc.caracteristica?.id)} ({pc.nivel})
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