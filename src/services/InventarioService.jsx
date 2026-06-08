// services/admin/inventarioService.js
import api from './api';

export const inventarioService = {
  // ============================================
  // CRUD DE PIEZAS
  // ============================================

  /**
   * Obtener todas las piezas
   * GET /pieza
   */
  obtenerTodas: async (params = {}) => {
    try {
      const response = await api.get('/pieza', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error en obtenerTodas:', error);
      throw error;
    }
  },

  /**
   * Obtener una pieza por ID
   * GET /pieza/{id}
   */
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/pieza/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error en obtenerPorId ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crear nueva pieza
   * POST /pieza
   */
  crear: async (data) => {
    try {
      console.log('📤 Creando pieza:', data);
      const response = await api.post('/pieza', data);
      return response.data;
    } catch (error) {
      console.error('❌ Error en crear:', error);
      throw error;
    }
  },

  /**
   * Actualizar pieza
   * PUT /pieza/{id}
   */
  actualizar: async (id, data) => {
    try {
      console.log(`📤 Actualizando pieza ${id}:`, data);
      const response = await api.put(`/pieza/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ Error en actualizar ${id}:`, error);
      throw error;
    }
  },

  /**
   * Eliminar pieza
   * DELETE /pieza/{id}
   */
  eliminar: async (id) => {
    try {
      const response = await api.delete(`/pieza/${id}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error en eliminar ${id}:`, error);
      throw error;
    }
  },

  // ============================================
  // PIEZAS POR CATEGORÍA
  // ============================================

  /**
   * Obtener piezas por categoría
   * GET /pieza-categoria/{categoriaId}
   */
  obtenerPorCategoria: async (categoriaId) => {
    try {
      console.log(`📤 Obteniendo piezas de categoría ID: ${categoriaId}`);
      const response = await api.get(`/pieza-categoria/${categoriaId || ''}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error en obtenerPorCategoria ${categoriaId}:`, error);
      throw error;
    }
  },

  // ============================================
  // BÚSQUEDA DE PIEZAS
  // ============================================

  /**
   * Buscar piezas por término
   * GET /pieza-buscar/search
   */
  buscarPiezas: async (query) => {
    try {
      console.log(`🔍 Buscando piezas con: ${query}`);
      const response = await api.get('/pieza-buscar/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error en buscarPiezas:', error);
      throw error;
    }
  },

  // ============================================
  // PIEZAS CON STOCK
  // ============================================

  /**
   * Obtener piezas con stock disponible
   * GET /pieza-con-stock
   */
  obtenerConStock: async () => {
    try {
      const response = await api.get('/pieza-con-stock');
      return response.data;
    } catch (error) {
      console.error('❌ Error en obtenerConStock:', error);
      throw error;
    }
  },

  // ============================================
  // ACTUALIZAR STOCK (POST)
  // ============================================

  /**
   * Actualizar stock de una pieza (método POST)
   * POST /pieza/{id}/stock
   */
  actualizarStockPost: async (id, cantidad, operacion = 'agregar') => {
    try {
      console.log(`📤 Actualizando stock de pieza ${id}: ${cantidad} (${operacion})`);
      const response = await api.post(`/pieza/${id}/stock`, { 
        cantidad,
        operacion 
      });
      return response.data;
    } catch (error) {
      console.error(`❌ Error en actualizarStockPost ${id}:`, error);
      throw error;
    }
  },

  // ============================================
  // CATEGORÍAS
  // ============================================

  /**
   * Obtener todas las categorías
   * GET /categoria
   */
  obtenerCategorias: async () => {
    try {
      const response = await api.get('/categoria');
      return response.data;
    } catch (error) {
      console.error('❌ Error en obtenerCategorias:', error);
      throw error;
    }
  },

  // ============================================
  // MARCAS Y MODELOS
  // ============================================

  /**
   * Obtener todas las marcas
   * GET /marca
   */
  obtenerMarcas: async () => {
    try {
      const response = await api.get('/marca');
      return response.data;
    } catch (error) {
      console.error('❌ Error en obtenerMarcas:', error);
      throw error;
    }
  },

  /**
   * Obtener modelos por marca
   * GET /modelo/{idMarca}
   */
  obtenerModelosPorMarca: async (idMarca) => {
    try {
      const response = await api.get(`/modelo/${idMarca}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error en obtenerModelosPorMarca ${idMarca}:`, error);
      throw error;
    }
  },

  // ============================================
  // STOCK Y ALERTAS
  // ============================================

  /**
   * Obtener piezas con stock bajo
   * GET /pieza/stock-bajo?limite=5
   */
  obtenerStockBajo: async (limite = 5) => {
    try {
      const response = await api.get('/pieza/stock-bajo', { 
        params: { limite } 
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error en obtenerStockBajo:', error);
      throw error;
    }
  },

  /**
   * Actualizar stock de una pieza (PATCH)
   * PATCH /pieza/{id}/stock
   */
  actualizarStock: async (id, cantidad) => {
    try {
      const response = await api.patch(`/pieza/${id}/stock`, { cantidad });
      return response.data;
    } catch (error) {
      console.error(`❌ Error en actualizarStock ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas de inventario
   * GET /pieza/estadisticas
   */
  obtenerEstadisticas: async () => {
    try {
      const response = await api.get('/pieza/estadisticas');
      return response.data;
    } catch (error) {
      console.error('❌ Error en obtenerEstadisticas:', error);
      throw error;
    }
  }
};