import axios from 'axios';

// ============================================
// 1. CONFIGURACIÓN BASE PARA LARAVEL
// ============================================
const LARAVEL_API_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: LARAVEL_API_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// ============================================
// 2. INTERCEPTOR DE REQUEST (ANTES DE ENVIAR)
// ============================================
api.interceptors.request.use(
  (config) => {
    // Log de todas las claves en localStorage

    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('❌ No se encontró token en localStorage');
      console.log('  - auth_token:', localStorage.getItem('auth_token'));
      console.log('  - token:', localStorage.getItem('token'));
    }

    return config;
  },
  (error) => {
    console.error('❌ Error en la configuración de la petición:', error);
    return Promise.reject(error);
  }
);
// ============================================
// 3. INTERCEPTOR DE RESPONSE (DESPUÉS DE RECIBIR)
// ============================================
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Respuesta recibida (${response.status}): ${response.config.url}`);
    // ✅ Devolver siempre response.data completo sin transformar
    return response.data;
  },
  (error) => {
    console.group('❌ Error en la petición');
    console.log('URL:', error.config?.url);
    console.log('Método:', error.config?.method);
    console.log('Status:', error.response?.status);
    console.log('Datos error:', error.response?.data);
    console.groupEnd();

    const originalError = {
      message: error.message,
      response: error.response,
      config: error.config,
    };

    // 401 - No autorizado
    if (error.response?.status === 401) {
      console.warn('⚠️ Token expirado o inválido.');

      // ✅ NO borres el token inmediatamente
      // Solo borra si es un error explícito de token inválido
      const errorMessage = error.response?.data?.error || error.response?.data?.message;

      // Si el error dice específicamente "token inválido" o "expirado"
      if (
        errorMessage &&
        (errorMessage.includes('Token inválido') || errorMessage.includes('expirado'))
      ) {
        console.log('Borrando token por error específico');
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('token');
        localStorage.removeItem('cliente');

        const yaEnLogin = window.location.pathname.includes('/login');
        if (!yaEnLogin) {
          setTimeout(() => {
            window.location.href = '/cliente/login';
          }, 1000);
        }
      } else {
        // Si es otro tipo de 401, solo rechazar sin borrar token
        console.log('401 sin borrar token, posible error de permisos');
      }

      return Promise.reject({
        type: 'AUTH_ERROR',
        message: error.response?.data?.message || 'Credenciales incorrectas',
        status: 401,
        originalError,
      });
    }

    // 419 - CSRF Token Mismatch
    if (error.response?.status === 419) {
      console.warn('⚠️ CSRF token expirado. Refrescando página...');
      window.location.reload();
      return Promise.reject({
        type: 'CSRF_ERROR',
        message: 'La sesión ha expirado. Recargando página...',
        status: 419,
        originalError,
      });
    }

    // 422 - Errores de validación
    if (error.response?.status === 422) {
      const validationErrors = error.response.data.errors || {};
      console.warn('⚠️ Errores de validación:', validationErrors);

      const formattedErrors = {};
      Object.keys(validationErrors).forEach((field) => {
        formattedErrors[field] = validationErrors[field].join(', ');
      });

      return Promise.reject({
        type: 'VALIDATION_ERROR',
        message: 'Errores de validación en el formulario',
        errors: formattedErrors,
        rawErrors: validationErrors,
        status: 422,
        originalError,
      });
    }

    // 404 - No encontrado
    if (error.response?.status === 404) {
      return Promise.reject({
        type: 'NOT_FOUND',
        message: 'El recurso solicitado no fue encontrado',
        status: 404,
        originalError,
      });
    }

    // 500 - Error del servidor
    if (error.response?.status === 500) {
      console.error('🔥 Error interno del servidor:', error.response.data);
      return Promise.reject({
        type: 'SERVER_ERROR',
        message: 'Error interno del servidor. Por favor, intente más tarde.',
        status: 500,
        originalError,
      });
    }

    // 403 - Prohibido
    if (error.response?.status === 403) {
      return Promise.reject({
        type: 'FORBIDDEN',
        message: 'No tienes permisos para realizar esta acción',
        status: 403,
        originalError,
      });
    }

    // Error de red
    if (!error.response) {
      console.error('🌐 Error de red - Sin conexión a internet');
      return Promise.reject({
        type: 'NETWORK_ERROR',
        message: 'Error de conexión. Verifica tu conexión a internet.',
        originalError,
      });
    }

    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Error desconocido en la petición';

    return Promise.reject({
      type: 'GENERAL_ERROR',
      message: errorMessage,
      status: error.response?.status,
      originalError,
    });
  }
);

// ============================================
// 4. FUNCIONES DE AYUDA (HELPERS)
// ============================================
api.isOnline = () => navigator.onLine;

api.getToken = () => localStorage.getItem('auth_token') || localStorage.getItem('token');

api.setToken = (token) => {
  localStorage.setItem('token', token);
  console.log('🔑 Token guardado en localStorage');
};

api.clearToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('auth_token');
  console.log('🔓 Token eliminado');
};

api.getCommonHeaders = () => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

// ============================================
// 5. EXPORTAR
// ============================================
export default api;
