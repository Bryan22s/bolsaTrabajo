import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal'
import Home from './pages/Home'
import Buscar from './pages/Buscar'
import RegistroEmpresa from './pages/RegistroEmpresa'
import RegistroOferente from './pages/RegistroOferente'
import DashboardAdmin from './pages/dashboards/DashboardAdmin'
import DashboardEmpresa from './pages/dashboards/DashboardEmpresa'
import DashboardOferente from './pages/dashboards/DashboardOferente'

/**
 * RutaProtegida: redirige al Home si el usuario no está autenticado
 * o si no tiene el rol requerido.
 */
function RutaProtegida({ children, rolRequerido }) {
    const { user } = useAuth()

    if (!user) {
        return <Navigate to="/" replace />
    }

    if (rolRequerido && user.rol !== rolRequerido) {
        return <Navigate to="/" replace />
    }

    return children
}

function AppRoutes() {
    return (
        <>
            <Navbar />
            <LoginModal />

            <main className="main-content">
                <Routes>
                    {/* ── Rutas públicas ── */}
                    <Route path="/"                   element={<Home />} />
                    <Route path="/buscar"             element={<Buscar />} />
                    <Route path="/empresa/registro"   element={<RegistroEmpresa />} />
                    <Route path="/oferente/registro"  element={<RegistroOferente />} />

                    {/* ── Dashboards protegidos ── */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <RutaProtegida rolRequerido="ADMIN">
                                <DashboardAdmin />
                            </RutaProtegida>
                        }
                    />
                    <Route
                        path="/empresa/dashboard"
                        element={
                            <RutaProtegida rolRequerido="EMPRESA">
                                <DashboardEmpresa />
                            </RutaProtegida>
                        }
                    />
                    <Route
                        path="/oferente/dashboard"
                        element={
                            <RutaProtegida rolRequerido="OFERENTE">
                                <DashboardOferente />
                            </RutaProtegida>
                        }
                    />

                    {/* ── Ruta no encontrada ── */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </main>

            <Footer />
        </>
    )
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <AppRoutes />
            </BrowserRouter>
        </AuthProvider>
    )
}

export default App