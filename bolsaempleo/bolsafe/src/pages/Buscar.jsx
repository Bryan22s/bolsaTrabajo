import { useState, useEffect } from 'react'
import { apiFetch } from '../services/api'
import DetalleModal from '../components/DetalleModal'

function buildTree(items, parentId = null) {
    return items
        .filter(item => item.padreId === parentId)
        .map(item => ({
            ...item,
            children: buildTree(items, item.id)
        }))
}

function Buscar() {
    const [caracteristicas, setCaracteristicas] = useState([])
    const [seleccionadas, setSeleccionadas]     = useState([])
    const [resultados, setResultados]           = useState([])
    const [loading, setLoading]                 = useState(false)
    const [selectedPuesto, setSelectedPuesto]   = useState(null)

    // Carga todos los puestos al entrar a la página
    useEffect(() => {
        apiFetch('/api/caracteristicas')
            .then(res => res.json())
            .then(data => setCaracteristicas(data))
            .catch(err => console.error('Error cargando características:', err))

        // Carga inicial: todos los puestos sin filtro
        cargarPuestos([])
    }, [])

    const cargarPuestos = async (ids) => {
        setLoading(true)
        try {
            const params = ids.length > 0 ? `?caracteristicaIds=${ids.join(',')}` : ''
            const res  = await apiFetch(`/api/puestos/buscar${params}`)
            const data = await res.json()
            setResultados(data)
        } catch (err) {
            console.error('Error buscando puestos:', err.message)
        } finally {
            setLoading(false)
        }
    }

    const toggleCaracteristica = (id) => {
        setSeleccionadas(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const handleBuscar = () => {
        cargarPuestos(seleccionadas)
    }

    const handleLimpiar = () => {
        setSeleccionadas([])
        cargarPuestos([])
    }

    const renderTree = (nodos, nivel = 0) => {
        return nodos.map(nodo => (
            <div key={nodo.id} style={{ marginLeft: nivel * 16 }}>
                <label className="checkbox-label">
                    {nodo.children && nodo.children.length > 0 ? (
                        <>
                            <input
                                type="checkbox"
                                checked={seleccionadas.includes(nodo.id)}
                                onChange={() => toggleCaracteristica(nodo.id)}
                            />
                            <strong>{nodo.nombre}</strong>
                        </>
                    ) : (
                        <>
                            <input
                                type="checkbox"
                                checked={seleccionadas.includes(nodo.id)}
                                onChange={() => toggleCaracteristica(nodo.id)}
                            />
                            {nodo.nombre}
                        </>
                    )}
                </label>
                {nodo.children && renderTree(nodo.children, nivel + 1)}
            </div>
        ))
    }

    const arbol = buildTree(caracteristicas)

    return (
        <div className="buscar-page">
            <h2 className="section-title">Buscar Puestos</h2>

            <div className="buscar-layout">
                {/* Panel izquierdo: filtros */}
                <div className="buscar-filtros">
                    <h3>Características</h3>
                    <div className="caracteristicas-tree">
                        {renderTree(arbol)}
                    </div>
                    <button
                        className="btn btn-primary btn-buscar"
                        onClick={handleBuscar}
                        disabled={loading}>
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                    {seleccionadas.length > 0 && (
                        <button
                            className="btn btn-secondary btn-buscar"
                            onClick={handleLimpiar}>
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Panel derecho: resultados */}
                <div className="buscar-resultados">
                    <h3>
                        Resultados
                        {seleccionadas.length > 0 && (
                            <span className="resultados-filtro">
                                {' '}— filtrando por {seleccionadas.length} característica{seleccionadas.length > 1 ? 's' : ''}
                            </span>
                        )}
                    </h3>

                    {loading && <p className="loading-msg">Buscando...</p>}

                    {!loading && resultados.length === 0 && (
                        <p className="empty-msg">No se encontraron puestos con esas características.</p>
                    )}

                    <div className="resultados-grid">
                        {resultados.map(p => (
                            <div
                                key={p.id}
                                className="resultado-card resultado-card--clickable"
                                onClick={() => setSelectedPuesto(p)}>
                                <strong className="card-empresa">{p.empresa?.nombre}</strong>
                                <p className="card-descripcion">{p.descripcion}</p>
                                <p className="card-salario">
                                    ₡ {p.salario?.toLocaleString('es-CR')}
                                </p>
                                {p.tipo === 'PRIVADO' && (
                                    <span className="badge-privado">🔒 Privado</span>
                                )}
                                <span className="resultado-hint">Clic para ver detalle</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal de detalle al hacer clic en un resultado */}
            <DetalleModal
                puesto={selectedPuesto}
                allCaracteristicas={caracteristicas}
                onClose={() => setSelectedPuesto(null)}
            />
        </div>
    )
}

export default Buscar