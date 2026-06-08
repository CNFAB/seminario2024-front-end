// services/diagnosticoService.js
import api from './api'; // Importa tu instancia configurada

export const diagnosticoService = {
  // ============================================
  // MÉTODOS EXISTENTES
  // ============================================
  crear: async (diagnosticoData) => {
    try {
      const response = await api.post('/diagnosticos', diagnosticoData);
      return response.data;
    } catch (error) {
      console.error('Error al crear diagnóstico:', error);
      throw error;
    }
  },

  // Aprobar una pieza específica de un diagnóstico
  aprobarPiezaDiagnostico: async (idDiagnosticoPieza) => {
    try {
      console.log(`📡 Aprobando pieza #${idDiagnosticoPieza}`);
      const response = await api.patch(`/diagnostico-piezas/${idDiagnosticoPieza}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error al aprobar pieza del diagnóstico:', error);
      throw error;
    }
  },

  rechazarPiezaDiagnostico: async (idDiagnosticoPieza, comentario = null) => {
    try {
      console.log(`📡 Rechazando pieza #${idDiagnosticoPieza}`);
      const response = await api.patch(`/diagnostico-piezas/${idDiagnosticoPieza}/reject`, {
        comentario: comentario
      });
      return response.data;
    } catch (error) {
      console.error('Error al rechazar pieza del diagnóstico:', error);
      throw error;
    }
  },

  // Cliente acepta diagnóstico
  clienteAceptar: async (idDiagnostico) => {
    try {
      console.log(`📡 Cliente aceptando diagnóstico #${idDiagnostico}`);
      const response = await api.patch(`/diagnosticos/${idDiagnostico}/cambiar-estado`, {
        estado: 'APROBADO'
      });
      return response;
    } catch (error) {
      console.error(`❌ Error al aceptar diagnóstico ${idDiagnostico}:`, error);
      throw error;
    }
  },

  // Cliente rechaza diagnóstico
  clienteRechazar: async (idDiagnostico) => {
    try {
      console.log(`📡 Cliente rechazando diagnóstico #${idDiagnostico}`);
      const response = await api.patch(`/diagnosticos/${idDiagnostico}/cambiar-estado`, {
        estado: 'RECHAZADO'
      });
      return response;
    } catch (error) {
      console.error(`❌ Error al rechazar diagnóstico ${idDiagnostico}:`, error);
      throw error;
    }
  },

  crearAutomatico: async (idIngreso, observacion = '') => {
    try {
      const response = await api.post('/diagnosticos/crear-automatico', {
        id_ingreso: idIngreso,
        observacion: observacion
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear diagnóstico automático:', error);
      throw error;
    }
  },

  obtenerTodos: async (params = {}) => {
    try {
      const response = await api.get('/diagnosticos', { params });
      const diagnosticos = response.data.data || response.data || [];
      return diagnosticos;
    } catch (error) {
      console.error('Error al obtener diagnósticos:', error);
      throw error;
    }
  },

  obtenerIngresosPorDispositivo: async (idDispositivo, idTecnico = null) => {
    const url = idTecnico 
        ? `/ingresos/dispositivo/${idDispositivo}/${idTecnico}`
        : `/ingresos/dispositivo/${idDispositivo}`;
    const response = await api.get(url);
    return response?.data || response || [];
  },

  obtenerPorIngreso: async (ingresoId) => {
    try {
      console.log(`📡 Obteniendo diagnósticos del ingreso #${ingresoId}`);
      const response = await api.get(`/diagnosticos/ingreso/${ingresoId}`);
      const lista = response?.data?.data || response?.data || [];
      return Array.isArray(lista) ? lista : [lista];
    } catch (error) {
      console.error(`❌ Error al obtener diagnósticos del ingreso ${ingresoId}:`, error);
      throw error;
    }
  },

  obtenerPorId: async (id) => {
    try {
      const response = await api.get(`/diagnosticos/${id}`);
      return response;
    } catch (error) {
      console.error(`Error al obtener diagnóstico ${id}:`, error);
      throw error;
    }
  },

  obtenerPorTecnico: async (idTecnico) => {
    try {
      const response = await api.get(`/diagnosticos/tecnico/${idTecnico}`);
      return response;
    } catch (error) {
      console.error('Error al obtener diagnósticos del técnico:', error);
      throw error;
    }
  },

  obtenerPorEstado: async (estado) => {
    try {
      const response = await api.get('/diagnosticos', {
        params: { estado }
      });
      return response;
    } catch (error) {
      console.error(`Error al obtener diagnósticos por estado ${estado}:`, error);
      throw error;
    }
  },

  obtenerMisPendientes: async () => {
    try {
      const response = await api.get('/diagnosticos/mis-pendientes');
      return response;
    } catch (error) {
      console.error('Error al obtener mis diagnósticos pendientes:', error);
      throw error;
    }
  },

  actualizar: async (id, datosActualizados) => {
    try {
      console.log('📤 Enviando actualización:', { id, datos: datosActualizados });
      const response = await api.put(`/diagnosticos/${id}`, datosActualizados);
      return response;
    } catch (error) {
      console.error(`Error al actualizar diagnóstico ${id}:`, error);
      throw error;
    }
  },

  actualizarEstado: async (id, nuevoEstado) => {
    try {
      const response = await api.patch(`/diagnosticos/${id}/cambiar-estado`, {
        estado: nuevoEstado
      });
      return response;
    } catch (error) {
      console.error(`Error al actualizar estado del diagnóstico ${id}:`, error);
      throw error;
    }
  },

  completarDiagnostico: async (id, datosCompletos) => {
    try {
      const response = await api.post(`/diagnosticos/${id}/completar`, datosCompletos);
      return response;
    } catch (error) {
      console.error(`Error al completar diagnóstico ${id}:`, error);
      throw error;
    }
  },

  aprobarDiagnostico: async (id, aprobado = true) => {
    try {
      const response = await api.post(`/diagnosticos/${id}/aprobar`, {
        aprobado: aprobado
      });
      return response;
    } catch (error) {
      console.error(`Error al aprobar diagnóstico ${id}:`, error);
      throw error;
    }
  },

  obtenerEstadisticas: async () => {
    try {
      const response = await api.get('/diagnosticos/estadisticas');
      return response;
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  },

  obtenerCargaTecnicos: async () => {
    try {
      const response = await api.get('/diagnosticos/carga-trabajo-tecnicos');
      console.log('📊 Respuesta completa:', response);
      return Array.isArray(response) ? response : 
             Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('❌ Error carga técnicos:', error);
      return [];
    }
  },

  crearAutomaticoConTecnico: async (idIngreso, idTecnico, observacion = '') => {
    try {
      const response = await api.post('/diagnosticos/crear-automatico', {
        id_ingreso: idIngreso,
        id_usuario: idTecnico,
        observacion: observacion,
      });
      return response.data;
    } catch (error) {
      console.error('Error al crear diagnóstico automático con técnico:', error);
      throw error;
    }
  },

  buscar: async (filtros) => {
    try {
      const response = await api.post('/diagnosticos/buscar', filtros);
      return response;
    } catch (error) {
      console.error('Error al buscar diagnósticos:', error);
      throw error;
    }
  },

  eliminar: async (id) => {
    try {
      const response = await api.delete(`/diagnosticos/${id}`);
      return response;
    } catch (error) {
      console.error(`Error al eliminar diagnóstico ${id}:`, error);
      throw error;
    }
  },

  // ============================================
  // MÉTODO PARA CLIENTES
  // ============================================
  obtenerPorDispositivoCliente: async (idDispositivo) => {
    try {
      console.log(`📡 Obteniendo diagnósticos para dispositivo #${idDispositivo}`);
      const response = await api.get(`/diagnosticos/dispositivo/${idDispositivo}`);
      const diagnosticos = response.data?.data || response.data || [];
      console.log(`✅ Recibidos ${diagnosticos.length} diagnósticos`);
      return diagnosticos;
    } catch (error) {
      console.error(`❌ Error al obtener diagnósticos del dispositivo ${idDispositivo}:`, error);
      throw error;
    }
  },

  // ============================================
  // MÉTODOS PARA GESTIÓN DE PIEZAS
  // ============================================

  obtenerConPiezas: async (id) => {
    try {
      const response = await api.get(`/diagnosticos/${id}/con-piezas`);
      return response;
    } catch (error) {
      console.error(`Error al obtener diagnóstico ${id} con piezas:`, error);
      throw error;
    }
  },

  agregarPieza: async (diagnosticoId, data) => {
    try {
      console.log(`📡 Agregando pieza al diagnóstico #${diagnosticoId}:`, data);
      const response = await api.post(`/diagnosticos/${diagnosticoId}/piezas`, data);
      return response;
    } catch (error) {
      console.error(`Error al agregar pieza al diagnóstico ${diagnosticoId}:`, error);
      throw error;
    }
  },

  eliminarPieza: async (diagnosticoId, piezaId) => {
    try {
      console.log(`📡 Eliminando pieza ${piezaId} del diagnóstico #${diagnosticoId}`);
      const response = await api.delete(`/diagnosticos/${diagnosticoId}/piezas/${piezaId}`);
      return response;
    } catch (error) {
      console.error(`Error al eliminar pieza del diagnóstico ${diagnosticoId}:`, error);
      throw error;
    }
  },

  actualizarCostoPieza: async (diagnosticoId, piezaId, costo) => {
    try {
      const response = await api.patch(`/diagnosticos/${diagnosticoId}/piezas/${piezaId}`, {
        costo: costo
      });
      return response;
    } catch (error) {
      console.error(`Error al actualizar costo de pieza:`, error);
      throw error;
    }
  },

  enviarAprobacion: async (diagnosticoId) => {
    try {
      console.log(`📡 Enviando diagnóstico #${diagnosticoId} a aprobación`);
      const response = await api.post(`/diagnosticos/${diagnosticoId}/enviar-aprobacion`);
      return response;
    } catch (error) {
      console.error(`Error al enviar diagnóstico a aprobación:`, error);
      throw error;
    }
  },

  calcularCostoTotal: async (diagnosticoId) => {
    try {
      const response = await api.get(`/diagnosticos/${diagnosticoId}/calcular-costo`);
      return response;
    } catch (error) {
      console.error(`Error al calcular costo total:`, error);
      throw error;
    }
  },
};