import api from './api';

/**
 * Servicio para gestionar presupuestos
 */
class PresupuestoService {
  
  /**
   * Obtener lista de presupuestos con filtros
   * @param {Object} params - Parámetros de filtrado
   * @param {string} params.estado - PENDIENTE, APROBADO, RECHAZADO
   * @param {number} params.id_usuario - ID del usuario
   * @param {number} params.id_ingreso - ID del ingreso
   * @param {string} params.fecha_desde - Fecha inicio
   * @param {string} params.fecha_hasta - Fecha fin
   * @param {number} params.per_page - Cantidad por página
   * @param {number} params.page - Número de página
   * @param {string} params.order_by - Campo para ordenar
   * @param {string} params.order_dir - asc/desc
   */
  async getPresupuestos(params = {}) {
    try {
      const response = await api.get('/presupuestos', { params });
      return {
        success: true,
        data: response.data || response,
        message: 'Presupuestos obtenidos correctamente'
      };
    } catch (error) {
      console.error('Error al obtener presupuestos:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener presupuestos',
        error: error
      };
    }
  }

  /**
   * Obtener un presupuesto por ID
   * @param {number} id - ID del presupuesto
   */
  async getPresupuestoById(id) {
    try {
      const response = await api.get(`/presupuestos/${id}`);
      return {
        success: true,
        data: response.data || response,
        message: 'Presupuesto obtenido correctamente'
      };
    } catch (error) {
      console.error('Error al obtener presupuesto:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener presupuesto',
        error: error
      };
    }
  }
  // Agrega estos métodos dentro de la clase PresupuestoService

  /**
   * Calcular y finalizar un presupuesto (cambiar a estado CALCULADO)
   * @param {number} id - ID del presupuesto
   */
  async calcularPresupuesto(id) {
    try {
      const response = await api.post(`/presupuestos/${id}/calcular`);
      return {
        success: true,
        data: response.data || response,
        total: response.data?.total || 0,
        message: response.data?.message || 'Presupuesto calculado correctamente'
      };
    } catch (error) {
      console.error('Error al calcular presupuesto:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al calcular presupuesto',
        error: error
      };
    }
  }

  /**
   * Reabrir un presupuesto calculado (solo admin)
   * @param {number} id - ID del presupuesto
   */
  async reabrirPresupuesto(id) {
    try {
      const response = await api.post(`/presupuestos/${id}/reabrir`);
      return {
        success: true,
        data: response.data || response,
        message: response.data?.message || 'Presupuesto reabierto correctamente'
      };
    } catch (error) {
      console.error('Error al reabrir presupuesto:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Error al reabrir presupuesto',
        error: error
      };
    }
  }
  // Agregar estos métodos a tu PresupuestoService

/**
 * Obtener presupuestos por dispositivo (solo CALCULADO)
 * @param {number} idDispositivo - ID del dispositivo
 */
async getPresupuestosByDispositivo(idDispositivo) {
  try {
    const response = await api.get('/presupuestos', {
      params: { id_ingreso: idDispositivo, estado: 'CALCULADO' }
    });
    return {
      success: true,
      data: response.data || response
    };
  } catch (error) {
    console.error('Error al obtener presupuestos:', error);
    return {
      success: false,
      message: error.message || 'Error al obtener presupuestos',
      error: error
    };
  }
}

/**
 * Aprobar presupuesto con selección de piezas
 * @param {number} id - ID del presupuesto
 * @param {Object} data - { detalles_aprobados: [], accion: string }
 */
async aprobarConSeleccion(id, data) {
  try {
    const response = await api.post(`/presupuestos/${id}/aprobar`, data);
    return {
      success: true,
      data: response.data || response,
      message: 'Presupuesto aprobado correctamente'
    };
  } catch (error) {
    console.error('Error al aprobar presupuesto:', error);
    return {
      success: false,
      message: error.message || 'Error al aprobar presupuesto',
      error: error
    };
  }
}

/**
 * Rechazar presupuesto
 * @param {number} id - ID del presupuesto
 */
async rechazarPresupuesto(id) {
  try {
    const response = await api.post(`/presupuestos/${id}/aprobar`, { accion: 'RECHAZAR' });
    return {
      success: true,
      data: response.data || response,
      message: 'Presupuesto rechazado'
    };
  } catch (error) {
    console.error('Error al rechazar presupuesto:', error);
    return {
      success: false,
      message: error.message || 'Error al rechazar presupuesto',
      error: error
    };
  }
}

  /**
   * Obtener presupuestos por estado
   * @param {string} estado - PENDIENTE, CALCULADO, APROBADO, RECHAZADO
   * @param {Object} params - Parámetros adicionales
   */
  async getPresupuestosByEstado(estado, params = {}) {
    try {
      const response = await api.get('/presupuestos', { 
        params: { ...params, estado } 
      });
      return {
        success: true,
        data: response.data || response,
        message: `Presupuestos con estado ${estado} obtenidos correctamente`
      };
    } catch (error) {
      console.error('Error al obtener presupuestos por estado:', error);
      return {
        success: false,
        message: error.message || 'Error al obtener presupuestos',
        error: error
      };
    }
  }
async getPresupuestosPendientesPorTecnico(tecnicoId) {
    try {
        const response = await api.get('/presupuestos/tecnicos/pendientes', {
            params: { id_usuario: tecnicoId }
        });
        return {
            success: true,
            data: response.data || response
        };
    } catch (error) {
        console.error('Error al obtener presupuestos del técnico:', error);
        return {
            success: false,
            message: error.message || 'Error al obtener presupuestos',
            error: error
        };
    }
}

  /**
   * Crear un nuevo presupuesto
   * @param {Object} presupuestoData - Datos del presupuesto
   * @param {number} presupuestoData.id_ingreso - ID del ingreso
   * @param {string} presupuestoData.fecha_validez - Fecha de validez
   * @param {Array} presupuestoData.detalles - Lista de detalles
   * @param {number} presupuestoData.detalles[].id_pieza - ID de la pieza
   * @param {string} presupuestoData.detalles[].descripcion - Descripción
   * @param {number} presupuestoData.detalles[].costo - Costo
   */
  async crearPresupuesto(presupuestoData) {
    try {
      const response = await api.post('/presupuestos', presupuestoData);
      return {
        success: true,
        data: response.data || response,
        message: 'Presupuesto creado exitosamente'
      };
    } catch (error) {
      console.error('Error al crear presupuesto:', error);
      return {
        success: false,
        message: error.message || 'Error al crear presupuesto',
        errors: error.errors,
        error: error
      };
    }
  }

  /**
   * Actualizar un presupuesto (parcial o completo)
   * @param {number} id - ID del presupuesto
   * @param {Object} data - Datos a actualizar
   * @param {string} data.estado - PENDIENTE, APROBADO, RECHAZADO
   * @param {string} data.fecha_validez - Fecha de validez
   * @param {number} data.total_estimado - Total estimado
   */
  async actualizarPresupuesto(id, data) {
    try {
      const response = await api.put(`/presupuestos/${id}`, data);
      return {
        success: true,
        data: response.data || response,
        campos_actualizados: response.campos_actualizados || Object.keys(data),
        message: 'Presupuesto actualizado correctamente'
      };
    } catch (error) {
      console.error('Error al actualizar presupuesto:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar presupuesto',
        errors: error.errors,
        error: error
      };
    }
  }

  /**
   * Actualizar parcialmente un presupuesto (PATCH)
   * @param {number} id - ID del presupuesto
   * @param {Object} data - Datos a actualizar
   */
  async actualizarPresupuestoParcial(id, data) {
    try {
      const response = await api.patch(`/presupuestos/${id}`, data);
      return {
        success: true,
        data: response.data || response,
        message: 'Presupuesto actualizado correctamente'
      };
    } catch (error) {
      console.error('Error al actualizar presupuesto:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar presupuesto',
        errors: error.errors,
        error: error
      };
    }
  }

  /**
   * Eliminar un presupuesto
   * @param {number} id - ID del presupuesto
   */
  async eliminarPresupuesto(id) {
    try {
      const response = await api.delete(`/presupuestos/${id}`);
      return {
        success: true,
        data: response.data || response,
        message: 'Presupuesto eliminado correctamente'
      };
    } catch (error) {
      console.error('Error al eliminar presupuesto:', error);
      return {
        success: false,
        message: error.message || 'Error al eliminar presupuesto',
        error: error
      };
    }
  }

  /**
   * Aprobar o rechazar un presupuesto
   * @param {number} id - ID del presupuesto
   * @param {string} accion - 'APROBAR' o 'RECHAZAR'
   * @param {Array} detallesAprobados - IDs de detalles aprobados (solo para aprobar)
   */
  async aprobarPresupuesto(id, accion, detallesAprobados = []) {
    try {
      const data = { accion };
      if (accion === 'APROBAR' && detallesAprobados.length > 0) {
        data.detalles_aprobados = detallesAprobados;
      }
      
      const response = await api.post(`/presupuestos/${id}/aprobar`, data);
      return {
        success: true,
        data: response.data || response,
        message: accion === 'APROBAR' ? 'Presupuesto aprobado' : 'Presupuesto rechazado'
      };
    } catch (error) {
      console.error('Error al procesar presupuesto:', error);
      return {
        success: false,
        message: error.message || 'Error al procesar presupuesto',
        error: error
      };
    }
  }

  /**
   * Obtener estadísticas de presupuestos
   */
  async getEstadisticas() {
    try {
      const response = await api.get('/presupuestos/estadisticas/resumen');
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
   * Cambiar estado de un presupuesto (método rápido)
   * @param {number} id - ID del presupuesto
   * @param {string} estado - PENDIENTE, APROBADO, RECHAZADO
   */
  async cambiarEstado(id, estado) {
    return this.actualizarPresupuesto(id, { estado });
  }

  /**
   * Extender fecha de validez
   * @param {number} id - ID del presupuesto
   * @param {string} nuevaFecha - Nueva fecha de validez
   */
  async extenderValidez(id, nuevaFecha) {
    return this.actualizarPresupuesto(id, { fecha_validez: nuevaFecha });
  }
}

export default new PresupuestoService();