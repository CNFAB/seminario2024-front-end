// services/reasignacionReparacionService.js
import api from './api';

export const reasignacionReparacionService = {

  obtenerTecnicosDisponibles: async () => {
    try {
      const response = await api.get('/auth/usuario/reparaciones/tecnicos-disponibles');
      return response.data || response;
    } catch (error) {
      console.error('Error al obtener técnicos disponibles:', error);      throw error;
    }
  },


obtenerPendientesPorTecnico: async (idTecnico) => {
    const response = await api.get(`/reparaciones/activas-tecnico/${idTecnico}`);
    return response.data || response;
},

  reasignarMultiplesReparaciones: async (idsReparaciones, idTecnicoNuevo) => {
    try {
      const response = await api.post('/auth/usuario/reparaciones/reasignar-multiples', {
        ids_reparaciones: idsReparaciones,
        id_tecnico_nuevo: idTecnicoNuevo,
      });
      return response.data || response;
    } catch (error) {
      console.error('Error al reasignar reparaciones:', error);
      throw error;
    }
  },
};