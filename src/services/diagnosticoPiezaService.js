import api from './api';

// ============================================
// SERVICIO PARA GESTIONAR DIAGNÓSTICO-PIEZA
// ============================================

const diagnosticoPiezaService = {
  
  
   * Obtener todas las relaciones diagnóstico-pieza
   * @returns {Promise<Array>} Lista de asociaciones
   */
  async getAll() {
    try {
      const response = await api.get('/diagnosticos-piezas');
      return response;
    } catch (error) {
      console.error('Error al obtener diagnósticos-piezas:', error);
      throw error;
    }
  },

  /**
   * Obtener una asociación específica por ID
   * @param {number} id - ID de la asociación
   * @returns {Promise<Object>}
   */
  async getById(id) {
    try {
      const response = await api.get(`/diagnosticos-piezas/${id}`);
      return response;
    } catch (error) {
      console.error(`Error al obtener asociación ${id}:`, error);
      throw error;
    }
  },

  // ============================================
  // 2. OBTENER POR DIAGNÓSTICO
  // ============================================

  /**
   * Obtener todas las piezas de un diagnóstico específico
   * @param {number} diagnosticoId - ID del diagnóstico
   * @returns {Promise<Array>} Lista de piezas asociadas
   */
  async getByDiagnostico(diagnosticoId) {
    try {
      const response = await api.get(`/diagnosticos/${diagnosticoId}/piezas`);
      return response;
    } catch (error) {
      console.error(`Error al obtener piezas del diagnóstico ${diagnosticoId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener solo las piezas aprobadas de un diagnóstico
   * @param {number} diagnosticoId - ID del diagnóstico
   * @returns {Promise<Array>}
   */
  async getPiezasAprobadasByDiagnostico(diagnosticoId) {
    try {
      const response = await api.get(`/diagnosticos/${diagnosticoId}/piezas/aprobadas`);
      return response;
    } catch (error) {
      console.error(`Error al obtener piezas aprobadas del diagnóstico ${diagnosticoId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener solo las piezas rechazadas de un diagnóstico
   * @param {number} diagnosticoId - ID del diagnóstico
   * @returns {Promise<Array>}
   */
  async getPiezasRechazadasByDiagnostico(diagnosticoId) {
    try {
      const response = await api.get(`/diagnosticos/${diagnosticoId}/piezas/rechazadas`);
      return response;
    } catch (error) {
      console.error(`Error al obtener piezas rechazadas del diagnóstico ${diagnosticoId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener piezas pendientes de aprobación
   * @param {number} diagnosticoId - ID del diagnóstico
   * @returns {Promise<Array>}
   */
  async getPiezasPendientesByDiagnostico(diagnosticoId) {
    try {
      const response = await api.get(`/diagnosticos/${diagnosticoId}/piezas/pendientes`);
      return response;
    } catch (error) {
      console.error(`Error al obtener piezas pendientes del diagnóstico ${diagnosticoId}:`, error);
      throw error;
    }
  },

  // ============================================
  // 3. OBTENER POR PIEZA
  // ============================================

  /**
   * Obtener todos los diagnósticos que usan una pieza específica
   * @param {number} piezaId - ID de la pieza
   * @returns {Promise<Array>}
   */
  async getByPieza(piezaId) {
    try {
      const response = await api.get(`/piezas/${piezaId}/diagnosticos`);
      return response;
    } catch (error) {
      console.error(`Error al obtener diagnósticos de la pieza ${piezaId}:`, error);
      throw error;
    }
  },

  // ============================================
  // 4. CREAR ASOCIACIONES
  // ============================================

  /**
   * Asociar una pieza a un diagnóstico
   * @param {Object} data - Datos de la asociación
   * @param {number} data.id_diagnostico - ID del diagnóstico
   * @param {number} data.id_pieza - ID de la pieza
   * @param {string} data.estado - Estado (pendiente, aprobado, rechazado)
   * @param {number} data.costo - Costo de la pieza
   * @param {string} data.comentario - Comentario opcional
   * @returns {Promise<Object>}
   */
  async asociarPieza(data) {
    try {
      const response = await api.post('/diagnosticos-piezas', {
        id_diagnostico: data.id_diagnostico,
        id_pieza: data.id_pieza,
        estado: data.estado || 'pendiente',
        costo: data.costo || 0,
        comentario: data.comentario || null
      });
      return response;
    } catch (error) {
      console.error('Error al asociar pieza al diagnóstico:', error);
      throw error;
    }
  },

  /**
   * Asociar múltiples piezas a un diagnóstico
   * @param {number} diagnosticoId - ID del diagnóstico
   * @param {Array} piezas - Array de piezas con sus datos
   * @returns {Promise<Object>}
   */
  async asociarMultiplesPiezas(diagnosticoId, piezas) {
    try {
      const response = await api.post(`/diagnosticos/${diagnosticoId}/piezas/multiple`, {
        piezas: piezas
      });
      return response;
    } catch (error) {
      console.error('Error al asociar múltiples piezas:', error);
      throw error;
    }
  },

  // ============================================
  // 5. ACTUALIZAR ESTADOS
  // ============================================

  /**
   * Aprobar una pieza del diagnóstico
   * @param {number} diagnosticoId - ID del diagnóstico
   * @param {number} piezaId - ID de la pieza
   * @param {Object} data - Datos adicionales
   * @returns {Promise<Object>}
   */
  async aprobarPieza(diagnosticoId, piezaId, data = {}) {
    try {
      const response = await api.patch(`/diagnosticos/${diagnosticoId}/piezas/${piezaId}/aprobar`, {
        fecha_aprobacion: new Date().toISOString(),
        comentario: data.comentario || null
      });
      return response;
    } catch (error) {
      console.error(`Error al aprobar pieza ${piezaId}:`, error);
      throw error;
    }
  },

  /**
   * Rechazar una pieza del diagnóstico
   * @param {number} diagnosticoId - ID del diagnóstico
   * @param {number} piezaId - ID de la pieza
   * @param {Object} data - Datos adicionales
   * @returns {Promise<Object>}
   */
  async rechazarPieza(diagnosticoId, piezaId, data = {}) {
    try {
      const response = await api.patch(`/diagnosticos/${diagnosticoId}/piezas/${piezaId}/rechazar`, {
        fecha_rechazo: new Date().toISOString(),
        comentario: data.comentario || null,
        motivo: data.motivo || 'No cumple con los requisitos'
      });
      return response;
    } catch (error) {
      console.error(`Error al rechazar pieza ${piezaId}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar el estado de una pieza
   * @param {number} diagnosticoId - ID del diagnóstico
   * @param {number} piezaId - ID de la pieza
   * @param {string} estado - Nuevo estado
   * @param {Object} data - Datos adicionales
   * @returns {Promise<Object>}
   */
  async actualizarEstado(diagnosticoId, piezaId, estado, data = {}) {
    try {
      const response = await api.patch(`/diagnosticos/${diagnosticoId}/piezas/${piezaId}/estado`, {
        estado: estado,
        comentario: data.comentario || null,
        ...data
      });
      return response;
    } catch (error) {
      console.error(`Error al actualizar estado de pieza ${piezaId}:`, error);
      throw error;
    }
  },

  /**
   * Actualizar el costo de una pieza en el diagnóstico
   * @param {number} diagnosticoId - ID del diagnóstico
   * @param {number} piezaId - ID de la pieza
   * @param {number} costo - Nuevo costo
   * @returns {Promise<Object>}
   */
  async actualizarCosto(diagnosticoId, piezaId, costo) {
    try {
      const response = await api.patch(`/diagnosticos/${diagnosticoId}/piezas/${piezaId}/costo`, {
        costo: costo
      });
      return response;
    } catch (error) {
      console.error(`Error al actualizar costo de pieza ${piezaId}:`, error);
      throw error;
    }
  },

  // ============================================
  // 6. ELIMINAR ASOCIACIONES
  // ============================================

  /**
   * Eliminar una asociación diagnóstico-pieza
   * @param {number} diagnosticoId - ID del diagnóstico
   * @param {number} piezaId - ID de la pieza
   * @returns {Promise<Object>}
   */
  async eliminarAsociacion(diagnosticoId, piezaId) {
    try {
      const response = await api.delete(`/diagnosticos/${diagnosticoId}/piezas/${piezaId}`);
      return response;
    } catch (error) {
      console.error(`Error al eliminar asociación:`, error);
      throw error;
    }
  },

  /**
   * Eliminar todas las piezas de un diagnóstico
   * @param {number} diagnosticoId - ID del diagnóstico
   * @returns {Promise<Object>}
   */
  async limpiarDiagnostico(diagnosticoId) {
    try {
      const response = await api.delete(`/diagnosticos/${diagnosticoId}/piezas`);
      return response;
    } catch (error) {
      console.error(`Error al limpiar diagnóstico ${diagnosticoId}:`, error);
      throw error;
    }
  },

  // ============================================
  // 7. CÁLCULOS Y UTILIDADES
  // ============================================

  /**
   * Calcular costo total de piezas aprobadas para un diagnóstico
   * @param {number} diagnosticoId - ID del diagnóstico
   * @returns {Promise<Object>}
   */
  async calcularCostoTotal(diagnosticoId) {
    try {
      const response = await api.get(`/diagnosticos/${diagnosticoId}/costo-total`);
      return response;
    } catch (error) {
      console.error(`Error al calcular costo total del diagnóstico ${diagnosticoId}:`, error);
      throw error;
    }
  },

  /**
   * Obtener resumen de piezas por estado
   * @param {number} diagnosticoId - ID del diagnóstico
   * @returns {Promise<Object>}
   */
  async getResumenByDiagnostico(diagnosticoId) {
    try {
      const response = await api.get(`/diagnosticos/${diagnosticoId}/piezas/resumen`);
      return response;
    } catch (error) {
      console.error(`Error al obtener resumen del diagnóstico ${diagnosticoId}:`, error);
      throw error;
    }
  }
};

export default diagnosticoPiezaService;