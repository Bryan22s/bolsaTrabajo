import { NavLink } from 'react-router'
import { useAuth } from '../context/AuthContext'

function Navbar() {
    const { user, logout, setLoginModalOpen } = useAuth()

    // Ruta del dashboard según el rol del usuario
    const dashboardPath =
        user?.rol === 'ADMIN'    ? '/admin/dashboard'    :
            user?.rol === 'EMPRESA'  ? '/empresa/dashboard'  :
                user?.rol === 'OFERENTE' ? '/oferente/dashboard' : null

    return (
        <nav className="navbar">
            <NavLink to="/" className="nav-brand">
                <span className="brand-icon">💼</span>
                BolsaEmpleo
            </NavLink>

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

                {/* Sin login: botón Login */}
                {!user && (
                    <button className="nav-link btn-login" onClick={() => setLoginModalOpen(true)}>
                        Login
                    </button>
                )}

                {/* Con login: Dashboard + nombre + Salir */}
                {user && (
                    <div className="nav-user">
                        <NavLink
                            to={dashboardPath}
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            🏠 Mi Panel
                        </NavLink>
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