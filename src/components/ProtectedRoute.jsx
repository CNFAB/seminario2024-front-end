// ============================================
// components/ProtectedRoute.jsx — CORREGIDO Y COMENTADO
// ============================================
import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/AuthService';

// ============================================
// ProtectedRoute: wrapper que protege rutas según autenticación y rol
//
// Props:
//   children     → el componente a renderizar si pasa la validación
//   requiredRole → (opcional) 'admin' | 'recepcionista' | 'tecnico'
//                  Si no se pasa, solo verifica que haya sesión activa
// ============================================
const ProtectedRoute = ({ children, requiredRole }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userType        = authService.getUserType();  // 'cliente' | 'interno'
  const userRole        = authService.getUserRole();  // 'admin' | 'recepcionista' | 'tecnico' | 'cliente'

  console.log('🔒 ProtectedRoute check:', { isAuthenticated, userType, userRole, requiredRole });

  // ── 1. SIN SESIÓN → siempre al login ──────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ── 2. ES CLIENTE ──────────────────────────────────────────────────────────
  if (userType === 'cliente') {
    // Si intenta acceder a una ruta que requiere rol de usuario interno
    // lo mandamos a su propio dashboard, no a /login
    if (requiredRole) {
      console.warn('⚠️ Cliente intentando acceder a ruta de usuario interno. Redirigiendo a su dashboard.');
      return <Navigate to="/cliente/dashboard" replace />;
    }
    // Sin requiredRole → puede ver la ruta (ej: /cliente/dashboard)
    return children;
  }

  // ── 3. ES USUARIO INTERNO ─────────────────────────────────────────────────
  if (requiredRole && userRole !== requiredRole) {
    // ✅ FIX: ANTES redirigía a '/login' aunque el usuario YA estaba logueado
    //    Eso genera un loop raro: logueado pero lo manda al login
    // ✅ AHORA: lo mandamos al dashboard que le corresponde según su rol
    console.warn(`⚠️ Rol requerido: ${requiredRole}, rol actual: ${userRole}. Redirigiendo a su dashboard.`);
    return <Navigate to={authService.getDashboardPath()} replace />;
  }

  // ── 4. TODO OK → renderizar el componente protegido ───────────────────────
  return children;
};

export default ProtectedRoute;