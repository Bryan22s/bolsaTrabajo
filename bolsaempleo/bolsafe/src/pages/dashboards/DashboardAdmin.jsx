import { useState, useEffect } from 'react'
import { apiFetch } from '../../services/api'

/**
 * DashboardAdmin: tablero del administrador.
 *
 * Secciones:
 *  1. Empresas pendientes de aprobación
 *  2. Oferentes pendientes de aprobación
 *  3. Gestión del catálogo jerárquico de características
 */
function DashboardAdmin() {
    // ── Estado: empresas pendientes ─────────────────────────────────────
    const [empresas, setEmpresas]       = useState([])
    const [loadingEmp, setLoadingEmp]   = useState(true)

    // ── Estado: oferentes pendientes ────────────────────────────────────
    const [oferentes, setOferentes]     = useState([])
    const [loadingOfer, setLoadingOfer] = useState(true)

    // ── Estado: características ──────────────────────────────────────────
    const [caracteristicas, setCaracteristicas]   = useState([])
    const [loadingCaract, setLoadingCaract]        = useState(true)
    const [nuevaNombre, setNuevaNombre]            = useState('')
    const [nuevoPadreId, setNuevoPadreId]          = useState('')
    const [savingCaract, setSavingCaract]          = useState(false)
    const [msgCaract, setMsgCaract]                = useState('')

    // ── Pestaña activa ───────────────────────────────────────────────────
    const [tab, setTab] = useState('empresas')

    // ── Carga inicial ────────────────────────────────────────────────────
    useEffect(() => { fetchEmpresas()    }, [])
    useEffect(() => { fetchOferentes()   }, [])
    useEffect(() => { fetchCaract()      }, [])

    const fetchEmpresas = () => {
        setLoadingEmp(true)
        apiFetch('/api/empresas/pendientes')
            .then(r => r.json())
            .then(setEmpresas)
            .catch(console.error)
            .finally(() => setLoadingEmp(false))
    }

    const fetchOferentes = () => {
        setLoadingOfer(true)
        apiFetch('/api/oferentes/pendientes')
            .then(r => r.json())
            .then(setOferentes)
            .catch(console.error)
            .finally(() => setLoadingOfer(false))
    }

    const fetchCaract = () => {
        setLoadingCaract(true)
        apiFetch('/api/caracteristicas')
            .then(r => r.json())
            .then(setCaracteristicas)
            .catch(console.error)
            .finally(() => setLoadingCaract(false))
    }

    // ── Aprobar empresa ──────────────────────────────────────────────────
    const aprobarEmpresa = async (cedula) => {
        try {
            await apiFetch(`/api/empresas/${cedula}/aprobar`, { method: 'PUT' })
            setEmpresas(prev => prev.filter(e => e.cedulaJuridica !== cedula))
        } catch (err) {
            alert('Error al aprobar: ' + err.message)
        }
    }

    // ── Aprobar oferente ─────────────────────────────────────────────────
    const aprobarOferente = async (cedula) => {
        try {
            await apiFetch(`/api/oferentes/${cedula}/aprobar`, { method: 'PUT' })
            setOferentes(prev => prev.filter(o => o.cedula !== cedula))
        } catch (err) {
            alert('Error al aprobar: ' + err.message)
        }
    }

    // ── Crear característica ─────────────────────────────────────────────
    const crearCaracteristica = async () => {
        if (!nuevaNombre.trim()) return
        setSavingCaract(true)
        setMsgCaract('')
        try {
            const body = {
                nombre: nuevaNombre.trim(),
                ...(nuevoPadreId ? { padre: { id: parseInt(nuevoPadreId) } } : {})
            }
            await apiFetch('/api/caracteristicas', {
                method: 'POST',
                body: JSON.stringify(body)
            })
            setNuevaNombre('')
            setNuevoPadreId('')
            setMsgCaract('✅ Característica creada correctamente.')
            fetchCaract()
        } catch (err) {
            setMsgCaract('❌ Error: ' + err.message)
        } finally {
            setSavingCaract(false)
        }
    }

    // ── Eliminar característica ──────────────────────────────────────────
    const eliminarCaracteristica = async (id, nombre) => {
        if (!confirm(`¿Eliminar "${nombre}"? Esto también eliminará sus hijos.`)) return
        try {
            await apiFetch(`/api/caracteristicas/${id}`, { method: 'DELETE' })
            fetchCaract()
        } catch (err) {
            alert('Error al eliminar: ' + err.message)
        }
    }

    // ── Árbol de características (para selector de padre) ────────────────
    const buildTree = (items, parentId = null) =>
        items
            .filter(i => i.padreId === parentId)
            .map(i => ({ ...i, children: buildTree(items, i.id) }))

    const renderTreeRows = (nodos, nivel = 0) =>
        nodos.flatMap(nodo => [
            <tr key={nodo.id} className="caract-row">
                <td style={{ paddingLeft: nivel * 20 + 10 }}>
                    {'— '.repeat(nivel)}{nodo.nombre}
                </td>
                <td className="caract-level">{nodo.padreId ? 'Sub-categoría' : 'Categoría raíz'}</td>
                <td>
                    <button
                        className="btn-table-danger"
                        onClick={() => eliminarCaracteristica(nodo.id, nodo.nombre)}>
                        Eliminar
                    </button>
                </td>
            </tr>,
            ...renderTreeRows(nodo.children, nivel + 1)
        ])

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <span className="dashboard-icon">🛡️</span>
                <div>
                    <h2 className="dashboard-title">Panel de Administración</h2>
                    <p className="dashboard-subtitle">Gestión de usuarios y catálogo del sistema</p>
                </div>
            </div>

            {/* Pestañas */}
            <div className="dash-tabs">
                <button
                    className={`dash-tab ${tab === 'empresas' ? 'active' : ''}`}
                    onClick={() => setTab('empresas')}>
                    🏢 Empresas pendientes
                    {empresas.length > 0 && <span className="badge">{empresas.length}</span>}
                </button>
                <button
                    className={`dash-tab ${tab === 'oferentes' ? 'active' : ''}`}
                    onClick={() => setTab('oferentes')}>
                    👤 Oferentes pendientes
                    {oferentes.length > 0 && <span className="badge">{oferentes.length}</span>}
                </button>
                <button
                    className={`dash-tab ${tab === 'caracteristicas' ? 'active' : ''}`}
                    onClick={() => setTab('caracteristicas')}>
                    🏷️ Características
                </button>
            </div>

            {/* ── TAB: EMPRESAS PENDIENTES ── */}
            {tab === 'empresas' && (
                <div className="dash-section">
                    <h3 className="dash-section-title">Empresas pendientes de aprobación</h3>
                    {loadingEmp && <p className="loading-msg">Cargando...</p>}
                    {!loadingEmp && empresas.length === 0 && (
                        <p className="empty-msg">✅ No hay empresas pendientes.</p>
                    )}
                    {!loadingEmp && empresas.length > 0 && (
                        <div className="table-wrapper">
                            <table className="dash-table">
                                <thead>
                                <tr>
                                    <th>Cédula Jurídica</th>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Teléfono</th>
                                    <th>Localización</th>
                                    <th>Acción</th>
                                </tr>
                                </thead>
                                <tbody>
                                {empresas.map(e => (
                                    <tr key={e.cedulaJuridica}>
                                        <td><code>{e.cedulaJuridica}</code></td>
                                        <td>{e.nombre}</td>
                                        <td>{e.correo}</td>
                                        <td>{e.telefono || '—'}</td>
                                        <td>{e.localizacion || '—'}</td>
                                        <td>
                                            <button
                                                className="btn-table-success"
                                                onClick={() => aprobarEmpresa(e.cedulaJuridica)}>
                                                ✅ Aprobar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB: OFERENTES PENDIENTES ── */}
            {tab === 'oferentes' && (
                <div className="dash-section">
                    <h3 className="dash-section-title">Oferentes pendientes de aprobación</h3>
                    {loadingOfer && <p className="loading-msg">Cargando...</p>}
                    {!loadingOfer && oferentes.length === 0 && (
                        <p className="empty-msg">✅ No hay oferentes pendientes.</p>
                    )}
                    {!loadingOfer && oferentes.length > 0 && (
                        <div className="table-wrapper">
                            <table className="dash-table">
                                <thead>
                                <tr>
                                    <th>Cédula</th>
                                    <th>Nombre</th>
                                    <th>Correo</th>
                                    <th>Teléfono</th>
                                    <th>Residencia</th>
                                    <th>Acción</th>
                                </tr>
                                </thead>
                                <tbody>
                                {oferentes.map(o => (
                                    <tr key={o.cedula}>
                                        <td><code>{o.cedula}</code></td>
                                        <td>{o.nombre} {o.primerApellido}</td>
                                        <td>{o.correo}</td>
                                        <td>{o.telefono || '—'}</td>
                                        <td>{o.lugarResidencia || '—'}</td>
                                        <td>
                                            <button
                                                className="btn-table-success"
                                                onClick={() => aprobarOferente(o.cedula)}>
                                                ✅ Aprobar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ── TAB: CARACTERÍSTICAS ── */}
            {tab === 'caracteristicas' && (
                <div className="dash-section">
                    <h3 className="dash-section-title">Catálogo de Características</h3>

                    {/* Formulario para agregar */}
                    <div className="caract-form">
                        <h4>Agregar nueva característica</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Nombre *</label>
                                <input
                                    className="form-input"
                                    value={nuevaNombre}
                                    onChange={e => setNuevaNombre(e.target.value)}
                                    placeholder="Ej: React, Java, MySQL..."
                                />
                            </div>
                            <div className="form-group">
                                <label>Categoría padre (opcional)</label>
                                <select
                                    className="form-input"
                                    value={nuevoPadreId}
                                    onChange={e => setNuevoPadreId(e.target.value)}>
                                    <option value="">— Raíz (sin padre) —</option>
                                    {caracteristicas
                                        .filter(c => c.padreId === null)
                                        .map(c => (
                                            <option key={c.id} value={c.id}>{c.nombre}</option>
                                        ))}
                                </select>
                            </div>
                        </div>
                        {msgCaract && (
                            <p className={msgCaract.startsWith('✅') ? 'success-msg' : 'error-msg'}>
                                {msgCaract}
                            </p>
                        )}
                        <button
                            className="btn btn-primary"
                            onClick={crearCaracteristica}
                            disabled={savingCaract || !nuevaNombre.trim()}>
                            {savingCaract ? 'Guardando...' : 'Agregar Característica'}
                        </button>
                    </div>

                    {/* Tabla árbol */}
                    {loadingCaract && <p className="loading-msg">Cargando...</p>}
                    {!loadingCaract && (
                        <div className="table-wrapper" style={{ marginTop: 20 }}>
                            <table className="dash-table">
                                <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Tipo</th>
                                    <th>Acción</th>
                                </tr>
                                </thead>
                                <tbody>
                                {renderTreeRows(buildTree(caracteristicas))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default DashboardAdmin