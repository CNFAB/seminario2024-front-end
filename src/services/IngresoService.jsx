import api from './api';

export const ingresoService = {
  /**
   * Registrar un nuevo ingreso de dispositivo
   */
  registrar: async (ingresoData) => {
    try {
      // FormData para enviar archivos
      const formData = new FormData();
      
      // Agregar campos básicos
      Object.keys(ingresoData).forEach(key => {
        if (ingresoData[key] !== null && ingresoData[key] !== undefined) {
          if (key === 'foto_frontal' || key === 'foto_trasera') {
            // Archivos ya deben ser objetos File
            if (ingresoData[key]) {
              formData.append(key, ingresoData[key]);
            }
          } else {
            formData.append(key, ingresoData[key]);
          }
        }
      });

      const response = await api.post('/ingresoD-agregar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
  
      return response;
    } catch (error) {
      throw error;
    }
  },
   obtenerResumenReparaciones: async (idIngreso) => {
    try {
      const response = await api.get(`/reparacion-multiple/resumen-ingreso/${idIngreso}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener resumen de reparaciones del ingreso ${idIngreso}:`, error);
      throw error;
    }
  },
   pagarLocalYRetirar: async (idIngreso) => {
    try {
      const response = await api.post(`/ingresos/${idIngreso}/pagar-local`);
      return response;
    } catch (error) {
      console.error(`Error al pagar en local el ingreso ${idIngreso}:`, error);
      throw error;
    }
  },
   obtenerListosPorCliente: async (idCliente) => {
    try {
      const response = await api.get(`/ingresos/cliente/${idCliente}/listos`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener dispositivos listos del cliente ${idCliente}:`, error);
      throw error;
    }
  },
   obtenerEnTaller: async () => {
    try {
      const response = await api.get('/ingresos/taller');
      return response.data;
    } catch (error) {
      console.error('Error al obtener ingresos en taller:', error);
      throw error;
    }
  },
   obtenerRetirados: async () => {
    try {
      const response = await api.get('/ingresos/retirados');
      return response.data;
    } catch (error) {
      console.error('Error al obtener ingresos retirados:', error);
      throw error;
    }
  },

  /**
   * Obtener todos los ingresos
   */
  obtenerTodos: async (params = {}) => {
    try {
      const response = await api.get('/ingresoD', { params });
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Obtener ingreso por ID
   */
  obtenerPorId: async (idIngreso) => {
    try {
      const response = await api.get(`/ingresoD/${idIngreso}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  obtenerPorDispositivo: async (idDispositivo, idTecnico = null) => {
    try {
      let url = `/ingresos/dispositivo/${idDispositivo}`;
      if (idTecnico) {
        url += `/${idTecnico}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener ingresos del dispositivo ${idDispositivo}:`, error);
      throw error;
    }
  },
  obtenerListosParaRetirar: async () => {
    try {
      const response = await api.get('/ingresos/listos-para-retirar');
      return response.data;
    } catch (error) {
      console.error('Error al obtener ingresos listos para retirar:', error);
      throw error;
    }
  },
  marcarComoRetirado: async (idIngreso) => {
    try {
      const response = await api.patch(`/ingresos/${idIngreso}/marcar-retirado`);
      return response.data;
    } catch (error) {
      console.error(`Error al marcar ingreso ${idIngreso} como retirado:`, error);
      throw error;
    }
  },

  // ✅ MÉTODO FALTANTE 4: Cambiar estado
  cambiarEstado: async (idIngreso, estado) => {
    try {
      const response = await api.patch(`/ingresos/${idIngreso}/cambiar-estado`, { estado });
      return response.data;
    } catch (error) {
      console.error(`Error al cambiar estado del ingreso ${idIngreso}:`, error);
      throw error;
    }
  },

  // ✅ MÉTODO FALTANTE 5: Retirar dispositivo (nuevo)
  retirarDispositivo: async (idIngreso) => {
    try {
      const response = await api.patch(`/ingresos/${idIngreso}/retirar`);
      return response.data;
    } catch (error) {
      console.error(`Error al retirar dispositivo ${idIngreso}:`, error);
      throw error;
    }
  },

  // ✅ MÉTODO FALTANTE 6: Obtener pendientes de revisión
  obtenerRevision: async () => {
    try {
      const response = await api.get('/ingresoD/revision');
      return response.data;
    } catch (error) {
      console.error('Error al obtener ingresos pendientes de revisión:', error);
      throw error;
    }
  },
  obtenerPorCliente: async (idCliente) => {
    try {
      const response = await api.get(`/ingresos/cliente/${idCliente}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener ingresos del cliente ${idCliente}:`, error);
      throw error;}
    },

   // Obtener ingresos por estado
  obtenerPorEstado: async (estado) => {
    try {
      const response = await api.get('/ingresos', {
        params: { estado: estado }
      });
      return response.data;
    } catch (error) {
      console.error(`Error al obtener ingresos por estado ${estado}:`, error);
      throw error;
    }
  },// Actualizar ingreso
  actualizar: async (id, datosActualizados) => {
    try {
      const response = await api.put(`/ingresos/${id}`, datosActualizados);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar ingreso ${id}:`, error);
      throw error;
    }
  }
};