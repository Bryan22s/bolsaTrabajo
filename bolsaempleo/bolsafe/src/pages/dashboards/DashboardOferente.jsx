import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { apiFetch, getToken } from '../../services/api'

function DashboardOferente() {
    const { user } = useAuth()
    const [tab, setTab] = useState('habilidades')

    const [habilidades, setHabilidades]         = useState([])
    const [loadingHab, setLoadingHab]           = useState(true)
    const [caracteristicas, setCaracteristicas] = useState([])
    const [caractSel, setCaractSel]             = useState('')
    const [nivelSel, setNivelSel]               = useState(1)
    const [savingHab, setSavingHab]             = useState(false)
    const [msgHab, setMsgHab]                   = useState('')

    const [curriculumUrl, setCurriculumUrl] = useState(null)
    const [uploading, setUploading]         = useState(false)
    const [msgCv, setMsgCv]                 = useState('')
    const fileRef = useRef(null)

    const [aplicaciones, setAplicaciones] = useState([])
    const [loadingApl, setLoadingApl]     = useState(false)

    useEffect(() => {
        fetchHabilidades()
        fetchOferenteInfo()
        fetchAplicaciones()
        apiFetch('/api/caracteristicas')
            .then(r => r.json())
            .then(setCaracteristicas)
            .catch(console.error)
    }, [])

    const fetchHabilidades = () => {
        setLoadingHab(true)
        apiFetch(`/api/oferentes/${user.id}/habilidades`)
            .then(r => r.json())
            .then(setHabilidades)
            .catch(console.error)
            .finally(() => setLoadingHab(false))
    }

    const fetchOferenteInfo = () => {
        apiFetch(`/api/oferentes/${user.id}`)
            .then(r => r.json())
            .then(data => setCurriculumUrl(data.curriculumUrl || null))
            .catch(console.error)
    }

    const fetchAplicaciones = () => {
        setLoadingApl(true)
        apiFetch(`/api/aplicaciones/oferente/${user.id}`)
            .then(r => r.json())
            .then(setAplicaciones)
            .catch(console.error)
            .finally(() => setLoadingApl(false))
    }

    const agregarHabilidad = async () => {
        if (!caractSel) return
        setSavingHab(true)
        setMsgHab('')
        try {
            await apiFetch(`/api/oferentes/${user.id}/habilidades`, {
                method: 'POST',
                body: JSON.stringify({
                    caracteristica: { id: parseInt(caractSel) },
                    nivel: parseInt(nivelSel)
                })
            })
            setCaractSel('')
            setNivelSel(1)
            setMsgHab('Habilidad agregada correctamente.')
            fetchHabilidades()
        } catch (err) {
            setMsgHab('Error: ' + err.message)
        } finally {
            setSavingHab(false)
        }
    }

    const eliminarHabilidad = async (habId) => {
        try {
            await apiFetch(`/api/oferentes/${user.id}/habilidades/${habId}`, { method: 'DELETE' })
            setHabilidades(prev => prev.filter(h => h.id !== habId))
        } catch (err) {
            alert('Error: ' + err.message)
        }
    }

    const subirCurriculum = async () => {
        const file = fileRef.current?.files[0]
        if (!file) return
        if (file.type !== 'application/pdf') {
            setMsgCv('Solo se permiten archivos PDF.')
            return
        }
        setUploading(true)
        setMsgCv('')
        try {
            const formData = new FormData()
            formData.append('file', file)
            const token = getToken()
            const response = await fetch(`/api/oferentes/${user.id}/curriculum`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            })
            if (!response.ok) throw new Error('Error al subir el archivo')
            const data = await response.json()
            setCurriculumUrl(data.curriculumUrl)
            setMsgCv('Curriculo subido correctamente.')
            if (fileRef.current) fileRef.current.value = ''
        } catch (err) {
            setMsgCv('Error al subir: ' + err.message)
        } finally {
            setUploading(false)
        }
    }

    const hojas = caracteristicas.filter(c =>
        !caracteristicas.some(h => h.padreId === c.id)
    )
    const idsAgregados = habilidades.map(h => h.caracteristica?.id)

    return (
        <div className="dashboard-page">
            <div className="dashboard-header">
                <div>
                    <h2 className="dashboard-title">{user.nombre}</h2>
                    <p className="dashboard-subtitle">Panel de Oferente</p>
                </div>
            </div>

            <div className="dash-tabs">
                <button className={`dash-tab ${tab === 'habilidades' ? 'active' : ''}`}
                        onClick={() => setTab('habilidades')}>
                    Mis Habilidades
                </button>
                <button className={`dash-tab ${tab === 'curriculum' ? 'active' : ''}`}
                        onClick={() => setTab('curriculum')}>
                    Mi Curriculo
                </button>
                <button className={`dash-tab ${tab === 'aplicaciones' ? 'active' : ''}`}
                        onClick={() => setTab('aplicaciones')}>
                    Mis Aplicaciones
                </button>
            </div>

            {tab === 'habilidades' && (
                <div className="dash-section">
                    <h3 className="dash-section-title">Mis habilidades y destrezas</h3>
                    <div className="form-card" style={{ marginBottom: 24 }}>
                        <h4>Agregar habilidad</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Habilidad</label>
                                <select className="form-input" value={caractSel}
                                        onChange={e => setCaractSel(e.target.value)}>
                                    <option value="">— Seleccione —</option>
                                    {hojas.filter(c => !idsAgregados.includes(c.id))
                                        .map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div className="form-group" style={{ maxWidth: 120 }}>
                                <label>Nivel (1-5)</label>
                                <input type="number" min="1" max="5" className="form-input"
                                       value={nivelSel} onChange={e => setNivelSel(e.target.value)} />
                            </div>
                            <div className="form-group" style={{ justifyContent: 'flex-end' }}>
                                <label>&nbsp;</label>
                                <button className="btn btn-primary"
                                        onClick={agregarHabilidad}
                                        disabled={savingHab || !caractSel}>
                                    {savingHab ? 'Guardando...' : '+ Agregar'}
                                </button>
                            </div>
                        </div>
                        {msgHab && <p className={msgHab.startsWith('Habilidad') ? 'success-msg' : 'error-msg'}>{msgHab}</p>}
                    </div>

                    {loadingHab && <p className="loading-msg">Cargando habilidades...</p>}
                    {!loadingHab && habilidades.length === 0 && <p className="empty-msg">Aun no ha registrado habilidades.</p>}
                    {!loadingHab && habilidades.length > 0 && (
                        <div className="table-wrapper">
                            <table className="dash-table">
                                <thead><tr><th>Habilidad</th><th>Nivel</th><th>Accion</th></tr></thead>
                                <tbody>
                                {habilidades.map(h => (
                                    <tr key={h.id}>
                                        <td>{h.caracteristica?.nombre}</td>
                                        <td>
                                            <div className="nivel-bar">
                                                {[1,2,3,4,5].map(n => (
                                                    <span key={n} className={`nivel-dot ${n <= h.nivel ? 'active' : ''}`} />
                                                ))}
                                                <span style={{ marginLeft: 6, fontSize: '0.85rem' }}>{h.nivel}/5</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button className="btn-table-danger" onClick={() => eliminarHabilidad(h.id)}>
                                                Quitar
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

            {tab === 'curriculum' && (
                <div className="dash-section">
                    <h3 className="dash-section-title">Mi Curriculo (PDF)</h3>
                    <div className="form-card">
                        {curriculumUrl ? (
                            <div className="cv-actual">
                                <div>
                                    <p><strong>Curriculo actual:</strong></p>
                                    <a href={curriculumUrl} target="_blank" rel="noreferrer" className="cv-link">
                                        Ver / Descargar mi curriculo
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <p className="empty-msg">Aun no ha subido un curriculo.</p>
                        )}

                        <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' }} />
                        <h4>{curriculumUrl ? 'Reemplazar curriculo' : 'Subir curriculo'}</h4>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                            Solo se aceptan archivos PDF. Si ya tiene uno, sera reemplazado.
                        </p>
                        <div className="form-group">
                            <label>Seleccionar archivo PDF</label>
                            <input ref={fileRef} type="file" accept="application/pdf" className="form-input" />
                        </div>
                        {msgCv && <p className={msgCv.startsWith('Curriculo') ? 'success-msg' : 'error-msg'}>{msgCv}</p>}
                        <div className="form-actions">
                            <button className="btn btn-primary" onClick={subirCurriculum} disabled={uploading}>
                                {uploading ? 'Subiendo...' : 'Subir PDF'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {tab === 'aplicaciones' && (
                <div className="dash-section">
                    <h3 className="dash-section-title">Mis aplicaciones</h3>
                    {loadingApl && <p className="loading-msg">Cargando...</p>}
                    {!loadingApl && aplicaciones.length === 0 && (
                        <p className="empty-msg">Aun no ha aplicado a ningun puesto.</p>
                    )}
                    {!loadingApl && aplicaciones.length > 0 && (
                        <div className="table-wrapper">
                            <table className="dash-table">
                                <thead>
                                <tr>
                                    <th>Empresa</th>
                                    <th>Descripcion</th>
                                    <th>Salario</th>
                                    <th>Fecha de aplicacion</th>
                                </tr>
                                </thead>
                                <tbody>
                                {aplicaciones.map(a => (
                                    <tr key={a.id}>
                                        <td>{a.puesto?.empresa?.nombre}</td>
                                        <td>{a.puesto?.descripcion}</td>
                                        <td>₡ {a.puesto?.salario?.toLocaleString('es-CR')}</td>
                                        <td>{new Date(a.fechaAplicacion).toLocaleDateString('es-CR')}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default DashboardOferente