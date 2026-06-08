// services/estadisticaService.jsx
import api from './api';

export const estadisticaService = {

  // ============================================
  // ESTADÍSTICAS DE INVENTARIO
  // ============================================


  obtenerInventarioBasico: async () => {
    try {
      console.log('📡 Llamando a API: /estadisticas/inventario-basico');
      const response = await api.get('/estadisticas/inventario-basico');
      console.log('✅ Respuesta:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas de inventario:', error);
      throw error;
    }
  },

  /**
   * Obtener estadísticas completas de inventario (LA QUE NECESITAS)
   * GET /api/reportes/inventario
   */
  obtenerInventarioCompleto: async () => {
    try {
      console.log('📡 Llamando a API: /reportes/inventario');
      const response = await api.get('/reportes/inventario');
      console.log('✅ Respuesta:', response.data);
      
      // Mapear los nombres de campos si es necesario
      if (response.data.success) {
        return {
          success: true,
          data: {
            totalPiezas: response.data.data.total_piezas,
            stockBajo: response.data.data.stock_bajo,
            valorTotal: response.data.data.valor_total,
            categorias: response.data.data.categorias
          }
        };
      }
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener inventario completo:', error);
      throw error;
    }
  },

  // ============================================
  // ESTADÍSTICAS DE DASHBOARD
  // ============================================

  /**
   * Obtener datos del dashboard
   * GET /api/reportes/dashboard
   */
  obtenerDashboard: async () => {
    try {
      const response = await api.get('/estadisticas/dashboard');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener dashboard:', error);
      throw error;
    }
  },
  obtenerTopRecepcionistas: async (limite = 5) => {
  try {
    const response = await api.get('/estadisticas/top-recepcionistas', {
      params: { limite }
    });
    console.log('📡 Top recepcionistas:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error al obtener top recepcionistas:', error);
    return { success: false, data: [] };
  }
},
  obtenerTopMarcas: async (limite = 5) => {
    try {
      const response = await api.get('/estadisticas/top-marcas', {
        params: { limite }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener top marcas:', error);
      return { success: false, data: [] };
    }
  },

  /**
   * Obtener comparativa mensual
   * GET /api/reportes/comparativa-mensual
   */
  obtenerComparativaMensual: async (mes = null, año = null) => {
    try {
      const params = {};
      if (mes) params.mes = mes;
      if (año) params.año = año;
      
      const response = await api.get('/reportes/comparativa-mensual', { params });
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener comparativa mensual:', error);
      throw error;
    }
  },

  // ============================================
  // ESTADÍSTICAS DE TÉCNICOS
  // ============================================

  /**
   * Obtener top técnicos del mes
   * GET /api/estadisticas/tecnicos
   */
  obtenerTopTecnicos: async (limite = 5) => {
    try {
      const response = await api.get('/estadisticas/tecnicos', {
        params: { limite }
      });
      return response.data;
    } catch (error) {
      console.error(' Error al obtener top técnicos:', error);
      throw error;
    }
  },

  /**
   * Obtener carga de trabajo de técnicos
   * GET /api/usuarios/carga-trabajo-tecnicos
   */
  obtenerCargaTrabajoTecnicos: async () => {
    try {
      const response = await api.get('/usuarios/carga-trabajo-tecnicos');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener carga de trabajo:', error);
      throw error;
    }
  },
   obtenerIngresosMensuales: async (año = null) => {
    try {
      const params = {};
      if (año) params.año = año;
      
      const response = await api.get('/estadisticas/ingresos-mensuales', { params });
      console.log('📡 Ingresos mensuales:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener ingresos mensuales:', error);
      // Retornar estructura vacía para no romper el dashboard
      return {
        success: true,
        data: {
          ingresos_por_mes: []
        }
      };
    }
  },

  // ============================================
  // ESTADÍSTICAS DE PIEZAS
  // ============================================

  /**
   * Obtener piezas más usadas
   * GET /api/estadisticas/piezas
   */
  obtenerPiezasMasUsadas: async (limite = 5) => {
    try {
      const response = await api.get('/estadisticas/piezas-mas-usadas', {
        params: { limite }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener piezas más usadas:', error);
      throw error;
    }
  },

  /**
   * Obtener valor del inventario por categoría
   * GET /api/estadisticas/valor-por-categoria
   */
  obtenerValorPorCategoria: async () => {
    try {
      const response = await api.get('/estadisticas/valor-por-categoria');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener valor por categoría:', error);
      throw error;
    }
  },

  // ============================================
  // ESTADÍSTICAS PERSONALIZADAS
  // ============================================

  /**
   * Obtener estadísticas por rango de fechas
   * GET /api/estadisticas/por-fechas
   */
  obtenerPorFechas: async (fechaInicio, fechaFin) => {
    try {
      const response = await api.get('/estadisticas/por-fechas', {
        params: { fecha_inicio: fechaInicio, fecha_fin: fechaFin }
      });
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener estadísticas por fechas:', error);
      throw error;
    }
  },

  /**
   * Obtener resumen rápido (todo en uno)
   */
  obtenerResumenRapido: async () => {
    try {
      const [inventario, dashboard] = await Promise.all([
        api.get('/estadisticas/inventario-basico'),
        api.get('/reportes/dashboard')
      ]);

      return {
        inventario: inventario.data,
        dashboard: dashboard.data
      };
    } catch (error) {
      console.error('❌ Error al obtener resumen rápido:', error);
      throw error;
    }
  },

  // ============================================
  // UTILIDADES PARA FORMATEAR DATOS
  // ============================================

  formatearParaGrafica: (datos, campoLabel = 'nombre', campoValor = 'valor') => {
    if (!datos || !Array.isArray(datos)) return { labels: [], valores: [] };

    return {
      labels: datos.map(item => item[campoLabel] || 'Sin nombre'),
      valores: datos.map(item => item[campoValor] || 0)
    };
  },

  calcularPorcentajeCambio: (valorAnterior, valorActual) => {
    if (valorAnterior === 0) {
      return valorActual > 0 ? 100 : 0;
    }
    return Number((((valorActual - valorAnterior) / valorAnterior) * 100).toFixed(1));
  },

  getColorTendencia: (porcentaje) => {
    if (porcentaje > 0) return 'success';
    if (porcentaje < 0) return 'danger';
    return 'secondary';
  },

  getIconoTendencia: (porcentaje) => {
    if (porcentaje > 5) return '↑↑';
    if (porcentaje > 0) return '↑';
    if (porcentaje < -5) return '↓↓';
    if (porcentaje < 0) return '↓';
    return '→';
  }
}; // ← Cierre correcto del objeto