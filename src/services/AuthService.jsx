// ============================================
// services/auth.service.js — CORREGIDO Y COMENTADO
// ============================================
import api from './api';

const authService = {

  
  // ============================================
loginCliente: async (credentials) => {
  try {
    const response = await api.post('/cliente-sesion', credentials);
    console.log('📦 Respuesta cliente raw:', response);
    
    // ✅ CORRECTO: response ya es response.data
    if (response?.data?.token) {
      const token = response.data.token;
      const userData = response.data.cliente;
      
      console.log('🔑 Token recibido:', token);
      console.log('👤 User data:', userData);
      
      localStorage.setItem('auth_token', token);
      localStorage.setItem('token', token);  // ← Agrega también esta línea
      localStorage.setItem('user_data', JSON.stringify(userData));
      localStorage.setItem('cliente', JSON.stringify(userData));  // ← Agrega esta
      localStorage.setItem('user_role', 'cliente');
      localStorage.setItem('user_type', 'cliente');
      
      // Configurar header de axios
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return { success: true, data: userData };
    }
    
    console.error('Respuesta sin token:', response);
    return { success: false, error: 'Respuesta inesperada del servidor' };
    
  } catch (error) {
    console.error('Error en loginCliente:', error);
    return { success: false, error: error.message };
  }
},

  // ============================================
  loginUsuario: async (credentials) => {
    try {
      const response = await api.post('/auth/usuario/login', credentials);
      console.log('📦 Respuesta usuario raw:', response);

      if (response?.token) {
        const userData = response.data;

        const role = userData?.roles?.es_administrador ? 'admin'
                   : userData?.roles?.es_recepcionista ? 'recepcionista'
                   : userData?.roles?.es_tecnico       ? 'tecnico'
                   : 'usuario';

        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user_data',  JSON.stringify(userData));
        localStorage.setItem('user_role',  role);
        localStorage.setItem('user_type',  'interno');

        api.setToken(response.token);

        return { success: true, data: userData, role };
      }

      return { success: false, error: 'Respuesta inesperada del servidor' };

    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============================================
  // OBTENER RUTA DEL DASHBOARD SEGÚN TIPO Y ROL
  // ============================================
  getDashboardPath: () => {
    const userType = localStorage.getItem('user_type');
    const userRole = localStorage.getItem('user_role');

    console.log('📍 getDashboardPath:', { userType, userRole });

    if (userType === 'cliente') {
      return '/cliente/dashboard';
    }

    if (userType === 'interno') {
      switch (userRole) {
        case 'admin':         return '/admin';
        case 'recepcionista': return '/recepcion';
        case 'tecnico':       return '/tecnico';
        default:              return '/home';
      }
    }

    return '/login';
  },
   forgotPassword: async (correo) => {
    try {
      const response = await api.post('/cliente/forgot-password', { correo });
      return response;
    } catch (error) {
      console.error('Error en forgotPassword:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al enviar el enlace' 
      };
    }
  },

  /**
   * Restablecer contraseña con token
   * @param {Object} data - { correo, token, contrasena, contrasena_confirmation }
   */
  resetPassword: async (data) => {
    try {
      const response = await api.post('/cliente/reset-password', data);
      return response;
    } catch (error) {
      console.error('Error en resetPassword:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Error al restablecer la contraseña' 
      };
    }
  },

  // ── HELPERS ───────────────────────────────────────────────────────────────

  isAuthenticated: () => !!localStorage.getItem('auth_token'),

  getUserRole: () => localStorage.getItem('user_role'),

  getUserType: () => localStorage.getItem('user_type'),
  getCurrentUser: () => {
  const userData = localStorage.getItem('user_data');
  return userData ? JSON.parse(userData) : null;
  },

  isCliente: () => localStorage.getItem('user_type') === 'cliente',


  hasRole: (requiredRole) => localStorage.getItem('user_role') === requiredRole,

 logout: async () => {
  try {
    // ✅ Obtener el token ANTES de usarlo
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      await api.post('/auth/usuario/logout');
    }
  } catch (error) {
    console.error('Error al cerrar sesión en el backend:', error);
  } finally {
    // Siempre limpiar localStorage y redirigir
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_type');
    delete api.defaults.headers.common['Authorization'];
    window.location.href = '/home';
  }
}
};

export default authService;