// services/DispositivoService.js
import api from './api';

export const dispositivoService = {
  /**
   * Obtener TODOS los dispositivos (NUEVO)
   */
  obtenerTodos: async () => {
    try {
      const response = await api.get('/dispositivo');
      console.log("dispositivo",response);
      return {
        success: true,
        data: response.data,
        message: 'Dispositivos obtenidos exitosamente'
      };
    } catch (error) {
      console.error('Error al obtener dispositivos:', error);
      return {
        success: false,
        error: error.message,
        type: error.type
      };
    }
  },

  /**
   * Registrar un nuevo dispositivo
   */
  registrar: async (dispositivoData) => {
    try {
      const response = await api.post('/dispositivo-agregar', dispositivoData);
      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Dispositivo registrado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errors: error.errors,
        type: error.type
      };
    }
  },

  /**
   * Obtener dispositivos de un cliente
   */
  obtenerPorCliente: async (idCliente) => {
    try {
      const response = await api.get(`/clientes/${idCliente}/dispositivos`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        type: error.type
      };
    }
  },

  /**
   * Obtener último dispositivo
   */
  obtenerUltimo: async () => {
    try {
      const response = await api.get('/ultimoDispositivo');
      console.log(response);
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener dispositivo por ID
   */
  obtenerPorId: async (idDispositivo) => {
    try {
      const response = await api.get(`/dispositivos/${idDispositivo}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        type: error.type
      };
    }
  },

  /**
   * Actualizar dispositivo
   */
  actualizar: async (idDispositivo, datos) => {
    try {
      const response = await api.put(`/dispositivos/${idDispositivo}`, datos);
      return {
        success: true,
        data: response.data,
        message: 'Dispositivo actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errors: error.errors,
        type: error.type
      };
    }
  },

  /**
   * Eliminar dispositivo
   */
  eliminar: async (idDispositivo) => {
    try {
      const response = await api.delete(`/dispositivos/${idDispositivo}`);
      return {
        success: true,
        message: response.data.message || 'Dispositivo eliminado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        type: error.type
      };
    }
  }
};