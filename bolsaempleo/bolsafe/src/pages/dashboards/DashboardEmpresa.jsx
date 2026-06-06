import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../services/api'

function DashboardEmpresa() {
    const { user } = useAuth()
    const [tab, setTab] = useState('puestos')

    const [misPuestos, setMisPuestos]           = useState([])
    const [loadingPuestos, setLoadingPuestos]   = useState(true)
    const [caracteristicas, setCaracteristicas] = useState([])
    const [nuevoPuesto, setNuevoPuesto]         = useState({ descripcion: '', salario: '', tipo: 'PUBLICO' })
    const [requisitos, setRequisitos]           = useState([])
    const [caractSel, setCaractSel]             = useState('')
    const [nivelSel, setNivelSel]               = useState(1)
    const [savingPuesto, setSavingPuesto]       = useState(false)
    const [msgPuesto, setMsgPuesto]             = useState('')
    const [buscarCaracts, setBuscarCaracts]     = useState([])
    const [candidatos, setCandidatos]           = useState([])
    const [buscado, setBuscado]                 = useState(false)
    const [loadingCand, setLoadingCand]         = useState(false)

    const [puestoSelApl, setPuestoSelApl] = useState('')
    const [aplicantes, setAplicantes]     = useState([])
    const [loadingApl, setLoadingApl]     = useState(false)

    const buscarCandidatos = useCallback(async (filtros = buscarCaracts) => {
        setLoadingCand(true)
        setBuscado(true)
        try {
            const params = filtros.length > 0 ? `?caracteristicaIds=${filtros.join(',')}` : ''
            const res  = await apiFetch(`/api/oferentes/buscar${params}`)
            const data = await res.json()
            setCandidatos(data)
        } catch (err) { alert('Error: ' + err.message) }
        finally { setLoadingCand(false) }
    }, [buscarCaracts])

    useEffect(() => {
        fetchMisPuestos()
        apiFetch('/api/caracteristicas').then(r => r.json()).then(setCaracteristicas).catch(console.error)
        buscarCandidatos([])
    }, [])

    const fetchMisPuestos = () => {
        setLoadingPuestos(true)
        apiFetch('/api/puestos/todos')
            .then(r => r.json())
            .then(data => setMisPuestos(data.filter(p => p.empresa?.cedulaJuridica === user.id)))
            .catch(console.error)
            .finally(() => setLoadingPuestos(false))
    }

    const desactivarPuesto = async (id) => {
        if (!confirm('Desactivar este puesto?')) return
        try {
            await apiFetch(`/api/puestos/${id}/desactivar`, { method: 'PUT' })
            setMisPuestos(prev => prev.map(p => p.id === id ? { ...p, activo: false } : p))
        } catch (err) { alert('Error: ' + err.message) }
    }

    const agregarRequisito = () => {
        if (!caractSel) return
        if (requisitos.find(r => r.caractId === parseInt(caractSel))) return
        const caract = caracteristicas.find(c => c.id === parseInt(caractSel))
        setRequisitos(prev => [...prev, { caractId: parseInt(caractSel), nombre: caract?.nombre || '', nivel: parseInt(nivelSel) }])
        setCaractSel('')
        setNivelSel(1)
    }

    const quitarRequisito = (caractId) => setRequisitos(prev => prev.filter(r => r.caractId !== caractId))

    const publicarPuesto = async () => {
        if (!nuevoPuesto.descripcion.trim() || !nuevoPuesto.salario) {
            setMsgPuesto('Complete la descripcion y el salario.')
            return
        }
        setSavingPuesto(true)
        setMsgPuesto('')
        try {
            const body = {
                empresa: { cedulaJuridica: user.id },
                descripcion: nuevoPuesto.descripcion.trim(),
                salario: parseFloat(nuevoPuesto.salario),
                tipo: nuevoPuesto.tipo,
                caracteristicas: requisitos.map(r => ({ caracteristica: { id: r.caractId }, nivel: r.nivel }))
            }
            await apiFetch('/api/puestos', { method: 'POST', body: JSON.stringify(body) })
            setMsgPuesto('Puesto publicado correctamente.')
            setNuevoPuesto({ descripcion: '', salario: '', tipo: 'PUBLICO' })
            setRequisitos([])
            fetchMisPuestos()
        } catch (err) {
            setMsgPuesto('Error al publicar: ' + err.message)
        } finally {
            setSavingPuesto(false)
        }
    }

    const toggleBuscarCaract = (id) => setBuscarCaracts(prev =>
        prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])

    const verAplicantes = async () => {
        if (!puestoSelApl) return
        setLoadingApl(true)
        try {
            const res  = await apiFetch(`/api/aplicaciones/puesto/${puestoSelApl}`)
            const data = await res.json()
            setAplicantes(data)
        } catch (err) { alert('Error: ' + err.message) }
        finally { setLoadingApl(false) }
    }

    const hojas = caracteristicas.filter(c => !caracteristicas.some(h => h.padreId === c.id))

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h2 className="dashboard-title">{user.nombre}</h2>
                    <p className="dashboard-subtitle">Panel de Empresa</p>
                </div>
            </div>

            <div className="dash-tabs">
                <button className={`dash-tab ${tab === 'puestos' ? 'active' : ''}`} onClick={() => setTab('puestos')}>Mis Puestos</button>
                <button className={`dash-tab ${tab === 'publicar' ? 'active' : ''}`} onClick={() => setTab('publicar')}>Publicar Puesto</button>
                <button className={`dash-tab ${tab === 'candidatos' ? 'active' : ''}`} onClick={() => setTab('candidatos')}>Buscar Candidatos</button>
                <button className={`dash-tab ${tab === 'aplicantes' ? 'active' : ''}`} onClick={() => setTab('aplicantes')}>Aplicantes</button>
            </div>

            {tab === 'puestos' && (
                <div className="dash-section">
                    <h3 className="dash-section-title">Mis puestos publicados</h3>
                    {loadingPuestos && <p className="loading-msg">Cargando...</p>}
                    {!loadingPuestos && misPuestos.length === 0 && <p className="empty-msg">No ha publicado puestos aun.</p>}
                    {!loadingPuestos && misPuestos.length > 0 && (
                        <div className="table-wrapper">
                            <table className="dash-table">
                                <thead><tr><th>Descripcion</th><th>Salario</th><th>Tipo</th><th>Estado</th><th>Accion</th></tr></thead>
                                <tbody>
                                {misPuestos.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.descripcion}</td>
                                        <td>₡ {p.salario?.toLocaleString('es-CR')}</td>
                                        <td><span className={`badge-tipo ${p.tipo?.toLowerCase()}`}>{p.tipo}</span></td>
                                        <td><span className={p.activo ? 'badge-activo' : 'badge-inactivo'}>{p.activo ? 'Activo' : 'Inactivo'}</span></td>
                                        <td>{p.activo && <button className="btn-table-danger" onClick={() => desactivarPuesto(p.id)}>Desactivar</button>}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {tab === 'publicar' && (
                <div className="dash-section">
                    <h3 className="dash-section-title">Publicar nuevo puesto</h3>
                    <div className="form-card">
                        <div className="form-group">
                            <label>Descripcion del puesto *</label>
                            <input className="form-input" value={nuevoPuesto.descripcion}
                                   onChange={e => setNuevoPuesto({ ...nuevoPuesto, descripcion: e.target.value })}
                                   placeholder="Ej: Desarrollador Full Stack Java/React" />
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Salario (₡) *</label>
                                <input type="number" className="form-input" value={nuevoPuesto.salario}
                                       onChange={e => setNuevoPuesto({ ...nuevoPuesto, salario: e.target.value })}
                                       placeholder="1500000" />
                            </div>
                            <div className="form-group">
                                <label>Tipo de publicacion</label>
                                <select className="form-input" value={nuevoPuesto.tipo}
                                        onChange={e => setNuevoPuesto({ ...nuevoPuesto, tipo: e.target.value })}>
                                    <option value="PUBLICO">Publico (visible para todos)</option>
                                    <option value="PRIVADO">Privado (solo oferentes aprobados)</option>
                                </select>
                            </div>
                        </div>
                        <div className="requisitos-section">
                            <h4>Caracteristicas requeridas</h4>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Caracteristica</label>
                                    <select className="form-input" value={caractSel} onChange={e => setCaractSel(e.target.value)}>
                                        <option value="">— Seleccione —</option>
                                        {hojas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="form-group" style={{ maxWidth: 120 }}>
                                    <label>Nivel (1-5)</label>
                                    <input type="number" min="1" max="5" className="form-input"
                                           value={nivelSel} onChange={e => setNivelSel(e.target.value)} />
                                </div>
                                <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                                    <label>&nbsp;</label>
                                    <button className="btn btn-secondary" onClick={agregarRequisito} disabled={!caractSel}>+ Agregar</button>
                                </div>
                            </div>
                            {requisitos.length > 0 && (
                                <ul className="requisitos-list">
                                    {requisitos.map(r => (
                                        <li key={r.caractId} className="requisito-item">
                                            <span>{r.nombre} — Nivel {r.nivel}</span>
                                            <button className="btn-remove" onClick={() => quitarRequisito(r.caractId)}>X</button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        {msgPuesto && <p className={msgPuesto.startsWith('Puesto') ? 'success-msg' : 'error-msg'}>{msgPuesto}</p>}
                        <div className="form-actions">
                            <button className="btn btn-primary" onClick={publicarPuesto} disabled={savingPuesto}>
                                {savingPuesto ? 'Publicando...' : 'Publicar Puesto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'candidatos' && (
                <div className="dash-section">
                    <h3 className="dash-section-title">Buscar candidatos por habilidades</h3>
                    <div className="buscar-layout">
                        <div className="buscar-filtros">
                            <h4>Filtrar por habilidades</h4>
                            <div className="caracteristicas-tree">
                                {hojas.map(c => (
                                    <label key={c.id} className="checkbox-label">
                                        <input type="checkbox" checked={buscarCaracts.includes(c.id)}
                                               onChange={() => toggleBuscarCaract(c.id)} />
                                        {c.nombre}
                                    </label>
                                ))}
                            </div>
                            <button className="btn btn-primary btn-buscar" onClick={() => buscarCandidatos()} disabled={loadingCand}>
                                {loadingCand ? 'Buscando...' : 'Buscar'}
                            </button>
                        </div>
                        <div className="buscar-resultados">
                            <h4>Candidatos encontrados</h4>
                            {loadingCand && <p className="loading-msg">Cargando...</p>}
                            {!loadingCand && buscado && candidatos.length === 0 && <p className="empty-msg">No se encontraron candidatos.</p>}
                            <div className="candidatos-grid">
                                {candidatos.map(o => (
                                    <div key={o.cedula} className="candidato-card">
                                        <div className="candidato-info">
                                            <strong>{o.nombre} {o.primerApellido}</strong>
                                            <small>{o.correo}</small>
                                            <small>{o.lugarResidencia || '—'}</small>
                                        </div>
                                        {o.curriculumUrl && (
                                            <a href={o.curriculumUrl} target="_blank" rel="noreferrer" className="btn-cv">
                                                Ver CV
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'aplicantes' && (
                <div className="dash-section">
                    <h3 className="dash-section-title">Ver aplicantes por puesto</h3>
                    <div className="form-card">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Seleccionar puesto</label>
                                <select className="form-input" value={puestoSelApl}
                                        onChange={e => { setPuestoSelApl(e.target.value); setAplicantes([]) }}>
                                    <option value="">— Seleccione un puesto —</option>
                                    {misPuestos.map(p => (
                                        <option key={p.id} value={p.id}>{p.descripcion}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                                <label>&nbsp;</label>
                                <button className="btn btn-primary" onClick={verAplicantes}
                                        disabled={!puestoSelApl || loadingApl}>
                                    {loadingApl ? 'Cargando...' : 'Ver aplicantes'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {puestoSelApl && !loadingApl && aplicantes.length === 0 && (
                        <p className="empty-msg">Nadie ha aplicado a este puesto aun.</p>
                    )}

                    {aplicantes.length > 0 && (
                        <div className="candidatos-grid" style={{ marginTop: 16 }}>
                            {aplicantes.map(a => (
                                <div key={a.id} className="candidato-card">
                                    <div className="candidato-info">
                                        <strong>{a.oferente?.nombre} {a.oferente?.primerApellido}</strong>
                                        <small>{a.oferente?.correo}</small>
                                        <small>{a.oferente?.lugarResidencia || '—'}</small>
                                        <small style={{ color: 'var(--text-muted)' }}>
                                            Aplico: {new Date(a.fechaAplicacion).toLocaleDateString('es-CR')}
                                        </small>
                                    </div>
                                    {a.oferente?.curriculumUrl && (
                                        <a href={a.oferente.curriculumUrl} target="_blank"
                                           rel="noreferrer" className="btn-cv">
                                            Ver CV
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default DashboardEmpresa