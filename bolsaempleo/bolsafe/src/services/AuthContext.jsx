import { createContext, useState, useContext, useEffect } from 'react'
import { saveToken, removeToken, getToken } from '../services/api'

export const AuthContext = createContext()

/**
 * AuthProvider: envuelve la app y provee:
 *   - user: objeto { rol, nombre, id } o null
 *   - token: el JWT string o null
 *   - login(userData, token), logout()
 *   - loginModalOpen / setLoginModalOpen
 *
 * Persiste la sesión en localStorage: al recargar la página
 * el usuario sigue autenticado mientras el token no expire.
 */
export function AuthProvider({ children }) {
    const [user, setUser]                     = useState(null)
    const [loginModalOpen, setLoginModalOpen] = useState(false)

    /**
     * Al montar el componente, intentar restaurar la sesión
     * desde localStorage (token + datos guardados).
     */
    useEffect(() => {
        const savedToken = getToken()
        const savedUser  = localStorage.getItem('user')

        if (savedToken && savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch {
                // Si el JSON está corrupto, limpiar
                removeToken()
                localStorage.removeItem('user')
            }
        }
    }, [])

    /**
     * login: guarda el token en localStorage y el usuario en el estado.
     * @param {Object} userData  { rol, nombre, id }
     * @param {string} token     el JWT string
     */
    const login = (userData, token) => {
        saveToken(token)
        localStorage.setItem('user', JSON.stringify(userData))
        setUser(userData)
        setLoginModalOpen(false)
    }

    /**
     * logout: limpia el token y el estado.
     */
    const logout = () => {
        removeToken()
        localStorage.removeItem('user')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            loginModalOpen,
            setLoginModalOpen
        }}>
            {children}
        </AuthContext.Provider>
    )
}

/** Hook personalizado para consumir el contexto */
export function useAuth() {
    return useContext(AuthContext)
}