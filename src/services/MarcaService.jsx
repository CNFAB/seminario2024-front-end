// services/admin/marcaService.js
import api from './api';

export const marcaService = {
  // ============================================
  // CRUD DE MARCAS
  // ============================================

  /**
   * Obtener todas las marcas
   * GET /api/marca
   */
  obtenerTodas: async () => {
    try {
      const response = await api.get('/marca');
      return response.data;
    } catch (error) {
      console.error('Error al obtener marcas:', error);
      throw error;
    }
  },

  /**
   * Obtener una marca por ID
   * GET /api/marca/{id}
   */
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/marca/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener marca ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear nueva marca
   * POST /api/marca
   */
  crear: async (data) => {
    try {
      const response = await api.post('/marca', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear marca:', error);
      throw error;
    }
  },

  /**
   * Actualizar marca
   * PUT /api/marca/{id}
   */
  actualizar: async (id, data) => {
    try {
      const response = await api.put(`/marca/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al actualizar marca ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar marca
   * DELETE /api/marca/{id}
   */
  eliminar: async (id) => {
    try {
      const response = await api.delete(`/marca/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al eliminar marca ${id}:`, error);
      throw error;
    }
  }
};