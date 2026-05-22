import { NavLink } from 'react-router'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout, setLoginModalOpen } = useAuth()

  return (
    <nav className="navbar">
      {/* Logo / inicio */}
      <NavLink to="/" className="nav-brand">
        <span className="brand-icon">💼</span>
        BolsaEmpleo
      </NavLink>

      {/* Links de navegación */}
      <div className="nav-links">
        <NavLink to="/buscar"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Buscar
        </NavLink>

        <NavLink to="/empresa/registro"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Empresa
        </NavLink>

        <NavLink to="/oferente/registro"
          className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Oferente
        </NavLink>

        {/* Si no está logueado: botón Login */}
        {!user && (
          <button className="nav-link btn-login" onClick={() => setLoginModalOpen(true)}>
            Login
          </button>
        )}

        {/* Si está logueado: muestra nombre, rol y botón Salir */}
        {user && (
          <div className="nav-user">
            <span className="nav-user-info">
              <strong>{user.nombre}</strong>
              <small>({user.rol})</small>
            </span>
            <button className="btn-logout" onClick={logout}>Salir</button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
