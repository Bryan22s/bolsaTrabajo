import { useState, useEffect } from 'react'
import PuestoCard from '../components/PuestoCard'
import DetalleModal from '../components/DetalleModal'

const BACKEND = 'http://localhost:8080'

/**
 * Home: página principal (parte pública).
 * Muestra los 5 puestos públicos más recientes.
 * Al hacer clic en "Ver detalle" abre un modal con los requisitos.
 */
function Home() {
  const [puestos, setPuestos] = useState([])
  const [allCaracteristicas, setAllCaracteristicas] = useState([])
  const [selectedPuesto, setSelectedPuesto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Cargar los 5 puestos recientes
    const fetchPuestos = fetch(`${BACKEND}/api/puestos/recientes`)
      .then(res => res.json())

    // Cargar características (para construir rutas en el detalle)
    const fetchCaract = fetch(`${BACKEND}/api/caracteristicas`)
      .then(res => res.json())

    Promise.all([fetchPuestos, fetchCaract])
      .then(([puestosData, caractData]) => {
        setPuestos(puestosData)
        setAllCaracteristicas(caractData)
      })
      .catch(() => setError('No se pudo conectar con el servidor. Verifique que el backend esté corriendo.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="home-page">
      <h2 className="section-title">Bolsa de Empleo</h2>
      <p className="section-subtitle">Puestos disponibles recientemente</p>

      {loading && <p className="loading-msg">Cargando puestos...</p>}
      {error && <p className="error-msg">{error}</p>}

      {!loading && !error && puestos.length === 0 && (
        <p className="empty-msg">No hay puestos disponibles en este momento.</p>
      )}

      {/* Grid de tarjetas de puestos */}
      <div className="puestos-grid">
        {puestos.map(puesto => (
          <PuestoCard
            key={puesto.id}
            puesto={puesto}
            onVerDetalle={setSelectedPuesto}
          />
        ))}
      </div>

      {/* Modal de detalle del puesto seleccionado */}
      <DetalleModal
        puesto={selectedPuesto}
        allCaracteristicas={allCaracteristicas}
        onClose={() => setSelectedPuesto(null)}
      />
    </div>
  )
}

export default Home
