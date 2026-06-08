// services/usuarioService.js
import api from './api';

export const usuarioService = {
  // ============================================
  // CRUD BÁSICO
  // ============================================

  /**
   * Obtener todos los usuarios
   * GET /usuario
   */
  obtenerTodos: async () => {
    try {
      const response = await api.get('/usuario');
      return response; // La API devuelve directamente el array
    } catch (error) {
      console.error('❌ Error en obtenerTodos:', error);
      throw error;
    }
  },

  /**
   * Obtener un usuario por ID
   * GET /usuario/{id}
   */
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/usuario/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error en obtenerPorId ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear nuevo usuario
   * POST /usuario
   */
  crear: async (data) => {
    try {
      console.log('📤 Creando usuario:', data);

      // Asegurar que los campos booleanos sean booleanos
      const datosEnvio = {
        ...data,
        es_tecnico: Boolean(data.es_tecnico),
        es_recepcionista: Boolean(data.es_recepcionista),
        es_administrador: Boolean(data.es_administrador),
        activo: data.activo !== undefined ? data.activo : true,
      };

      const response = await api.post('/usuario', datosEnvio);
      return response.data;
    } catch (error) {
      console.error('❌ Error en crear:', error);
      throw error;
    }
  },

  /**
   * Actualizar usuario
   * PUT /usuario/{id}
   */
  actualizar: async (id, data) => {
    try {
      console.log(`📤 Actualizando usuario ${id}:`, data);

      // Si la contraseña está vacía, eliminarla para no actualizarla
      const datosEnvio = { ...data };
      if (datosEnvio.contrasena === '') {
        delete datosEnvio.contrasena;
      }

      const response = await api.put(`/usuario/${id}`, datosEnvio);
      return response.data;
    } catch (error) {
      console.error(`❌ Error en actualizar ${id}:`, error);
      throw error;
    }
  },
  toggleActivo: async (id) => {
    try {
      const response = await api.patch(`/usuario/${id}/toggle-activo`);
      return response.data;
    } catch (error) {
      console.error(` Error en toggleActivo ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar usuario
   * DELETE /usuario/{id}
   */
  eliminar: async (id) => {
    try {
      const response = await api.delete(`/usuario/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error en eliminar ${id}:`, error);
      throw error;
    }
  },

  // ============================================
  // MÉTODOS POR ROL
  // ============================================

  /**
   * Obtener todos los técnicos
   * GET /usuarios/tecnicos
   */
  obtenerTecnicos: async () => {
    try {
      const response = await api.get('/usuarios/tecnicos');
      return response; // La API devuelve directamente el array
    } catch (error) {
      console.error('❌ Error en obtenerTecnicos:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los recepcionistas
   * GET /usuarios/recepcionistas
   */
  obtenerRecepcionistas: async () => {
    try {
      const response = await api.get('/usuarios/recepcionistas');
      return response.data;
    } catch (error) {
      console.error('❌ Error en obtenerRecepcionistas:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los administradores
   * GET /usuarios/administradores
   */
  obtenerAdministradores: async () => {
    try {
      const response = await api.get('/usuarios/administradores');
      return response.data;
    } catch (error) {
      console.error('❌ Error en obtenerAdministradores:', error);
      throw error;
    }
  },

  /**
   * Obtener técnico disponible (con menor carga de trabajo)
   * GET /usuarios/tecnico-disponible
   */
  obtenerTecnicoDisponible: async () => {
    try {
      const response = await api.get('/usuarios/tecnico-disponible');
      return response.data;
    } catch (error) {
      console.error('❌ Error en obtenerTecnicoDisponible:', error);
      throw error;
    }
  },

  /**
   * Obtener carga de trabajo de todos los técnicos
   * GET /usuarios/carga-trabajo-tecnicos
   */
  obtenerCargaTrabajoTecnicos: async () => {
    try {
      const response = await api.get('/usuarios/carga-trabajo-tecnicos');
      return response.data;
    } catch (error) {
      console.error('❌ Error en obtenerCargaTrabajoTecnicos:', error);
      throw error;
    }
  },

  // ============================================
  // LOGIN
  // ============================================

  /**
   * Iniciar sesión
   * POST /login (o la ruta que uses para login)
   */
  login: async (credenciales) => {
    try {
      const response = await api.post('/login', credenciales);
      return response.data;
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    }
  },

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Formatear datos de usuario para mostrar
   */
  formatearUsuario: (usuario) => {
    if (!usuario) return null;

    return {
      ...usuario,
      nombreCompleto: `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim(),
      rolPrincipal: usuario.es_administrador
        ? 'Administrador'
        : usuario.es_tecnico
          ? 'Técnico'
          : usuario.es_recepcionista
            ? 'Recepcionista'
            : 'Sin rol',
      roles: [
        ...(usuario.es_administrador ? ['Administrador'] : []),
        ...(usuario.es_tecnico ? ['Técnico'] : []),
        ...(usuario.es_recepcionista ? ['Recepcionista'] : []),
      ],
    };
  },

  /**
   * Verificar si un usuario tiene un rol específico
   */
  tieneRol: (usuario, rol) => {
    if (!usuario) return false;

    switch (rol) {
      case 'tecnico':
        return usuario.es_tecnico;
      case 'recepcionista':
        return usuario.es_recepcionista;
      case 'administrador':
        return usuario.es_administrador;
      default:
        return false;
    }
  },
};
