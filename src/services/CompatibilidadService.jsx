import api from './api'; 

class CompatibilidadService {
    
    // Obtener todas las compatibilidades
    async getAll() {
        try {
            const response = await api.get('/compatibilidades/todas');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener una compatibilidad por ID
    async getById(id) {
        try {
            const response = await api.get(`/compatibilidades/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Crear nueva compatibilidad
    async create(data) {
        try {
            const response = await api.post('/compatibilidades', {
                id_pieza: data.id_pieza,
                id_modelo: data.id_modelo,
                notas: data.notas || ''
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Actualizar compatibilidad
    async update(id, data) {
        try {
            const response = await api.put(`/compatibilidades/${id}`, {
                notas: data.notas
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Eliminar compatibilidad
    async delete(id) {
        try {
            const response = await api.delete(`/compatibilidades/${id}`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Eliminar múltiples compatibilidades
    async deleteMultiple(ids) {
        try {
            const response = await api.delete('/compatibilidades', {
                data: { ids }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Verificar compatibilidad
    async verificar(id_pieza, id_modelo) {
        try {
            const response = await api.get('/compatibilidades/verificar', {
                params: { id_pieza, id_modelo }
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener compatibilidades por pieza
    async getByPieza(piezaId) {
        try {
            const response = await api.get(`/piezas/${piezaId}/compatibilidades`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener compatibilidades por modelo
    async getByModelo(modeloId) {
        try {
            const response = await api.get(`/modelos/${modeloId}/compatibilidades`);
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Obtener estadísticas
    async getEstadisticas() {
        try {
            const response = await api.get('/compatibilidades/estadisticas');
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Buscar compatibilidades
    async search(params) {
        try {
            const response = await api.get('/compatibilidades/search', { params });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Sincronizar compatibilidades para un modelo
    async syncForModelo(modeloId, piezas) {
        try {
            const response = await api.post(`/modelos/${modeloId}/compatibilidades/sync`, {
                piezas
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Sincronizar compatibilidades para una pieza
    async syncForPieza(piezaId, modelos) {
        try {
            const response = await api.post(`/piezas/${piezaId}/compatibilidades/sync`, {
                modelos
            });
            return response.data;
        } catch (error) {
            throw this.handleError(error);
        }
    }

    // Manejador de errores
    handleError(error) {
        if (error.response) {
            // Error de respuesta del servidor
            return {
                status: error.response.status,
                message: error.response.data.message || 'Error en el servidor',
                errors: error.response.data.errors
            };
        } else if (error.request) {
            // Error de conexión
            return {
                status: 503,
                message: 'No se pudo conectar con el servidor'
            };
        } else {
            // Error de configuración
            return {
                status: 500,
                message: error.message || 'Error desconocido'
            };
        }
    }
}

export default new CompatibilidadService();