import Modal from 'react-modal'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const modalStyles = {
    content: {
        width: '340px',
        height: 'auto',
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        transform: 'translate(-50%, -50%)',
        borderRadius: '8px',
        padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
    },
    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
}

const EMPTY_CREDS = { usuario: '', clave: '' }

function LoginModal() {
    const { loginModalOpen, setLoginModalOpen, login } = useAuth()
    const [creds, setCreds]     = useState(EMPTY_CREDS)
    const [error, setError]     = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setCreds({ ...creds, [e.target.name]: e.target.value })
        setError('')
    }

    const limpiar = () => {
        setCreds(EMPTY_CREDS)
        setError('')
    }

    const handleLogin = async () => {
        if (!creds.usuario || !creds.clave) {
            setError('Por favor complete todos los campos')
            return
        }
        setLoading(true)
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creds)
            })

            if (!response.ok) {
                const msg = response.status === 401 ? 'Usuario o clave incorrectos'
                    : response.status === 403 ? 'Su cuenta no ha sido aprobada aún'
                        : 'Error al iniciar sesión'
                setError(msg)
                return
            }

            const data = await response.json()
            const { token, ...userData } = data

            // Limpiar campos ANTES de cerrar para que no queden al reabrir
            limpiar()
            login(userData, token)

        } catch {
            setError('No se pudo conectar con el servidor')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setLoginModalOpen(false)
        limpiar()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleLogin()
    }

    return (
        <Modal
            isOpen={loginModalOpen}
            onRequestClose={handleClose}
            shouldCloseOnOverlayClick={true}
            style={modalStyles}
            contentLabel="Login"
        >
            <div className="modal-login">
                <div className="modal-header">
                    <span className="modal-icon">🔐</span>
                    <h3>Login</h3>
                </div>

                <div className="form-group">
                    <label htmlFor="usuario">Usuario (correo):</label>
                    <input
                        id="usuario"
                        name="usuario"
                        type="text"
                        value={creds.usuario}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="correo@empresa.com"
                        className="form-input"
                        autoComplete="off"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="clave">Clave:</label>
                    <input
                        id="clave"
                        name="clave"
                        type="password"
                        value={creds.clave}
                        onChange={handleChange}
                        onKeyDown={handleKeyDown}
                        placeholder="••••••••"
                        className="form-input"
                        autoComplete="new-password"
                    />
                </div>

                {error && <p className="error-msg">{error}</p>}

                <div className="modal-buttons">
                    <button className="btn btn-primary" onClick={handleLogin} disabled={loading}>
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                    <button className="btn btn-secondary" onClick={handleClose}>
                        Cancelar
                    </button>
                </div>

                <p className="login-hint">
                    <small>Admin: usuario <code>admin</code>, clave <code>admin123</code></small>
                </p>
            </div>
        </Modal>
    )
}

export default LoginModal