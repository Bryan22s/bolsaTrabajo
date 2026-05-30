import { useState, useEffect } from 'react'
import PuestoCard from '../components/PuestoCard'
import { apiFetch } from '../services/api'

function Home() {
    const [puestos, setPuestos]                       = useState([])
    const [allCaracteristicas, setAllCaracteristicas] = useState([])
    const [loading, setLoading]                       = useState(true)
    const [error, setError]                           = useState('')

    useEffect(() => {
        const fetchPuestos = apiFetch('/api/puestos/recientes').then(res => res.json())
        const fetchCaract  = apiFetch('/api/caracteristicas').then(res => res.json())

        Promise.all([fetchPuestos, fetchCaract])
            .then(([puestosData, caractData]) => {
                setPuestos(puestosData)
                setAllCaracteristicas(caractData)
            })
            .catch(() => setError('No se pudo conectar con el servidor.'))
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="home-page">
            <h2 className="section-title">Bolsa de Empleo</h2>
            <p className="section-subtitle">
                Puestos disponibles recientemente — posiciona el mouse para ver requisitos
            </p>

            {loading && <p className="loading-msg">Cargando puestos...</p>}
            {error   && <p className="error-msg">{error}</p>}

            {!loading && !error && puestos.length === 0 && (
                <p className="empty-msg">No hay puestos disponibles en este momento.</p>
            )}

            <div className="puestos-grid">
                {puestos.map(puesto => (
                    <PuestoCard
                        key={puesto.id}
                        puesto={puesto}
                        allCaracteristicas={allCaracteristicas}
                    />
                ))}
            </div>
        </div>
    )
}

export default Home