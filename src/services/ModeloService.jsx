// services/admin/modeloService.js
import api from './api';

export const modeloService = {
  // ============================================
  // CRUD DE MODELOS
  // ============================================

  /**
   * Obtener todos los modelos
   * GET /api/modelo
   */
  obtenerTodos: async () => {
    try {
      const response = await api.get('/modelo');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener modelos:', error);
      throw error;
    }
  },
  obtenerPiezasCompatibles: async (idModelo) => {
  try {
    const response = await api.get(`/modelos/${idModelo}/piezas-compatibles`);
    return response.data;
  } catch (error) {
    console.error(`❌ Error al obtener piezas compatibles del modelo ${idModelo}:`, error);
    throw error;
  }
},

  /**
   * Obtener modelos por marca
   * GET /api/modelo/{idMarca}
   */
  // services/admin/modeloService.js
obtenerPorMarca: async (idMarca) => {
  try {
    const response = await api.get(`/modelo/por-marca/${idMarca}`);
    return response.data; // ✅ Devolver directamente la respuesta del backend
  } catch (error) {
    console.error(`❌ Error al obtener modelos de marca ${idMarca}:`, error);
    throw error; // O manejar el error según necesites
  }
},


  /**
   * Obtener un modelo por ID
   * GET /api/modelo/{id}
   */
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/modelo/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al obtener modelo ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear nuevo modelo
   * POST /api/modelo
   */
  crear: async (data) => {
    try {
      const response = await api.post('/modelo', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al crear modelo:', error);
      throw error;
    }
  },

  /**
   * Actualizar modelo
   * PUT /api/modelo/{id}
   */
  actualizar: async (id, data) => {
    try {
      const response = await api.put(`/modelo/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al actualizar modelo ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar modelo
   * DELETE /api/modelo/{id}
   */
  eliminar: async (id) => {
    try {
      const response = await api.delete(`/modelo/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error al eliminar modelo ${id}:`, error);
      throw error;
    }
  }
};