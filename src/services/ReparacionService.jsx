// services/ReparacionService.js
import api from './api';

class ReparacionService {
  async obtenerTodas(params = {}) {
    try {
      const response = await api.get('/reparaciones', {
        params: { paginate: 'false', ...params },
      });
      return response;
    } catch (error) {
      console.error('Error al obtener reparaciones:', error);
      throw error;
    }
  }
  async obtenerPorId(id) {
    try {
      const response = await api.get(`/reparaciones/${id}`);
      return response;
    } catch (error) {
      console.error(`Error al obtener reparación ${id}:`, error);
      throw error;
    }
  }

  async obtenerPorTecnico(idTecnico) {
    try {
      const response = await api.get(`/reparaciones/tecnico/${idTecnico}`);
      return response;
    } catch (error) {
      console.error('Error al obtener reparaciones del técnico:', error);
      throw error;
    }
  }

  async obtenerPorIngresoConDiagnostico(idIngreso) {
    try {
      const response = await api.get(`/reparaciones/ingreso-con-diagnostico/${idIngreso}`);
      console.log('📡 Reparaciones (directas + diagnóstico):', response.data);
      return response;
    } catch (error) {
      console.error('Error al obtener reparaciones por ingreso con diagnóstico:', error);
      throw error;
    }
  }

  async crear(datos) {
    try {
      const response = await api.post('/reparaciones', datos);
      return response;
    } catch (error) {
      console.error('Error al crear reparación:', error);
      throw error;
    }
  }
  async obtenerResumenPorIngreso(idIngreso) {
    try {
      const response = await api.get(`/reparacion-multiple/resumen-ingreso/${idIngreso}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener resumen del ingreso ${idIngreso}:`, error);
      throw error;
    }
  }

  async actualizar(id, datos) {
    try {
      const { id_reparacion, ...datosLimpios } = datos;
      const response = await api.put(`/reparaciones/${id}`, datosLimpios);
      return response;
    } catch (error) {
      console.error(`Error al actualizar reparación ${id}:`, error);
      throw error;
    }
  }

  async actualizarParcial(id, datos) {
    try {
      const response = await api.patch(`/reparaciones/${id}`, datos);
      return response;
    } catch (error) {
      console.error(`Error en actualización parcial ${id}:`, error);
      throw error;
    }
  }

  async eliminar(id) {
    try {
      const response = await api.delete(`/reparaciones/${id}`);
      return response;
    } catch (error) {
      console.error(`Error al eliminar reparación ${id}:`, error);
      throw error;
    }
  }

  async obtenerPorDiagnostico(idDiagnostico) {
    try {
      const response = await api.get('/reparaciones', {
        params: { id_diagnostico: idDiagnostico },
      });
      return response;
    } catch (error) {
      console.error('Error al obtener reparaciones por diagnóstico:', error);
      throw error;
    }
  }
  async actualizarEstado(id, estado) {
    try {
      const response = await api.patch(`/reparaciones/${id}`, { estado });
      return response;
    } catch (error) {
      console.error(`Error al actualizar estado de reparación ${id}:`, error);
      throw error;
    }
  }

  async obtenerPorIngreso(idIngreso) {
    try {
      const response = await api.get('/reparaciones', {
        params: { id_ingreso: idIngreso, paginate: 'false' },
      });
      console.log('ful', response);
      return response;
    } catch (error) {
      console.error('Error al obtener reparaciones por ingreso:', error);
      throw error;
    }
  }

  async obtenerEstadoGeneral(id) {
    try {
      const reparacion = await this.obtenerPorId(id);
      return reparacion?.estado_general || 'SIN_REPARACIONES';
    } catch (error) {
      console.error('Error al obtener estado general:', error);
      throw error;
    }
  }
}

export default new ReparacionService();
