// services/testimonioService.js
import api from './api';

const testimonioService = {
  /**
   * Obtener testimonios aprobados (para mostrar en la web pública)
   * GET /testimonios
   */
  obtenerTestimonios: async () => {
    try {
      const response = await api.get('/testimonios');
      return response.data;
    } catch (error) {
      console.error('Error al obtener testimonios:', error);
      throw error;
    }
  },

  /**
   * ✅ NUEVO: Obtener testimonios aprobados (alias para el carrusel)
   * GET /testimonios
   */
  obtenerAprobados: async () => {
    try {
      const response = await api.get('/testimonios');
      return response.data; // ← Devuelve response.data directamente
    } catch (error) {
      console.error('Error al obtener testimonios aprobados:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * ✅ NUEVO: Obtener estadísticas de calificaciones
   * GET /testimonios/estadisticas
   */
  obtenerEstadisticas: async () => {
    try {
      const response = await api.get('/testimonios/estadisticas');
      return response.data; // ← Devuelve response.data directamente
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return { 
        success: false, 
        data: { 
          total: 0, 
          promedio: 0, 
          porcentajeRecomiendan: 0,
          distribucion: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        } 
      };
    }
  },

  /**
   * Verificar si el cliente tiene reparaciones pendientes de calificar
   * GET /testimonios/verificar-pendientes
   */
  verificarPendientes: async () => {
    try {
      const response = await api.get('/testimonios/verificar-pendientes');
      return response;
    } catch (error) {
      console.error('Error al verificar pendientes:', error);
      throw error;
    }
  },

  /**
   * Guardar un nuevo testimonio
   * POST /testimonios
   * @param {Object} data - { id_reparacion, calificacion_estrella, comentario }
   */
  guardarTestimonio: async (data) => {
    try {
      const response = await api.post('/testimonios', data);
      return response;
    } catch (error) {
      console.error('Error al guardar testimonio:', error);
      throw error;
    }
  },

  /**
   * Guardar "no volver a preguntar" para una reparación
   * POST /testimonios/skip
   * @param {Object} data - { id_reparacion, skip_testimonio }
   */
  setSkipTestimonio: async (data) => {
    try {
      const response = await api.post('/testimonios/skip', data);
      return response;
    } catch (error) {
      console.error('Error al guardar skip:', error);
      throw error;
    }
  },

  /**
   * [ADMIN] Obtener todos los testimonios (para moderar)
   * GET /admin/testimonios
   */
  obtenerTodosTestimonios: async () => {
    try {
      const response = await api.get('/admin/testimonios');
      return response;
    } catch (error) {
      console.error('Error al obtener todos los testimonios:', error);
      throw error;
    }
  },

  /**
   * [ADMIN] Cambiar estado de un testimonio
   * PUT /admin/testimonios/{id}/estado
   * @param {number} id - id_testimonio
   * @param {string} estado - PENDIENTE, APROBADO, RECHAZADO
   */
  cambiarEstadoTestimonio: async (id, estado) => {
    try {
      const response = await api.put(`/admin/testimonios/${id}/estado`, { estado });
      return response;
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      throw error;
    }
  },

  /**
   * [ADMIN] Eliminar un testimonio
   * DELETE /admin/testimonios/{id}
   * @param {number} id - id_testimonio
   */
  eliminarTestimonio: async (id) => {
    try {
      const response = await api.delete(`/admin/testimonios/${id}`);
      return response;
    } catch (error) {
      console.error('Error al eliminar testimonio:', error);
      throw error;
    }
  }
};

export default testimonioService;