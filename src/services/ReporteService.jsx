// services/reporteService.js
import api from './api';

export const reporteService = {
  // ============================================
  // REPORTE DE INGRESOS
  // ============================================
  obtenerReporteIngresos: async (fechas) => {
    try {
      const response = await api.post('/reportes/ingresos', fechas);
      return response.data;
    } catch (error) {
      console.error('❌ Error en reporte de ingresos:', error);
      throw error;
    }
  },

  // ============================================
  // REPORTE POR TÉCNICO
  // ============================================
  obtenerReporteTecnico: async (datos) => {
    try {
      const response = await api.post('/reportes/tecnico', datos);
      return response.data;
    } catch (error) {
      console.error('❌ Error en reporte por técnico:', error);
      throw error;
    }
  },

  // ============================================
  // REPORTE DE PIEZAS (ACTUALIZADO)
  // ============================================
  obtenerReportePiezas: async (datos) => {
    try {
      console.log('📡 Solicitando reporte de piezas:', datos);
      const response = await api.post('/reportes/piezas', datos);
      console.log('✅ Respuesta de piezas:', response.data);
      
      // 👇 IMPORTANTE: Devolver los datos en el formato que espera el componente
      // El componente espera: response.data con { totales, top_piezas, por_categoria, evolucion_diaria }
      return response.data;
      
    } catch (error) {
      console.error('❌ Error en reporte de piezas:', error);
      throw error;
    }
  },

  // ============================================
  // UTILIDADES
  // ============================================
  formatearFecha: (fecha) => {
    if (!fecha) return '';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  },

  formatearMoneda: (valor) => {
    if (valor === undefined || valor === null) return '$0';
    return `$${Number(valor).toLocaleString('es-ES', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  },

  formatearNumero: (valor) => {
    if (valor === undefined || valor === null) return '0';
    return Number(valor).toLocaleString('es-ES');
  },

  // ============================================
  // NUEVO: MÉTODO PARA CATEGORÍAS
  // ============================================
  obtenerCategorias: async () => {
    try {
      const response = await api.get('/categoria');
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener categorías:', error);
      throw error;
    }
  }
};