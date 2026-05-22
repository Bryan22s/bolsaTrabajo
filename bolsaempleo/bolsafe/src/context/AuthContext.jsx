import { createContext, useState, useContext } from 'react'

export const AuthContext = createContext()

/**
 * AuthProvider: envuelve la app y provee:
 *   - user: objeto { rol, nombre, id } o null
 *   - login(userData), logout()
 *   - loginModalOpen / setLoginModalOpen
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loginModalOpen, setLoginModalOpen] = useState(false)

  const login = (userData) => {
    setUser(userData)
    setLoginModalOpen(false)
  }

  const logout = () => {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loginModalOpen, setLoginModalOpen }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para consumir el contexto
export function useAuth() {
  return useContext(AuthContext)
}
