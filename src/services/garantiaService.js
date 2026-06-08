import api from './api'; // Tu archivo de configuración base

const garantiaService = {
  /**
   * Obtener todas las garantías
   */
  obtenerTodas: async () => {
    try {
      const response = await api.get('/garantias');
      return response;
    } catch (error) {
      console.error('Error al obtener garantías:', error);
      throw error;
    }
  },
  obtenerEvolucionMensual: async (semestre = 'ene-jun', year = new Date().getFullYear()) => {
    try {
      const response = await api.get('/admin/garantias/evolucion-mensual', {
        params: { semestre, year },
      });
      return response;
    } catch (error) {
      console.error('Error al obtener evolución mensual:', error);
      throw error;
    }
  },
  obtenerControlCalidad: async () => {
    try {
      const response = await api.get('/admin/garantias/control-calidad');
      return response;
    } catch (error) {
      console.error('Error al obtener control de calidad:', error);
      throw error;
    }
  },

  /**
   * Reclamar garantía
   */
  reclamar: async (idGarantia, data) => {
    try {
      const response = await api.post(`/garantias/${idGarantia}/reclamar`, data);
      return response;
    } catch (error) {
      console.error('Error al reclamar garantía:', error);
      throw error;
    }
  },

  /**
   * Obtener garantía por ID
   */
  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/garantias/${id}`);
      return response;
    } catch (error) {
      console.error('Error al obtener garantía:', error);
      throw error;
    }
  },

  /**
   * Obtener garantías por cliente
   */
  obtenerPorCliente: async (idCliente) => {
    try {
      const response = await api.get(`/garantias/cliente/${idCliente}`);
      return response;
    } catch (error) {
      console.error('Error al obtener garantías del cliente:', error);
      throw error;
    }
  },
  obtenerPorVencer: async (dias = 30) => {
    try {
      const response = await api.get(`/admin/garantias/por-vencer?dias=${dias}`);
      return response;
    } catch (error) {
      console.error('Error al obtener garantías por vencer:', error);
      throw error;
    }
  },

  /**
   * Obtener garantías por dispositivo
   */
  obtenerPorDispositivo: async (idDispositivo) => {
    try {
      const response = await api.get(`/garantias/dispositivo/${idDispositivo}`);
      return response;
    } catch (error) {
      console.error('Error al obtener garantías del dispositivo:', error);
      throw error;
    }
  },

  /**
   * Obtener garantías activas
   */
  obtenerActivas: async () => {
    try {
      const response = await api.get('/garantias/activas');
      return response;
    } catch (error) {
      console.error('Error al obtener garantías activas:', error);
      throw error;
    }
  },

  /**
   * Obtener garantías vencidas
   */
  obtenerVencidas: async () => {
    try {
      const response = await api.get('/garantias/vencidas');
      return response;
    } catch (error) {
      console.error('Error al obtener garantías vencidas:', error);
      throw error;
    }
  },

  /**
   * Verificar si una reparación tiene garantía activa
   */
  verificarPorReparacion: async (idReparacion) => {
    try {
      const response = await api.get(`/garantias/reparacion/${idReparacion}/verificar`);
      return response.data; // 👈 Devuelve response.data directamente
    } catch (error) {
      console.error('Error al verificar garantía:', error);
      throw error;
    }
  },

  /**
   * Crear una nueva garantía
   */
  crear: async (data) => {
    try {
      const response = await api.post('/garantias', data);
      return response;
    } catch (error) {
      console.error('Error al crear garantía:', error);
      throw error;
    }
  },

  /**
   * Actualizar una garantía
   */
  actualizar: async (id, data) => {
    try {
      const response = await api.put(`/garantias/${id}`, data);
      return response;
    } catch (error) {
      console.error('Error al actualizar garantía:', error);
      throw error;
    }
  },

  /**
   * Eliminar una garantía
   */
  eliminar: async (id) => {
    try {
      const response = await api.delete(`/garantias/${id}`);
      return response;
    } catch (error) {
      console.error('Error al eliminar garantía:', error);
      throw error;
    }
  },

  /**
   * Obtener resumen de garantías
   */
  obtenerResumen: async () => {
    try {
      const response = await api.get('/garantias/resumen');
      return response;
    } catch (error) {
      console.error('Error al obtener resumen:', error);
      throw error;
    }
  },

  /**
   * Regenerar garantías por pieza
   */
  regenerarPiezas: async (idGarantia) => {
    try {
      const response = await api.post(`/garantias/${idGarantia}/regenerar-piezas`);
      return response;
    } catch (error) {
      console.error('Error al regenerar piezas:', error);
      throw error;
    }
  },
};

export default garantiaService;
