import { useState } from 'react'

const initialState = {
    cedula: '',
    nombre: '',
    primerApellido: '',
    nacionalidad: '',
    telefono: '',
    correo: '',
    lugarResidencia: '',
    clave: ''
}

function RegistroOferente() {
    const [oferente, setOferente] = useState(initialState)
    const [mensaje, setMensaje]   = useState('')
    const [error, setError]       = useState('')
    const [loading, setLoading]   = useState(false)

    const handleChange = (e) => {
        setOferente({ ...oferente, [e.target.name]: e.target.value })
        setError('')
        setMensaje('')
    }

    const handleSubmit = async () => {
        if (!oferente.cedula || !oferente.nombre || !oferente.primerApellido ||
            !oferente.correo || !oferente.clave) {
            setError('Por favor complete los campos obligatorios (*).')
            return
        }

        setLoading(true)
        try {
            // URL relativa: funciona en desarrollo (proxy Vite) y producción
            const response = await fetch('/api/oferentes/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(oferente)
            })

            if (response.status === 409) {
                setError('Ya existe un oferente registrado con esa cédula.')
                return
            }
            if (!response.ok) {
                setError('Error al registrar. Intente de nuevo.')
                return
            }

            setMensaje('Registro exitoso. Su solicitud está pendiente de aprobación por el administrador.')
            setOferente(initialState)

        } catch {
            setError('No se pudo conectar con el servidor.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="registro-page">
            <h2 className="section-title">Registro de Oferente</h2>
            <p className="section-subtitle">
                Complete el formulario. Su cuenta será activada cuando el administrador la apruebe.
            </p>

            <div className="form-card">
                <div className="form-row">
                    <div className="form-group">
                        <label>Cédula *</label>
                        <input name="cedula" value={oferente.cedula}
                               onChange={handleChange} placeholder="1-XXXX-XXXX" className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>Nombre *</label>
                        <input name="nombre" value={oferente.nombre}
                               onChange={handleChange} placeholder="Nombre" className="form-input" />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Primer Apellido *</label>
                        <input name="primerApellido" value={oferente.primerApellido}
                               onChange={handleChange} placeholder="Primer apellido" className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>Nacionalidad</label>
                        <input name="nacionalidad" value={oferente.nacionalidad}
                               onChange={handleChange} placeholder="Costarricense" className="form-input" />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Correo Electrónico *</label>
                        <input name="correo" type="email" value={oferente.correo}
                               onChange={handleChange} placeholder="correo@ejemplo.com" className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>Teléfono</label>
                        <input name="telefono" value={oferente.telefono}
                               onChange={handleChange} placeholder="8888-8888" className="form-input" />
                    </div>
                </div>

                <div className="form-group">
                    <label>Lugar de Residencia</label>
                    <input name="lugarResidencia" value={oferente.lugarResidencia}
                           onChange={handleChange} placeholder="Ciudad, Provincia" className="form-input" />
                </div>

                <div className="form-group">
                    <label>Clave de Acceso *</label>
                    <input name="clave" type="password" value={oferente.clave}
                           onChange={handleChange} placeholder="Contraseña para ingresar al sistema"
                           className="form-input" />
                </div>

                {error   && <p className="error-msg">{error}</p>}
                {mensaje && <p className="success-msg">{mensaje}</p>}

                <div className="form-actions">
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrar Oferente'}
                    </button>
                    <button className="btn btn-secondary"
                            onClick={() => { setOferente(initialState); setError(''); setMensaje('') }}>
                        Limpiar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RegistroOferente