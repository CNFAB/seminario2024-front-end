// services/PrecioService.js
import api from './api';

export const precioService = {
  // ============================================
  // SERVICIOS DE REPARACIÓN (tabla precio_reparacion)
  // ============================================

  /**
   * Obtener todos los servicios/precios
   * GET /api/precio-reparacion
   */
  obtenerTodos: async () => {
    try {
      const response = await api.get('/precio-reparacion');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener servicios:', error);
      throw error;
    }
  },

  /**
   * Obtener un servicio por ID
   * GET /api/precio-reparacion/{id}
   */
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/precio-reparacion/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener servicio ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear nuevo servicio
   * POST /api/precio-reparacion
   */
  crear: async (data) => {
    try {
      const response = await api.post('/precio-reparacion', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear servicio:', error);
      throw error;
    }
  },

  /**
   * Actualizar servicio
   * PUT /api/precio-reparacion/{id}
   */
  actualizar: async (id, data) => {
    try {
      const response = await api.put(`/precio-reparacion/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al actualizar servicio ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar servicio
   * DELETE /api/precio-reparacion/{id}
   */
  eliminar: async (id) => {
    try {
      const response = await api.delete(`/precio-reparacion/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al eliminar servicio ${id}:`, error);
      throw error;
    }
  },

  // ============================================
  // CATEGORÍAS (tabla categoria)
  // ============================================

  /**
   * Obtener categorías con porcentaje de mano de obra
   * GET /api/categoria
   */
  // services/PrecioService.js
obtenerCategorias: async () => {
  try {
    console.log('📡 Service: Llamando a /categoria');
    const response = await api.get('/categoria');
    console.log('✅ Service: Respuesta recibida');
    
    // ✅ La API devuelve directamente el array
    return response.data; // Aquí ya viene el array
    
  } catch (error) {
    console.error('❌ Service Error:', error);
    throw error;
  }
},
  /**
   * Actualizar porcentaje de mano de obra de una categoría
   * PATCH /api/categoria/{id}/mano-obra
   */
  actualizarManoObra: async (id, porcentaje) => {
    try {
      const response = await api.put(`/categoria/${id}`, { mano_obra: porcentaje });
      return response.data;
    } catch (error) {
      console.error(`❌ Error al actualizar mano de obra ${id}:`, error);
      throw error;
    }
  },

  // ============================================
  // MÉTODOS ADICIONALES
  // ============================================

  /**
   * Obtener estadísticas de precios
   * GET /api/precio-reparacion/estadisticas
   */
  obtenerEstadisticas: async () => {
    try {
      const response = await api.get('/precio-reparacion/estadisticas');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas:', error);
      throw error;
    }
  },

  /**
   * Calcular precio final de un servicio
   */
  calcularPrecioFinal: (precioBase, manoObraPorcentaje) => {
    if (!precioBase || !manoObraPorcentaje) return 0;
    const base = parseFloat(precioBase) || 0;
    const porcentaje = parseFloat(manoObraPorcentaje) || 0;
    return base + (base * porcentaje / 100);
  }
};