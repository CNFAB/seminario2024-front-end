// services/reclamoGarantiaService.js
import api from './api';

const reclamoGarantiaService = {
    /**
     * Obtener todos los reclamos (admin/tecnico ven todos, cliente solo los suyos)
     */
       obtenerTodos: async () => {
        const response = await api.get('/admin/reclamos-garantia');
        return response;
    },
     obtenerMisReclamosAsignados: async () => {
        const response = await api.get('/admin/reclamos-garantia/mis-reclamos');
        return response;
    },

    
    /**
     * Obtener reclamo por ID
     */
 obtenerPorId: async (id) => {
        return await api.get(`/admin/reclamos-garantia/${id}`);  // ← prefijo admin
    },
    
    /**
     * Actualizar reclamo (admin/tecnico)
     */
    actualizar: async (id, data) => {
        return await api.put(`/admin/reclamos-garantia/${id}`, data);  // ← prefijo admin
    },
    
    /**
     * Eliminar reclamo (solo admin)
     */

    eliminar: async (id) => {
        return await api.delete(`/admin/reclamos-garantia/${id}`);  // ← prefijo admin
    },
    
    /**
     * Obtener reclamos por garantía
     */

    obtenerPorGarantia: async (idGarantia) => {
        return await api.get(`/admin/reclamos-garantia/garantia/${idGarantia}`);  // ← prefijo admin
    },

    
    /**
     * Cliente actualiza su reclamo (solo descripción)
     */
    actualizarPorCliente: async (id, data) => {
        const response = await api.put(`/reclamos-garantia/cliente/${id}`, data);
        return response;
    },
    
    /**
     * Cliente obtiene sus propios reclamos
     */
    obtenerMisReclamos: async () => {
        const response = await api.get('/reclamos-garantia/mis-reclamos');
        return response;
    },
      /**
     * Buscar reclamos aprobados de un cliente por email (para recepción)
     * @param {string} email - Email del cliente
     */
    buscarReclamosAprobadosPorEmail: async (email) => {
        try {
            const response = await api.get(`/reclamos-garantia/cliente/${encodeURIComponent(email)}/aprobados`);
            return response;
        } catch (error) {
            console.error('Error al buscar reclamos por email:', error);
            throw error;
        }
    },

    /**
     * Registrar ingreso físico del dispositivo (cliente trajo el equipo al taller)
     * @param {number} idReclamo - ID del reclamo
     */
    registrarIngresoReclamo: async (idReclamo) => {
        try {
            const response = await api.post(`/reclamos-garantia/${idReclamo}/registrar-ingreso`);
            return response;
        } catch (error) {
            console.error('Error al registrar ingreso del reclamo:', error);
            throw error;
        }
    }

};

export default reclamoGarantiaService;