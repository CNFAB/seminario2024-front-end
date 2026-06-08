// frontend/src/services/reporteGlobalService.js
import api from './api';

class ReporteGlobalService {
  /**
   * Obtener estadísticas globales (totales, porcentajes)
   * @returns {Promise} - Datos estadísticos generales
   */
  async obtenerEstadisticasGlobales() {
    try {
      const response = await api.get('/reportes/estadisticas-globales');
      return response;
    } catch (error) {
      console.error('Error al obtener estadísticas globales:', error);
      throw error;
    }
  }
  async obtenerIngresosMensuales() {
    try {
      const response = await api.get('/reportes/ingresos-mensuales');
      return response;
    } catch (error) {
      console.error('Error al obtener ingresos mensuales:', error);
      throw error;
    }
  }
  async obtenerReparacionesMensuales() {
    try {
      const response = await api.get('/reportes/reparaciones-mensuales');
      return response;
    } catch (error) {
      console.error('Error al obtener reparaciones mensuales:', error);
      throw error;
    }
  }
  async compararMesesResumen({ mes1, anio1, mes2, anio2 }) {
    try {
      const response = await api.post('/reportes/comparar-meses-resumen', {
        mes1,
        anio1,
        mes2,
        anio2,
      });
      return response;
    } catch (error) {
      console.error('Error al comparar meses:', error);
      throw error;
    }
  }
  async obtenerTopMarcasMensual(anio, limit = 5) {
    try {
      const response = await api.post('/reportes/top-marcas-mensual', { anio, limit });
      return response;
    } catch (error) {
      console.error('Error al obtener top marcas:', error);
      throw error;
    }
  }

  async compararMeses({ mes1, anio1, mes2, anio2 }) {
    try {
      const response = await api.post('/reportes/comparar-meses', {
        mes1,
        anio1,
        mes2,
        anio2,
      });
      return response;
    } catch (error) {
      console.error('Error al comparar meses:', error);
      throw error;
    }
  }

  /**
   * Comparar dos años
   * @param {Object} params - Parámetros de comparación
   * @param {number} params.anio1 - Primer año
   * @param {number} params.anio2 - Segundo año
   * @returns {Promise} - Datos comparativos de los dos años
   */
  async compararAnios({ anio1, anio2 }) {
    try {
      const response = await api.post('/reportes/comparar-anios', {
        anio1,
        anio2,
      });
      return response;
    } catch (error) {
      console.error('Error al comparar años:', error);
      throw error;
    }
  }

  /**
   * Obtener meses disponibles con datos
   * @returns {Promise} - Lista de meses con datos
   */
  async obtenerMesesDisponibles() {
    try {
      const estadisticas = await this.obtenerEstadisticasGlobales();
      // Si el backend no devuelve meses disponibles, los generamos desde los años
      const anios = estadisticas.data?.anios_disponibles || [];
      const mesesDisponibles = [];

      anios.forEach((anio) => {
        for (let mes = 1; mes <= 12; mes++) {
          mesesDisponibles.push({ mes, anio });
        }
      });

      return mesesDisponibles;
    } catch (error) {
      console.error('Error al obtener meses disponibles:', error);
      return [];
    }
  }
}

export default new ReporteGlobalService();
