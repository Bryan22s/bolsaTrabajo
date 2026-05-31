import { useState, useEffect } from 'react'
import { apiFetch } from '../services/api'
import PuestoCard from '../components/PuestoCard'

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

    const handleBuscar = () => cargarPuestos(seleccionadas)

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
                            <input type="checkbox"
                                   checked={seleccionadas.includes(nodo.id)}
                                   onChange={() => toggleCaracteristica(nodo.id)} />
                            <strong>{nodo.nombre}</strong>
                        </>
                    ) : (
                        <>
                            <input type="checkbox"
                                   checked={seleccionadas.includes(nodo.id)}
                                   onChange={() => toggleCaracteristica(nodo.id)} />
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
                    <button className="btn btn-primary btn-buscar"
                            onClick={handleBuscar} disabled={loading}>
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                    {seleccionadas.length > 0 && (
                        <button className="btn btn-secondary btn-buscar"
                                onClick={handleLimpiar}>
                            Limpiar filtros
                        </button>
                    )}
                </div>

                {/* Panel derecho: resultados usando PuestoCard con popup flotante */}
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

                    {/* Mismo PuestoCard del Home — incluye popup flotante y modal de detalle */}
                    <div className="puestos-grid">
                        {resultados.map(p => (
                            <PuestoCard
                                key={p.id}
                                puesto={p}
                                allCaracteristicas={caracteristicas}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Buscar