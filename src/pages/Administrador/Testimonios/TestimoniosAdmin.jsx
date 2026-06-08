// src/pages/Administrador/TestimoniosAdmin/TestimoniosAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Star, CheckCircle, XCircle, MessageSquare, Undo2, Trash2, RefreshCw } from 'lucide-react';
import testimonioService from '../../../services/testimonioService';
import styles from './TestimoniosAdmin.module.css';

const TestimoniosAdmin = () => {
  const [testimonios, setTestimonios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('PENDIENTE');
  const [procesando, setProcesando] = useState(null);

  useEffect(() => {
    cargarTestimonios();
  }, []);

  const cargarTestimonios = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await testimonioService.obtenerTodosTestimonios();
      const data = response?.data?.data || response?.data || [];
      setTestimonios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando testimonios:', err);
      setError('No se pudieron cargar los testimonios');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (id, nuevoEstado) => {
    setProcesando(id);
    try {
      await testimonioService.cambiarEstadoTestimonio(id, nuevoEstado);
      setTestimonios((prev) => prev.map((t) => (t.id === id ? { ...t, estado: nuevoEstado } : t)));
    } catch (err) {
      console.error('Error cambiando estado:', err);
      alert('Error al actualizar el testimonio');
    } finally {
      setProcesando(null);
    }
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este testimonio?')) return;
    setProcesando(id);
    try {
      await testimonioService.eliminarTestimonio(id);
      setTestimonios((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error('Error eliminando:', err);
      alert('Error al eliminar el testimonio');
    } finally {
      setProcesando(null);
    }
  };

  const testimoniosFiltrados =
    filtro === 'TODOS' ? testimonios : testimonios.filter((t) => t.estado === filtro);

  const pendientes = testimonios.filter((t) => t.estado === 'PENDIENTE').length;
  const aprobados = testimonios.filter((t) => t.estado === 'APROBADO').length;
  const rechazados = testimonios.filter((t) => t.estado === 'RECHAZADO').length;

  const renderEstrellas = (calificacion) => {
    if (!calificacion || calificacion === 0) {
      return <small style={{ color: '#94a3b8' }}>Sin calificación</small>;
    }
    return (
      <div className={styles.testimonioEstrellas}>
        {[1, 2, 3, 4, 5].map((estrella) => (
          <Star
            key={estrella}
            size={16}
            fill={estrella <= calificacion ? '#f59e0b' : 'none'}
            color={estrella <= calificacion ? '#f59e0b' : '#d1d5db'}
          />
        ))}
      </div>
    );
  };

  const getBadgeClass = (estado) => {
    const map = {
      PENDIENTE: styles.testimonioBadgePendiente,
      APROBADO: styles.testimonioBadgeAprobado,
      RECHAZADO: styles.testimonioBadgeRechazado,
    };
    return map[estado] || '';
  };

  const getBadgeText = (estado) => {
    const map = {
      PENDIENTE: ' Pendiente',
      APROBADO: ' Aprobado',
      RECHAZADO: ' Rechazado',
    };
    return map[estado] || estado;
  };

  if (loading) {
    return (
      <div className={styles.testimoniosLoading}>
        <div className={styles.testimoniosSpinner} />
        <p>Cargando testimonios...</p>
      </div>
    );
  }

  return (
    <div className={styles.testimoniosContainer}>
      {/* Header */}
      <div className={styles.testimoniosHeader}>
        <div>
          <h4>
            <i className="fas fa-star"></i>
            Moderar Testimonios
          </h4>
          <p>Revisá y aprobá los testimonios de los clientes para la página principal</p>
        </div>
        <button className={styles.testimoniosBtnRefresh} onClick={cargarTestimonios}>
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {error && (
        <div className={styles.testimoniosAlert}>
          <i className="fas fa-exclamation-circle"></i>
          {error}
        </div>
      )}

      {/* Filtros */}
      <div className={styles.testimoniosFiltros}>
        {[
          { key: 'PENDIENTE', label: ' Pendientes', count: pendientes },
          { key: 'APROBADO', label: ' Aprobados', count: aprobados },
          { key: 'RECHAZADO', label: ' Rechazados', count: rechazados },
          { key: 'TODOS', label: '📋 Todos', count: testimonios.length },
        ].map((f) => (
          <button
            key={f.key}
            className={`${styles.testimoniosFiltroBtn} ${filtro === f.key ? styles.active : ''}`}
            onClick={() => setFiltro(f.key)}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Lista de testimonios */}
      {testimoniosFiltrados.length === 0 ? (
        <div className={styles.testimoniosVacio}>
          <MessageSquare size={48} color="#94a3b8" />
          <h5>No hay testimonios {filtro !== 'TODOS' ? filtro.toLowerCase() + 's' : ''}</h5>
          <p>
            {filtro === 'PENDIENTE'
              ? 'Todos los testimonios fueron revisados. ¡Buen trabajo!'
              : 'No se encontraron testimonios con este estado.'}
          </p>
        </div>
      ) : (
        <div className={styles.testimoniosGrid}>
          {testimoniosFiltrados.map((testimonio) => (
            <div key={testimonio.id} className={styles.testimonioCard}>
              {/* Header */}
              <div className={styles.testimonioCardHeader}>
                <div className={styles.testimonioClienteInfo}>
                  <div className={styles.testimonioClienteNombre}>
                    {testimonio.cliente_nombre || 'Cliente'}
                  </div>
                  <div className={styles.testimonioDispositivo}>
                    {testimonio.dispositivo || 'Dispositivo'} · #{testimonio.id_reparacion}
                  </div>
                  <div className={styles.testimonioFecha}>{testimonio.created_at}</div>
                </div>
                <div className="text-end">
                  <span className={`${styles.testimonioBadge} ${getBadgeClass(testimonio.estado)}`}>
                    {getBadgeText(testimonio.estado)}
                  </span>
                  {renderEstrellas(testimonio.calificacion)}
                </div>
              </div>

              {/* Comentario */}
              <div className={styles.testimonioComentarioBox}>
                {testimonio.comentario ? (
                  <p>"{testimonio.comentario}"</p>
                ) : (
                  <p className={styles.testimonioSinComentario}>
                    Sin comentario - Solo calificación con estrellas
                  </p>
                )}
              </div>

              {/* Acciones */}
              <div className={styles.testimonioAcciones}>
                {testimonio.estado === 'PENDIENTE' && (
                  <>
                    <button
                      className={`${styles.testimonioBtn} ${styles.testimonioBtnRechazar}`}
                      onClick={() => handleCambiarEstado(testimonio.id, 'RECHAZADO')}
                      disabled={procesando === testimonio.id}
                    >
                      <XCircle size={14} /> Rechazar
                    </button>
                    <button
                      className={`${styles.testimonioBtn} ${styles.testimonioBtnAprobar}`}
                      onClick={() => handleCambiarEstado(testimonio.id, 'APROBADO')}
                      disabled={procesando === testimonio.id}
                    >
                      <CheckCircle size={14} /> Aprobar
                    </button>
                  </>
                )}

                {testimonio.estado !== 'PENDIENTE' && (
                  <button
                    className={`${styles.testimonioBtn} ${styles.testimonioBtnVolver}`}
                    onClick={() => handleCambiarEstado(testimonio.id, 'PENDIENTE')}
                    disabled={procesando === testimonio.id}
                  >
                    <Undo2 size={14} /> Volver a pendiente
                  </button>
                )}

                <button
                  className={`${styles.testimonioBtn} ${styles.testimonioBtnEliminar}`}
                  onClick={() => handleEliminar(testimonio.id)}
                  disabled={procesando === testimonio.id}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimoniosAdmin;
