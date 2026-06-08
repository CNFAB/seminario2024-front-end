// services/reasignacionService.js (o crea uno nuevo reasignacionDiagnosticoService.js)
import api from './api';

export const reasignacionDiagnosticoService = {
  // Obtener técnicos disponibles para diagnósticos
  obtenerTecnicosDisponibles: async () => {
    try {
     const response = await api.get('/auth/usuario/tecnicos/disponibles');
      return response.data || response;
    } catch (error) {
      console.error('Error al obtener técnicos disponibles:', error);
      throw error;
    }
  },

  // Obtener diagnósticos activos de un técnico
  obtenerPendientesPorTecnico: async (idTecnico) => {
    try {
      const response = await api.get(`/auth/usuario/diagnosticos/pendientes/${idTecnico}`);
      console.log('Diagnósticos recibidos:', response.data);
      return response.data || response;
    } catch (error) {
      console.error(`Error al obtener diagnósticos del técnico ${idTecnico}:`, error);
      throw error;
    }
  },

  // Reasignar múltiples diagnósticos
  reasignarMultiplesDiagnosticos: async (idsDiagnosticos, idTecnicoNuevo) => {
    try {
      const response = await api.post('/auth/usuario/diagnosticos/reasignar-multiples', {
        ids_diagnosticos: idsDiagnosticos,
        id_tecnico_nuevo: idTecnicoNuevo
      });
      return response.data || response;
    } catch (error) {
      console.error('Error al reasignar múltiples diagnósticos:', error);
      throw error;
    }
  }
};