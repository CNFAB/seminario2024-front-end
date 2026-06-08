// components/Cliente/ModalCalificacion.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { Star, X, Send } from 'lucide-react';
import testimonioService from '../../../services/testimonioService';
import './ModalCalificacion.css';

const ModalCalificacion = ({ show, onClose, reparacion, onCalificado }) => {
  const [calificacion, setCalificacion] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);

  // ✅ NUEVO: Verificar si es garantía y cerrar automáticamente
  useEffect(() => {
    if (show && reparacion) {
      // Si es reparación de garantía, cerrar el modal sin preguntar
      if (reparacion.es_garantia === true) {
        console.log('🔧 Reparación de garantía - No se requiere calificación');

        // Marcar como "no preguntar" en el backend
        const skipGarantia = async () => {
          try {
            await testimonioService.setSkipTestimonio({
              id_reparacion: reparacion.id_reparacion,
              skip_testimonio: true,
            });
          } catch (err) {
            console.error('Error al guardar skip para garantía:', err);
          } finally {
            // Cerrar modal y notificar que se completó
            onClose();
            if (onCalificado) onCalificado();
          }
        };
        skipGarantia();
      }
    }
  }, [show, reparacion]);

  // ✅ Si es garantía, NO renderizar nada
  if (reparacion?.es_garantia === true) {
    return null;
  }

  // Resetear el formulario cuando se abre el modal
  useEffect(() => {
    if (show) {
      setCalificacion(0);
      setHoverRating(0);
      setComentario('');
      setError('');
      setEnviado(false);
    }
  }, [show]);

  const handleStarClick = (rating) => {
    setCalificacion(rating);
  };

  const handleStarHover = (rating) => {
    setHoverRating(rating);
  };

  const handleStarLeave = () => {
    setHoverRating(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (calificacion === 0) {
      setError('Por favor, selecciona una calificación de 1 a 5 estrellas.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await testimonioService.guardarTestimonio({
        id_reparacion: reparacion.id_reparacion,
        calificacion_estrella: calificacion,
        comentario: comentario.trim() || null,
      });

      setEnviado(true);
      setTimeout(() => {
        setEnviado(false);
        onClose();
        if (onCalificado) onCalificado();
      }, 2000);
    } catch (err) {
      console.error('Error al guardar testimonio:', err);
      setError(err.message || 'Error al enviar tu calificación. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowSkipModal(true);
  };

  const handleRecordarMasTarde = async () => {
    setShowSkipModal(false);
    onClose();
  };

  const handleNoVolverAPreguntar = async () => {
    setLoading(true);
    try {
      await testimonioService.setSkipTestimonio({
        id_reparacion: reparacion.id_reparacion,
        skip_testimonio: true,
      });
      setShowSkipModal(false);
      onClose();
      if (onCalificado) onCalificado();
    } catch (err) {
      console.error('Error:', err);
      setError('Error al guardar tu preferencia.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    const ratingToShow = hoverRating || calificacion;

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={32}
          className={`star-rating ${i <= ratingToShow ? 'star-filled' : 'star-empty'}`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => handleStarHover(i)}
          onMouseLeave={handleStarLeave}
          style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
        />
      );
    }
    return stars;
  };

  return (
    <>
      {/* Modal principal de calificación */}
      <Modal show={show} onHide={handleCancel} centered size="md" backdrop="static">
        <Modal.Header closeButton={false} className="modal-calificacion-header">
          <Modal.Title className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '24px' }}>📱</span>
            ¡Cuéntanos tu experiencia!
          </Modal.Title>
          <button className="modal-calificacion-close" onClick={handleCancel}>
            <X size={20} />
          </button>
        </Modal.Header>

        <Modal.Body className="modal-calificacion-body">
          {enviado ? (
            <div className="text-center py-4">
              <div className="success-icon mb-3">
                <span style={{ fontSize: '48px' }}>🎉</span>
              </div>
              <h5 className="fw-bold mb-2">¡Gracias por tu calificación!</h5>
              <p className="text-muted mb-0">
                Tu opinión nos ayuda a mejorar. Será revisada por nuestro equipo.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <p className="mb-4 text-muted">¿Cómo calificarías la reparación de tu dispositivo?</p>

              <div className="dispositivo-info mb-4 p-3 bg-light rounded-3">
                <small className="text-muted d-block mb-1">Dispositivo reparado:</small>
                <strong className="fs-5">{reparacion?.dispositivo || 'Dispositivo'}</strong>
                <small className="text-muted d-block mt-1">
                  Retirado el {reparacion?.fecha_retiro || 'recientemente'}
                </small>
              </div>

              <div className="mb-4 text-center">
                <label className="form-label fw-bold mb-2 d-block">
                  Tu calificación <span className="text-danger">*</span>
                </label>
                <div className="stars-container d-flex justify-content-center gap-2">
                  {renderStars()}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold">
                  💬 Comentario <span className="text-muted">(opcional)</span>
                </label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Cuéntanos cómo fue tu experiencia con nosotros..."
                  className="modal-calificacion-textarea"
                />
              </div>

              {error && (
                <Alert variant="danger" className="mb-3">
                  ⚠️ {error}
                </Alert>
              )}

              <div className="d-flex justify-content-end gap-3 mt-4">
                <Button variant="light" onClick={handleCancel} disabled={loading}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={loading || calificacion === 0}
                  className="btn-enviar"
                >
                  {loading ? (
                    <>⏳ Enviando...</>
                  ) : (
                    <>
                      <Send size={16} className="me-2" />
                      Enviar calificación
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal secundario - Opciones al cancelar */}
      <Modal show={showSkipModal} onHide={() => setShowSkipModal(false)} centered size="sm">
        <Modal.Header closeButton className="modal-opciones-header">
          <Modal.Title className="fs-6">¿Qué querés hacer?</Modal.Title>
        </Modal.Header>
        <Modal.Body className="modal-opciones-body p-3">
          <Button
            variant="outline-secondary"
            className="w-100 mb-2 d-flex align-items-center justify-content-center gap-2"
            onClick={handleRecordarMasTarde}
            style={{ padding: '12px' }}
          >
            🔄 Recordármelo más tarde
          </Button>
          <small className="text-muted d-block mb-3 text-center">
            Volverá a aparecer en tu próximo inicio de sesión
          </small>

          <Button
            variant="outline-danger"
            className="w-100 d-flex align-items-center justify-content-center gap-2"
            onClick={handleNoVolverAPreguntar}
            disabled={loading}
            style={{ padding: '12px' }}
          >
            {loading ? '⏳...' : '❌ No volver a preguntar'}
          </Button>
          <small className="text-muted d-block mt-2 text-center">
            No te volveremos a molestar con esta reparación
          </small>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ModalCalificacion;
