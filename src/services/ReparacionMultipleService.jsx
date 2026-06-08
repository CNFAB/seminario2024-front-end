// services/reparacionMultipleService.js
import api from './api';

class ReparacionMultipleService {
  // ============================================
  // CRUD BÁSICO
  // ============================================

  /**
   * Obtener todas las reparaciones múltiples
   */
  async obtenerTodas(params = {}) {
    try {
      const response = await api.get('/reparacion-multiple', { params });
      return response.data;
    } catch (error) {
      console.error('Error al obtener reparaciones múltiples:', error);
      throw error;
    }
  }
  async enviarAprobacion(id) {
    const response = await api.post(`/reparacion-multiple/${id}/enviar-aprobacion`);
    return response.data;
  }
  async aprobarPieza(id) {
    const response = await api.post(`/reparacion-multiple/${id}/aprobar`);
    return response.data;
  }

  async rechazarPieza(id) {
    const response = await api.post(`/reparacion-multiple/${id}/rechazar`);
    return response.data;
  }
  async retomarDesdeEsperaPieza(id) {
    const response = await api.patch(`/reparacion-multiple/${id}/retomar`);
    return response.data;
  }

  /**
   * Obtener una reparación múltiple por ID
   */
  async obtenerPorId(id) {
    try {
      const response = await api.get(`/reparacion-multiple/${id}`);
      console.log('📡 Llamando a API con reparacion_id:', id);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener reparación múltiple ${id}:`, error);
      throw error;
    }
  }
  async obtenerCanceladasPorDispositivo(idDispositivo) {
    try {
      const response = await api.get(
        `/reparacion-multiple/canceladas-dispositivo/${idDispositivo}`
      );
      return response;
    } catch (error) {
      console.error('Error al obtener reparaciones canceladas:', error);
      throw error;
    }
  }

  async obtenerPendientesPorDispositivo(idDispositivo) {
    try {
      const response = await api.get(
        `/reparacion-multiple/pendientes-dispositivo/${idDispositivo}`
      );
      console.log('response obtenerPendientesPorDispositivo', response);
      return response;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  async obtenerEnProgresoPorDispositivo(idDispositivo) {
    try {
      const response = await api.get(
        `/reparacion-multiple/en-progreso-dispositivo/${idDispositivo}`
      );
      return response;
    } catch (error) {
      console.error('Error al obtener reparaciones en progreso:', error);
      throw error;
    }
  }
  async obtenerTerminadasPorDispositivo(idDispositivo) {
    try {
      const response = await api.get(
        `/reparacion-multiple/terminadas-dispositivo/${idDispositivo}`
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
  /**
   * Crear nueva reparación múltiple
   */
  async crear(datos) {
    try {
      console.log('📝 Creando reparación múltiple:', datos);
      const response = await api.post('/reparacion-multiple', datos);
      return response.data;
    } catch (error) {
      console.error('Error al crear reparación múltiple:', error);
      throw error;
    }
  }

  /**
   * Actualizar reparación múltiple
   */
  async actualizar(id, datos) {
    try {
      console.log('📝 Actualizando reparación múltiple:', { id, datos });

      // Eliminar id del body si viene
      const { id_multiple, ...datosLimpios } = datos;

      const response = await api.put(`/reparacion-multiple/${id}`, datosLimpios);
      return response.data;
    } catch (error) {
      console.error(`Error al actualizar reparación múltiple ${id}:`, error);
      throw error;
    }
  }

  /**
   * Actualización parcial (PATCH)
   */
  async actualizarParcial(id, datos) {
    try {
      console.log('📝 Actualización parcial múltiple:', { id, datos });
      const response = await api.patch(`/reparacion-multiple/${id}`, datos);
      return response.data;
    } catch (error) {
      console.error(`Error en actualización parcial múltiple ${id}:`, error);
      throw error;
    }
  }

  /**
   * Eliminar reparación múltiple
   */
  async eliminar(id) {
    try {
      const response = await api.delete(`/reparacion-multiple/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al eliminar reparación múltiple ${id}:`, error);
      throw error;
    }
  }
  async comenzar(id) {
    const response = await api.post(`/reparacion-multiple/${id}/comenzar`);
    return response.data;
  }

  async terminar(id, comentario = null) {
    const response = await api.post(`/reparacion-multiple/${id}/terminar`, {
      comentario_tecnico: comentario,
    });
    return response.data;
  }

  async esperarPieza(id, comentario = null) {
    const response = await api.post(`/reparacion-multiple/${id}/esperar-pieza`, {
      comentario_tecnico: comentario,
    });
    return response.data;
  }

  async cancelar(id, comentario = null) {
    const response = await api.post(`/reparacion-multiple/${id}/cancelar`, {
      comentario_tecnico: comentario,
    });
    return response.data;
  }

  // ============================================
  // CONSULTAS POR ESTADO
  // ============================================

  /**
   * Obtener reparaciones múltiples por estado
   */
  async obtenerPorEstado(estado) {
    try {
      const response = await api.get('/reparacion-multiple', {
        params: { estado },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener reparaciones por estado:', error);
      throw error;
    }
  }

  /**
   * Obtener reparaciones múltiples pendientes
   */
  async obtenerPendientes() {
    return this.obtenerPorEstado('PENDIENTE');
  }

  /**
   * Obtener reparaciones múltiples en proceso
   */
  async obtenerEnProceso() {
    return this.obtenerPorEstado('EN_REPARACION');
  }

  /**
   * Obtener reparaciones múltiples terminadas
   */
  async obtenerTerminadas() {
    return this.obtenerPorEstado('TERMINADO');
  }

  /**
   * Obtener reparaciones múltiples en espera de piezas
   */
  async obtenerEsperandoPieza() {
    return this.obtenerPorEstado('ESPERANDO_PIEZA');
  }

  /**
   * Obtener reparaciones múltiples canceladas
   */
  async obtenerCanceladas() {
    return this.obtenerPorEstado('CANCELADO');
  }

  // ============================================
  // CONSULTAS POR REPARACIÓN PRINCIPAL
  // ============================================

  /**
   * Obtener reparaciones múltiples por reparación principal
   */
  // En ReparacionMultipleService.js
  // En ReparacionMultipleService.js
  async obtenerPorReparacionId(id) {
    try {
      // Usa la ruta SIN el guión: /reparacion/{id} (línea 363)
      const response = await api.get(`/reparacion-multiple/reparacion/${id}`);

      console.log('🔍 Respuesta raw:', response);
      console.log('📦 response.data:', response.data);

      // Extrae el array de datos según la estructura
      if (response.data?.success && Array.isArray(response.data?.data)) {
        return response.data.data;
      }

      return response.data || [];
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
  async obtenerGarantiasRetiradasPorDispositivo(idDispositivo) {
    try {
      const response = await api.get(`/ingresos/dispositivo/${idDispositivo}/garantias-retiradas`);
      return response;
    } catch (error) {
      console.error('Error al obtener garantías retiradas:', error);
      throw error;
    }
  }

  // ============================================
  // ACCIONES ESPECÍFICAS (USANDO MÉTODOS DEL MODELO)
  // ============================================

  /**
   * Iniciar reparación
   */
  async iniciarReparacion(id, comentario = null) {
    try {
      return this.actualizarParcial(id, {
        estado: 'EN_REPARACION',
        fecha_ini_reparacion: new Date().toISOString(),
        comentario_tecnico: comentario,
      });
    } catch (error) {
      console.error('Error al iniciar reparación:', error);
      throw error;
    }
  }

  /**
   * Terminar reparación
   */
  async terminarReparacion(id, comentario = null) {
    try {
      // Primero obtener la reparación actual para calcular precio si es necesario
      const reparacion = await this.obtenerPorId(id);

      const datos = {
        estado: 'TERMINADO',
        fecha_fin_reparacion: new Date().toISOString(),
        comentario_tecnico: comentario,
      };

      // Si no tiene precio_total, calcularlo
      if (!reparacion?.data?.precio_total) {
        datos.precio_total = this.calcularPrecioEstimado(reparacion?.data);
      }

      return this.actualizarParcial(id, datos);
    } catch (error) {
      console.error('Error al terminar reparación:', error);
      throw error;
    }
  }

  /**
   * Marcar como esperando pieza
   */
  async esperandoPieza(id, comentario = null) {
    try {
      return this.actualizarParcial(id, {
        estado: 'ESPERANDO_PIEZA',
        comentario_tecnico: comentario,
      });
    } catch (error) {
      console.error('Error al marcar esperando pieza:', error);
      throw error;
    }
  }

  /**
   * Cancelar reparación
   */
  async cancelarReparacion(id, comentario = null) {
    try {
      return this.actualizarParcial(id, {
        estado: 'CANCELADO',
        fecha_fin_reparacion: new Date().toISOString(),
        comentario_tecnico: comentario,
      });
    } catch (error) {
      console.error('Error al cancelar reparación:', error);
      throw error;
    }
  }

  // ============================================
  // CÁLCULOS
  // ============================================

  /**
   * Calcular precio total (pieza + mano de obra)
   */
  async calcularPrecioTotal(id) {
    try {
      const response = await api.get(`/reparacion-multiple/${id}/calcular-precio`);
      return response.data;
    } catch (error) {
      console.error('Error al calcular precio total:', error);
      throw error;
    }
  }

  /**
   * Calcular precio estimado (sin guardar)
   */
  calcularPrecioEstimado(datos) {
    const precioPieza = datos?.pieza?.precio || 0;
    const manoObraPorcentaje = datos?.pieza?.categoria?.mano_obra || 0;

    return precioPieza + precioPieza * (manoObraPorcentaje / 100);
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  /**
   * Obtener estadísticas por técnico
   */
  async estadisticasPorTecnico(idTecnico) {
    try {
      const multiples = await this.obtenerPorTecnico(idTecnico);

      if (!multiples?.data) return null;

      const data = multiples.data;
      const total = data.length;
      const terminadas = data.filter((r) => r.estado === 'TERMINADO').length;
      const enProceso = data.filter((r) => r.estado === 'EN_REPARACION').length;
      const pendientes = data.filter((r) => r.estado === 'PENDIENTE').length;

      return {
        total,
        terminadas,
        enProceso,
        pendientes,
        eficiencia: total > 0 ? Math.round((terminadas / total) * 100) : 0,
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      throw error;
    }
  }

  /**
   * Obtener reparaciones por técnico
   */
  async obtenerPorTecnico(idTecnico) {
    try {
      const response = await api.get('/reparacion-multiple', {
        params: { id_usuario: idTecnico },
      });
      return response.data;
    } catch (error) {
      console.error('Error al obtener reparaciones por técnico:', error);
      throw error;
    }
  }
}

export default new ReparacionMultipleService();
