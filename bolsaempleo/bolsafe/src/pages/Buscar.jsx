import { useState, useEffect } from 'react'

const BACKEND = 'http://localhost:8080'

/**
 * Construye un árbol a partir de la lista plana de características.
 * Cada nodo tiene { ...caracteristica, children: [...] }
 */
function buildTree(items, parentId = null) {
  return items
    .filter(item => item.padreId === parentId)
    .map(item => ({
      ...item,
      children: buildTree(items, item.id)
    }))
}

/**
 * Buscar: permite buscar puestos públicos filtrando por características.
 * Muestra un árbol de checkboxes a la izquierda y los resultados a la derecha.
 */
function Buscar() {
  const [caracteristicas, setCaracteristicas] = useState([])
  const [seleccionadas, setSeleccionadas] = useState([])
  const [resultados, setResultados] = useState([])
  const [buscado, setBuscado] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`${BACKEND}/api/caracteristicas`)
      .then(res => res.json())
      .then(data => setCaracteristicas(data))
      .catch(err => console.error('Error cargando características:', err))
  }, [])

  const toggleCaracteristica = (id) => {
    setSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleBuscar = async () => {
    setLoading(true)
    try {
      const params = seleccionadas.length > 0
        ? `?caracteristicaIds=${seleccionadas.join(',')}`
        : ''
      const res = await fetch(`${BACKEND}/api/puestos/buscar${params}`)
      const data = await res.json()
      setResultados(data)
      setBuscado(true)
    } catch {
      console.error('Error buscando puestos')
    } finally {
      setLoading(false)
    }
  }

  // Renderiza el árbol de checkboxes recursivamente
  const renderTree = (nodos, nivel = 0) => {
    return nodos.map(nodo => (
      <div key={nodo.id} style={{ marginLeft: nivel * 16 }}>
        <label className="checkbox-label">
          {nodo.children && nodo.children.length > 0 ? (
            // Nodo padre: expandible (solo checkbox sin seleccionar el padre en sí)
            <>
              <input
                type="checkbox"
                checked={seleccionadas.includes(nodo.id)}
                onChange={() => toggleCaracteristica(nodo.id)}
              />
              <strong>{nodo.nombre}</strong>
            </>
          ) : (
            // Nodo hoja: seleccionable
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
        </div>

        {/* Panel derecho: resultados */}
        <div className="buscar-resultados">
          <h3>Resultados</h3>

          {!buscado && (
            <p className="hint-msg">Seleccione características y presione Buscar.</p>
          )}

          {buscado && resultados.length === 0 && (
            <p className="empty-msg">No se encontraron puestos con esas características.</p>
          )}

          <div className="resultados-grid">
            {resultados.map(p => (
              <div key={p.id} className="resultado-card">
                <strong className="card-empresa">{p.empresa?.nombre}</strong>
                <p className="card-descripcion">{p.descripcion}</p>
                <p className="card-salario">₡ {p.salario?.toLocaleString('es-CR')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Buscar
