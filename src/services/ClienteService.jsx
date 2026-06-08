// services/clienteService.js
import api from './api';

export const clienteService = {

  registrarCliente: async (clienteData) => {
  const response = await api.post('/inicioAgregar', clienteData);
  if (response.token) {
    api.setToken(response.token);
  }
  return {
    success: true,
    data: response,
    message: response.message || 'Cliente registrado exitosamente'
  };
},
 

  obtenerPerfil: async () => {
    try {
      const clienteLocal = JSON.parse(localStorage.getItem('user_data') || '{}');
      const id = clienteLocal.id_cliente;
      if (!id) throw new Error('No se encontró el ID del cliente en user_data');
      const response = await api.get(`/cliente/${id}`);
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

  obtenerMisDispositivos: async () => {
    try {
      const response = await api.get('/cliente/mis-dispositivos');
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

  obtenerDetalleDispositivo: async (idDispositivo) => {
    try {
      const response = await api.get(`/cliente/dispositivo/${idDispositivo}`);
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

  // ============================================
  // ✅ HISTORIAL DE REPARACIONES (VERSIÓN CORREGIDA)
  // ============================================

  /**
   * Obtener historial COMPLETO de reparaciones del cliente
   * Incluye: reparaciones con diagnóstico + reparaciones directas (sin diagnóstico)
   */
 obtenerMiHistorial: async (params = {}) => {
    try {
        const response = await api.get('/cliente/historial-reparaciones', { params });
        
        console.log('✅ Respuesta del historial:', response.data);
        
        const rawData = response.data;
        
        // Caso 1: { success: true, data: [...] }
        if (rawData?.success && rawData?.data) {
            return { success: true, data: rawData.data, count: rawData.count || 0 };
        }
        
        // Caso 2: api.js ya extrajo y devuelve el array directo
        if (Array.isArray(rawData)) {
            return { success: true, data: rawData, count: rawData.length };
        }
        
        // Caso 3: { data: [...] } sin success
        if (rawData?.data && Array.isArray(rawData.data)) {
            return { success: true, data: rawData.data, count: rawData.data.length };
        }
        
        return { success: false, data: [], message: 'Formato de respuesta inesperado' };
        
    } catch (error) {
        console.error('❌ Error al obtener historial:', error);
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || 'Error interno del servidor',
            type: 'API_ERROR'
        };
    }
},

  /**
   * Obtener solo reparaciones TERMINADAS del cliente
   */
  obtenerHistorialTerminado: async () => {
    const result = await clienteService.obtenerMiHistorial();
    if (result.success) {
      result.data = result.data.filter(r => r.estado === 'TERMINADO' || r.estado_general === 'TERMINADA');
      result.count = result.data.length;
    }
    return result;
  },

  /**
   * Obtener solo reparaciones DIRECTAS (sin diagnóstico)
   */
  obtenerReparacionesDirectas: async () => {
    const result = await clienteService.obtenerMiHistorial();
    if (result.success) {
      result.data = result.data.filter(r => r.tipo === 'sin_diagnostico');
      result.count = result.data.length;
    }
    return result;
  },

  /**
   * Obtener resumen estadístico del historial
   */
  obtenerResumenHistorial: async () => {
    const result = await clienteService.obtenerMiHistorial();
    
    if (!result.success) {
      return {
        success: false,
        data: null,
        message: result.message
      };
    }
    
    const historial = result.data;
    
    const resumen = {
      total: historial.length,
      con_diagnostico: historial.filter(h => h.tipo === 'con_diagnostico').length,
      sin_diagnostico: historial.filter(h => h.tipo === 'sin_diagnostico').length,
      terminadas: historial.filter(h => h.estado === 'TERMINADO' || h.estado_general === 'TERMINADA').length,
      en_proceso: historial.filter(h => 
        ['EN_REPARACION', 'PENDIENTE', 'ESPERANDO_PIEZA'].includes(h.estado) ||
        ['EN_REPARACION', 'PENDIENTE'].includes(h.estado_general)
      ).length,
      canceladas: historial.filter(h => h.estado === 'CANCELADO' || h.estado_general === 'CANCELADA').length,
      costo_total: historial.reduce((sum, h) => sum + (h.costo_total || 0), 0),
      costo_promedio: historial.length > 0 
        ? historial.reduce((sum, h) => sum + (h.costo_total || 0), 0) / historial.length 
        : 0
    };
    
    return {
      success: true,
      data: resumen,
      message: 'Resumen obtenido'
    };
  },

  // ============================================
  // MÉTODOS EXISTENTES
  // ============================================

  obtenerUltimoCliente: async () => {
    try {
      const response = await api.get('/ultimoCliente');
      return response;
    } catch (error) {
      return error;
    }
  },

  obtenerClientes: async (params = {}) => {
    try {
      const response = await api.get('/clientes', { params });
      return {
        success: true,
        data: response.data,
        total: response.meta?.total || response.data.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        type: error.type
      };
    }
  },

  obtenerClientePorId: async (id) => {
    try {
      const response = await api.get(`/clientes/${id}`);
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

  buscarClienteConDispositivos: async (query) => {
    try {
      if (!query || query.trim().length < 3) {
        return {
          success: false,
          message: 'Ingresá al menos 3 caracteres para buscar'
        };
      }
      
      const response = await api.get('/cliente-buscar', { 
        params: { q: query.trim() } 
      });
      
      if (response.data && response.data.id_cliente) {
        return {
          success: true,
          data: response.data,
          message: 'Cliente encontrado'
        };
      }
      
      return {
        success: false,
        message: response.data?.message || 'Cliente no encontrado'
      };
      
    } catch (error) {
      console.error('❌ Error en buscarClienteConDispositivos:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Error al buscar cliente'
      };
    }
  },

  actualizarCliente: async (id, datos) => {
    try {
      const response = await api.put(`/clientes/${id}`, datos);
      return {
        success: true,
        data: response.data,
        message: 'Cliente actualizado exitosamente'
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

  eliminarCliente: async (id) => {
    try {
      const response = await api.delete(`/cliente/${id}`);
      return {
        success: true,
        message: response.data.message || 'Cliente eliminado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        type: error.type
      };
    }
  },
};

// Alias para compatibilidad
export const obtenerUltimoCliente = clienteService.obtenerUltimoCliente;
export const registrarCliente = clienteService.registrarCliente;
export const obtenerClientes = clienteService.obtenerClientes;