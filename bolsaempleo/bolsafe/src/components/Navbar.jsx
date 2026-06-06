import { NavLink } from 'react-router'
import { useAuth } from '../context/AuthContext'

function Navbar() {
    const { user, logout, setLoginModalOpen } = useAuth()

    const dashboardPath =
        user?.rol === 'ADMIN'    ? '/admin/dashboard'    :
            user?.rol === 'EMPRESA'  ? '/empresa/dashboard'  :
                user?.rol === 'OFERENTE' ? '/oferente/dashboard' : null

    return (
        <nav className="navbar">
            <NavLink to="/" className="nav-brand">
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

                {!user && (
                    <button className="nav-link btn-login" onClick={() => setLoginModalOpen(true)}>
                        Login
                    </button>
                )}

                {user && (
                    <div className="nav-user">
                        <NavLink
                            to={dashboardPath}
                            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                            Mi Panel
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