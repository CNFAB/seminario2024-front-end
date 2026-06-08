// ============================================
// App.jsx
// ============================================
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Reception from './pages/Recepcion/Reception';
import Admin from './pages/Administrador/Admin';
import TecnicoDashboard from './pages/Tecnico/TecnicoDashboard';
import Dashboard from './pages/Administrador/Dashboard/Dashboard';
import ClienteDashboard from './pages/Clients/ClienteDashboard';
import LoginCliente from './pages/clients/LoginCliente.jsx';
import Home from './pages/Home/Home';
import Login from './pages/Login';
import ReasignacionDiagnostico from './pages/Administrador/ReasignacionTecnica/ReasignacionDiagnostico';
import ReasignacionReparacion from './pages/Administrador/ReasignacionTecnica/ReasignacionReparacion';
// import PricingSection from './pages/Home/Componente/PricingSection';
import ServicesSection from './pages/Home/Componente/ServicesSection';
import Compatibilidad from './pages/Administrador/Compatibilidad/Compatibilidad';
import PerfilUsuario from './pages/PerfilUsuario/PerfilUsuario';
import PerfilCliente from './pages/PerfilCliente/PerfilCliente';
import About from './pages/Home/Componente/About';
import Contact from './pages/Home/Componente/Contact';
import NewsSection from './pages/Home/Componente/NewsSection';
import TestimoniosPage from './pages/Home/Componente/Carrusel/TestimoniosPage';
import ClienteForgotPassword from './pages/Home/Componente/Recuperacion-password/ClienteForgotPassword';
import ClienteResetPassword from './pages/Home/Componente/Recuperacion-password/ClienteResetPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ══════════════════════════════════════════
            RUTAS PÚBLICAS
            ══════════════════════════════════════════ */}
        <Route path="/home" element={<Home />} />
        {/*<Route path="/precio" element={<PricingSection />} />*/}
        <Route path="/services" element={<ServicesSection />} />
        <Route path="/compatibilidad" element={<Compatibilidad />} />
        <Route path="/cliente/login" element={<LoginCliente />} />
        <Route path="/About" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/testimonios" element={<TestimoniosPage />} />
        <Route path="/cliente/forgot-password" element={<ClienteForgotPassword />} />
        <Route path="/cliente/reset-password" element={<ClienteResetPassword />} />
        <Route path="/nuevo" element={<NewsSection />} />

        {/* ══════════════════════════════════════════
            RUTAS PROTEGIDAS — CLIENTES
            ══════════════════════════════════════════ */}
        <Route
          path="/cliente/dashboard"
          element={
            <ProtectedRoute>
              <ClienteDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cliente/perfil"
          element={
            <ProtectedRoute>
              <PerfilCliente />
            </ProtectedRoute>
          }
        />

        {/* ══════════════════════════════════════════
            RUTAS PROTEGIDAS — USUARIOS INTERNOS
            ══════════════════════════════════════════ */}

        {/* Recepcionista */}
        <Route
          path="/recepcion"
          element={
            <ProtectedRoute requiredRole="recepcionista">
              <Reception />
            </ProtectedRoute>
          }
        />

        {/* Administrador */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <Admin />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reasignaciones-diagnosticos"
          element={
            <ProtectedRoute requiredRole="admin">
              <ReasignacionDiagnostico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reasignaciones-reparaciones"
          element={
            <ProtectedRoute requiredRole="admin">
              <ReasignacionReparacion />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Técnico */}
        <Route
          path="/tecnico"
          element={
            <ProtectedRoute requiredRole="tecnico">
              <TecnicoDashboard />
            </ProtectedRoute>
          }
        />

        {/* ── Perfil ──────────────────────────────────
            Accesible para cualquier usuario interno
            autenticado (técnico, admin, recepcionista).
            Sin requiredRole → solo verifica que haya sesión.
            ─────────────────────────────────────────── */}
        <Route
          path="/perfil"
          element={
            <ProtectedRoute>
              <PerfilUsuario />
            </ProtectedRoute>
          }
        />

        {/* ══════════════════════════════════════════
            CATCH-ALL
            ══════════════════════════════════════════ */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
