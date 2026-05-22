import { BrowserRouter, Routes, Route } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal'
import Home from './pages/Home'
import Buscar from './pages/Buscar'
import RegistroEmpresa from './pages/RegistroEmpresa'
import RegistroOferente from './pages/RegistroOferente'

function App() {
  return (
    // AuthProvider: da acceso al estado de autenticación a toda la app
    <AuthProvider>
      <BrowserRouter>
        {/* Navbar con el link de Login */}
        <Navbar />

        {/* Modal de login (global, aparece sobre cualquier página) */}
        <LoginModal />

        {/* Contenido principal */}
        <main className="main-content">
          <Routes>
            <Route path="/"                    element={<Home />} />
            <Route path="/buscar"              element={<Buscar />} />
            <Route path="/empresa/registro"    element={<RegistroEmpresa />} />
            <Route path="/oferente/registro"   element={<RegistroOferente />} />
          </Routes>
        </main>

        <Footer />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
