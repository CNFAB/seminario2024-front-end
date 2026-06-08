import api from './api';

const garantiaPiezaService = {
    /**
     * Obtener todas las garantías por pieza
     */
    obtenerTodas: async () => {
        try {
            const response = await api.get('/garantias-piezas');
            return response;
        } catch (error) {
            console.error('Error al obtener garantías por pieza:', error);
            throw error;
        }
    },

    /**
     * Obtener garantía por pieza por ID
     */
    obtenerPorId: async (id) => {
        try {
            const response = await api.get(`/garantias-piezas/${id}`);
            return response;
        } catch (error) {
            console.error('Error al obtener garantía por pieza:', error);
            throw error;
        }
    },

    /**
     * Obtener garantías por pieza por garantía
     */
    obtenerPorGarantia: async (idGarantia) => {
        try {
            const response = await api.get(`/garantias-piezas/garantia/${idGarantia}`);
            return response;
        } catch (error) {
            console.error('Error al obtener garantías por garantía:', error);
            throw error;
        }
    },

    /**
     * Obtener garantías por pieza por categoría
     */
    obtenerPorCategoria: async (idCategoria) => {
        try {
            const response = await api.get(`/garantias-piezas/categoria/${idCategoria}`);
            return response;
        } catch (error) {
            console.error('Error al obtener garantías por categoría:', error);
            throw error;
        }
    },

    /**
     * Obtener garantías por pieza por pieza
     */
    obtenerPorPieza: async (idPieza) => {
        try {
            const response = await api.get(`/garantias-piezas/pieza/${idPieza}`);
            return response;
        } catch (error) {
            console.error('Error al obtener garantías por pieza:', error);
            throw error;
        }
    },

    /**
     * Obtener garantías por pieza activas
     */
    obtenerActivas: async () => {
        try {
            const response = await api.get('/garantias-piezas/activas');
            return response;
        } catch (error) {
            console.error('Error al obtener garantías activas:', error);
            throw error;
        }
    },

    /**
     * Obtener garantías por pieza vencidas
     */
    obtenerVencidas: async () => {
        try {
            const response = await api.get('/garantias-piezas/vencidas');
            return response;
        } catch (error) {
            console.error('Error al obtener garantías vencidas:', error);
            throw error;
        }
    },

    /**
     * Obtener garantías por vencer
     */
    obtenerPorVencer: async (dias = 30) => {
        try {
            const response = await api.get(`/garantias-piezas/por-vencer?dias=${dias}`);
            return response;
        } catch (error) {
            console.error('Error al obtener garantías por vencer:', error);
            throw error;
        }
    },

    /**
     * Verificar si una pieza está en garantía
     */
    verificarPieza: async (idPieza, idReparacionMultiple = null) => {
        try {
            let url = `/garantias-piezas/pieza/${idPieza}/verificar`;
            if (idReparacionMultiple) {
                url += `?id_reparacion_multiple=${idReparacionMultiple}`;
            }
            const response = await api.get(url);
            return response;
        } catch (error) {
            console.error('Error al verificar pieza:', error);
            throw error;
        }
    },

    /**
     * Crear una nueva garantía por pieza
     */
    crear: async (data) => {
        try {
            const response = await api.post('/garantias-piezas', data);
            return response;
        } catch (error) {
            console.error('Error al crear garantía por pieza:', error);
            throw error;
        }
    },

    /**
     * Actualizar una garantía por pieza
     */
    actualizar: async (id, data) => {
        try {
            const response = await api.put(`/garantias-piezas/${id}`, data);
            return response;
        } catch (error) {
            console.error('Error al actualizar garantía por pieza:', error);
            throw error;
        }
    },

    /**
     * Eliminar una garantía por pieza
     */
    eliminar: async (id) => {
        try {
            const response = await api.delete(`/garantias-piezas/${id}`);
            return response;
        } catch (error) {
            console.error('Error al eliminar garantía por pieza:', error);
            throw error;
        }
    },

    /**
     * Obtener resumen de garantías por pieza
     */
    obtenerResumen: async () => {
        try {
            const response = await api.get('/garantias-piezas/resumen');
            return response;
        } catch (error) {
            console.error('Error al obtener resumen:', error);
            throw error;
        }
    }
};

export default garantiaPiezaService;