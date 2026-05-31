import { useState } from 'react'

const initialState = {
    cedulaJuridica: '',
    nombre: '',
    localizacion: '',
    correo: '',
    telefono: '',
    descripcion: '',
    clave: ''
}

function RegistroEmpresa() {
    const [empresa, setEmpresa] = useState(initialState)
    const [mensaje, setMensaje] = useState('')
    const [error, setError]     = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setEmpresa({ ...empresa, [e.target.name]: e.target.value })
        setError('')
        setMensaje('')
    }

    const handleSubmit = async () => {
        if (!empresa.cedulaJuridica || !empresa.nombre || !empresa.correo || !empresa.clave) {
            setError('Por favor complete los campos obligatorios (*).')
            return
        }

        setLoading(true)
        try {
            // URL relativa: el proxy de Vite redirige al backend en desarrollo,
            // y en producción frontend y backend corren en el mismo servidor
            const response = await fetch('/api/empresas/registro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(empresa)
            })

            if (response.status === 409) {
                setError('Ya existe una empresa registrada con esa cédula jurídica.')
                return
            }
            if (!response.ok) {
                setError('Error al registrar. Intente de nuevo.')
                return
            }

            setMensaje('✅ Registro exitoso. Su solicitud está pendiente de aprobación por el administrador.')
            setEmpresa(initialState)

        } catch {
            setError('No se pudo conectar con el servidor.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="registro-page">
            <h2 className="section-title">Registro de Empresa</h2>
            <p className="section-subtitle">
                Complete el formulario. Su cuenta será activada cuando el administrador la apruebe.
            </p>

            <div className="form-card">
                <div className="form-row">
                    <div className="form-group">
                        <label>Cédula Jurídica *</label>
                        <input name="cedulaJuridica" value={empresa.cedulaJuridica}
                               onChange={handleChange} placeholder="3-101-XXXXXX" className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>Nombre de la Empresa *</label>
                        <input name="nombre" value={empresa.nombre}
                               onChange={handleChange} placeholder="Nombre comercial" className="form-input" />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Correo Electrónico *</label>
                        <input name="correo" type="email" value={empresa.correo}
                               onChange={handleChange} placeholder="empresa@correo.com" className="form-input" />
                    </div>
                    <div className="form-group">
                        <label>Teléfono</label>
                        <input name="telefono" value={empresa.telefono}
                               onChange={handleChange} placeholder="2222-2222" className="form-input" />
                    </div>
                </div>

                <div className="form-group">
                    <label>Localización</label>
                    <input name="localizacion" value={empresa.localizacion}
                           onChange={handleChange} placeholder="Ciudad, Provincia" className="form-input" />
                </div>

                <div className="form-group">
                    <label>Descripción</label>
                    <textarea name="descripcion" value={empresa.descripcion}
                              onChange={handleChange} placeholder="Descripción de la empresa..."
                              className="form-input" rows={3} />
                </div>

                <div className="form-group">
                    <label>Clave de Acceso *</label>
                    <input name="clave" type="password" value={empresa.clave}
                           onChange={handleChange} placeholder="Contraseña para ingresar al sistema"
                           className="form-input" />
                </div>

                {error   && <p className="error-msg">{error}</p>}
                {mensaje && <p className="success-msg">{mensaje}</p>}

                <div className="form-actions">
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Registrando...' : 'Registrar Empresa'}
                    </button>
                    <button className="btn btn-secondary"
                            onClick={() => { setEmpresa(initialState); setError(''); setMensaje('') }}>
                        Limpiar
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RegistroEmpresa