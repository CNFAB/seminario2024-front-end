// services/admin/categoriaService.js
import api from './api';

export const categoriaService = {
  // ============================================
  // CRUD DE CATEGORÍAS
  // ============================================

  /**
   * Obtener todas las categorías
   * GET /categoria
   */
  obtenerTodas: async (params = {}) => {
    try {
      const response = await api.get('/categoria', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error en obtenerTodas las categorías:', error);
      throw error;
    }
  },

  /**
   * Obtener una categoría por nombre
   * GET /categoria/{nombre}
   */
  obtenerPorNombre: async (nombre) => {
    try {
      const response = await api.get(`/categoria/${nombre}`);
      return response;
    } catch (error) {
      console.error(`❌ Error en obtenerPorNombre ${nombre}:`, error);
      throw error;
    }
  },

  /**
   * Crear nueva categoría
   * POST /categoria
   */
  crear: async (data) => {
    try {
      console.log('📤 Creando categoría:', data);
      const response = await api.post('/categoria', data);
      return response;
    } catch (error) {
      console.error('❌ Error en crear categoría:', error);
      throw error;
    }
  },

  /**
   * Actualizar categoría
   * PUT /categoria/{id}
   */
  actualizar: async (id, data) => {
    try {
      console.log(`📤 Actualizando categoría ${id}:`, data);
      const response = await api.put(`/categoria/${id}`, data);
      return response;
    } catch (error) {
      console.error(`❌ Error en actualizar categoría ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar categoría
   * DELETE /categoria/{nombre}
   */
  eliminar: async (nombre) => {
    try {
      const response = await api.delete(`/categoria/${nombre}`);
      return response;
    } catch (error) {
      console.error(`❌ Error en eliminar categoría ${nombre}:`, error);
      throw error;
    }
  },

  // ============================================
  // BÚSQUEDAS Y FILTROS
  // ============================================

  /**
   * Buscar categorías por término
   * GET /categoria-buscar/search
   */
  buscar: async (query) => {
    try {
      const response = await api.get('/categoria-buscar/search', {
        params: { q: query }
      });
      return response;
    } catch (error) {
      console.error('❌ Error en buscar categorías:', error);
      throw error;
    }
  },

  /**
   * Obtener categorías que tienen mano de obra asignada
   * GET /categoria-con-mano-obra
   */
  obtenerConManoObra: async () => {
    try {
      const response = await api.get('/categoria-con-mano-obra');
      return response;
    } catch (error) {
      console.error('❌ Error en obtenerConManoObra:', error);
      throw error;
    }
  },

  /**
   * Obtener categorías sin mano de obra asignada
   * GET /categoria-sin-mano-obra
   */
  obtenerSinManoObra: async () => {
    try {
      const response = await api.get('/categoria-sin-mano-obra');
      return response;
    } catch (error) {
      console.error('❌ Error en obtenerSinManoObra:', error);
      throw error;
    }
  },

  /**
   * Verificar si existe una categoría por nombre
   * GET /categoria-verificar/{nombre}
   */
  verificarExistencia: async (nombre) => {
    try {
      const response = await api.get(`/categoria-verificar/${nombre}`);
      return response;
    } catch (error) {
      console.error(`❌ Error en verificarExistencia ${nombre}:`, error);
      throw error;
    }
  },

  // ============================================
  // MÉTODOS ADICIONALES ÚTILES
  // ============================================

  /**
   * Obtener categorías con conteo de piezas
   * (Endpoint personalizado - necesitas crearlo en backend)
   */
  obtenerConConteoPiezas: async () => {
    try {
      const response = await api.get('/categoria/con-conteo');
      return response;
    } catch (error) {
      console.error('❌ Error en obtenerConConteoPiezas:', error);
      throw error;
    }
  },

  /**
   * Obtener categorías activas/inactivas
   * (si tienes campo 'activo' en tu tabla)
   */
  obtenerPorEstado: async (activo = true) => {
    try {
      const response = await api.get('/categoria', {
        params: { activo }
      });
      return response;
    } catch (error) {
      console.error('❌ Error en obtenerPorEstado:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado de múltiples categorías
   * (Endpoint personalizado)
   */
  actualizarEstadoMultiple: async (ids, activo) => {
    try {
      const response = await api.patch('/categoria/estado-multiple', {
        ids,
        activo
      });
      return response;
    } catch (error) {
      console.error('❌ Error en actualizarEstadoMultiple:', error);
      throw error;
    }
  },

  /**
   * Obtener categorías para select/dropdown
   * Formato simplificado: { value: id, label: nombre }
   */
  obtenerParaSelect: async () => {
    try {
      const response = await api.get('/categoria');
      const categorias = response.data || response;
      
      // Formatear para react-select o dropdowns
      return categorias.map(cat => ({
        value: cat.id_categoria,
        label: cat.nombre_categoria,
        original: cat
      }));
    } catch (error) {
      console.error('❌ Error en obtenerParaSelect:', error);
      throw error;
    }
  },

  // ============================================
  // ESTADÍSTICAS Y REPORTES
  // ============================================

  /**
   * Obtener estadísticas de categorías
   * GET /categoria/estadisticas (necesitas crearlo)
   */
  obtenerEstadisticas: async () => {
    try {
      const response = await api.get('/categoria/estadisticas');
      return response;
    } catch (error) {
      console.error('❌ Error en obtenerEstadisticas:', error);
      throw error;
    }
  },

  /**
   * Obtener categorías más usadas en reparaciones
   * GET /categoria/mas-usadas (necesitas crearlo)
   */
  obtenerMasUsadas: async (limite = 5) => {
    try {
      const response = await api.get('/categoria/mas-usadas', {
        params: { limite }
      });
      return response;
    } catch (error) {
      console.error('❌ Error en obtenerMasUsadas:', error);
      throw error;
    }
  }
};