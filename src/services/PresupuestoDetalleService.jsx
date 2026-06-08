import api from './api';

/**
 * Servicio para gestionar detalles de presupuestos
 */
class PresupuestoDetalleService {
  
  /**
   * Obtener lista de detalles con filtros
   * @param {Object} params - Parámetros de filtrado
   * @param {number} params.id_presupuesto - ID del presupuesto
   * @param {number} params.id_pieza - ID de la pieza
   * @param {boolean} params.aprobado - Estado de aprobación
   * @param {number} params.per_page - Cantidad por página
   * @param {number} params.page - Número de página
   */
  async getDetalles(params = {}) {
    try {
      const response = await api.get('/presupuestos-detalles', { params });
      return {
        success: true,
        data: response.data || response,
        message: 'Detalles obtenidos correctamente'
      };
    } catch (error) {
      console.error('Error al obtener detalles:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener detalles',
        error: error
      };
    }
  }

  /**
   * Obtener detalles de un presupuesto específico
   * @param {number} idPresupuesto - ID del presupuesto
   */
  async getDetallesByPresupuesto(idPresupuesto) {
    try {
      const response = await api.get(`/presupuestos/${idPresupuesto}/detalles`);
      return {
        success: true,
        data: response.data || response,
        message: 'Detalles del presupuesto obtenidos correctamente'
      };
    } catch (error) {
      console.error('Error al obtener detalles del presupuesto:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener detalles',
        error: error
      };
    }
  }

  /**
   * Obtener un detalle por ID
   * @param {number} id - ID del detalle
   */
  async getDetalleById(id) {
    try {
      const response = await api.get(`/presupuestos-detalles/${id}`);
      return {
        success: true,
        data: response.data || response,
        message: 'Detalle obtenido correctamente'
      };
    } catch (error) {
      console.error('Error al obtener detalle:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener detalle',
        error: error
      };
    }
  }

  /**
   * Crear un nuevo detalle
   * @param {Object} detalleData - Datos del detalle
   * @param {number} detalleData.id_presupuesto - ID del presupuesto
   * @param {number} detalleData.id_pieza - ID de la pieza
   * @param {string} detalleData.descripcion - Descripción
   * @param {number} detalleData.costo - Costo
   * @param {boolean} detalleData.aprobado - Estado de aprobación
   */
  async crearDetalle(detalleData) {
    try {
      const response = await api.post('/presupuestos-detalles', detalleData);
      return {
        success: true,
        data: response.data || response,
        message: 'Detalle creado exitosamente'
      };
    } catch (error) {
      console.error('Error al crear detalle:', error);
      return {
        success: false,
        message: error.message || 'Error al crear detalle',
        errors: error.errors,
        error: error
      };
    }
  }

  /**
   * Actualizar un detalle
   * @param {number} id - ID del detalle
   * @param {Object} data - Datos a actualizar
   * @param {number} data.id_pieza - ID de la pieza
   * @param {string} data.descripcion - Descripción
   * @param {number} data.costo - Costo
   * @param {boolean} data.aprobado - Estado de aprobación
   */
  async actualizarDetalle(id, data) {
    try {
      const response = await api.put(`/presupuestos-detalles/${id}`, data);
      return {
        success: true,
        data: response.data || response,
        campos_actualizados: response.campos_actualizados || Object.keys(data),
        message: 'Detalle actualizado correctamente'
      };
    } catch (error) {
      console.error('Error al actualizar detalle:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar detalle',
        errors: error.errors,
        error: error
      };
    }
  }

  /**
   * Actualizar parcialmente un detalle
   * @param {number} id - ID del detalle
   * @param {Object} data - Datos a actualizar
   */
  async actualizarDetalleParcial(id, data) {
    try {
      const response = await api.patch(`/presupuestos-detalles/${id}`, data);
      return {
        success: true,
        data: response.data || response,
        message: 'Detalle actualizado correctamente'
      };
    } catch (error) {
      console.error('Error al actualizar detalle:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar detalle',
        errors: error.errors,
        error: error
      };
    }
  }

  /**
   * Eliminar un detalle
   * @param {number} id - ID del detalle
   */
  async eliminarDetalle(id) {
    try {
      const response = await api.delete(`/presupuestos-detalles/${id}`);
      return {
        success: true,
        data: response.data || response,
        message: 'Detalle eliminado correctamente'
      };
    } catch (error) {
      console.error('Error al eliminar detalle:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar detalle',
        error: error
      };
    }
  }

  /**
   * Cambiar estado de aprobación de un detalle
   * @param {number} id - ID del detalle
   */
  async toggleAprobado(id) {
    try {
      const response = await api.patch(`/presupuestos-detalles/${id}/aprobar`);
      return {
        success: true,
        data: response.data || response,
        message: response.data?.message || 'Estado de aprobación cambiado'
      };
    } catch (error) {
      console.error('Error al cambiar estado de aprobación:', error);
      return {
        success: false,
        message: error.message || 'Error al cambiar estado de aprobación',
        error: error
      };
    }
  }

  /**
   * Aprobar un detalle específico
   * @param {number} id - ID del detalle
   */
  async aprobarDetalle(id) {
    const detalle = await this.getDetalleById(id);
    if (detalle.success && detalle.data.aprobado !== true) {
      return this.toggleAprobado(id);
    }
    return {
      success: true,
      message: 'El detalle ya estaba aprobado'
    };
  }

  /**
   * Desaprobar un detalle específico
   * @param {number} id - ID del detalle
   */
  async desaprobarDetalle(id) {
    const detalle = await this.getDetalleById(id);
    if (detalle.success && detalle.data.aprobado !== false) {
      return this.toggleAprobado(id);
    }
    return {
      success: true,
      message: 'El detalle ya estaba desaprobado'
    };
  }

  /**
   * Obtener estadísticas de detalles
   * @param {number} idPresupuesto - ID del presupuesto (opcional)
   */
  async getEstadisticas(idPresupuesto = null) {
    try {
      const params = idPresupuesto ? { id_presupuesto: idPresupuesto } : {};
      const response = await api.get('/presupuestos-detalles/estadisticas/resumen', { params });
      return {
        success: true,
        data: response.data || response,
        message: 'Estadísticas obtenidas correctamente'
      };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener estadísticas',
        error: error
      };
    }
  }

  /**
   * Copiar detalles de un presupuesto a otro
   * @param {number} origenId - ID del presupuesto origen
   * @param {number} destinoId - ID del presupuesto destino
   */
  async copiarDetalles(origenId, destinoId) {
    try {
      const response = await api.post('/presupuestos-detalles/copiar', {
        origen_id: origenId,
        destino_id: destinoId
      });
      return {
        success: true,
        data: response.data || response,
        message: response.data?.message || 'Detalles copiados correctamente'
      };
    } catch (error) {
      console.error('Error al copiar detalles:', error);
      return {
        success: false,
        message: error.message || 'Error al copiar detalles',
        error: error
      };
    }
  }

  /**
   * Actualizar costo de un detalle (método rápido)
   * @param {number} id - ID del detalle
   * @param {number} nuevoCosto - Nuevo costo
   */
  async actualizarCosto(id, nuevoCosto) {
    return this.actualizarDetalleParcial(id, { costo: nuevoCosto });
  }

  /**
   * Actualizar descripción de un detalle
   * @param {number} id - ID del detalle
   * @param {string} nuevaDescripcion - Nueva descripción
   */
  async actualizarDescripcion(id, nuevaDescripcion) {
    return this.actualizarDetalleParcial(id, { descripcion: nuevaDescripcion });
  }
}

export default new PresupuestoDetalleService();