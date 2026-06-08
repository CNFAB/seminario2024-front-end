import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, Spinner, Alert, ProgressBar, Form } from 'react-bootstrap';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import garantiaService from '../../../services/garantiaService';
import garantiaPiezaService from '../../../services/garantiaPiezaService';

const GarantiaDetalleModal = ({ show, onHide, idReparacion }) => {
  const [loading, setLoading] = useState(false);
  const [garantia, setGarantia] = useState(null);
  const [piezas, setPiezas] = useState([]);
  const [error, setError] = useState(null);

  // Estado para el reclamo
  const [showReclamoModal, setShowReclamoModal] = useState(false);
  const [descripcionReclamo, setDescripcionReclamo] = useState('');
  const [enviandoReclamo, setEnviandoReclamo] = useState(false);
  const [errorReclamo, setErrorReclamo] = useState(null);

  useEffect(() => {
    if (show && idReparacion) {
      cargarGarantia();
    }
  }, [show, idReparacion]);

  const cargarGarantia = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await garantiaService.verificarPorReparacion(idReparacion);

      console.log('🔍 Respuesta completa:', response);

      // ✅ Acceder correctamente a los datos
      const data = response?.data?.data || response?.data || response;

      console.log('📦 Data procesada:', data);
      console.log('📦 tiene_garantia_activa:', data?.tiene_garantia_activa);
      console.log('📦 piezas_cubiertas:', data?.piezas_cubiertas);

      if (data?.tiene_garantia_activa && data?.garantia) {
        setGarantia(data.garantia);

        // ✅ PRIORIZAR piezas_cubiertas que ya vienen del backend
        if (data.piezas_cubiertas && data.piezas_cubiertas.length > 0) {
          console.log(' Usando piezas_cubiertas del backend:', data.piezas_cubiertas);
          setPiezas(data.piezas_cubiertas);
        } else if (data.garantia.id_garantia) {
          // Solo si no hay piezas_cubiertas, hacer la segunda petición
          console.log(' No hay piezas_cubiertas, cargando aparte...');
          const piezasResponse = await garantiaPiezaService.obtenerPorGarantia(
            data.garantia.id_garantia
          );
          const piezasData = piezasResponse?.data?.data || piezasResponse?.data || [];
          setPiezas(piezasData);
        }
      } else {
        setGarantia(null);
        setPiezas([]);
      }
    } catch (err) {
      console.error('Error al cargar garantía:', err);
      setError('No se pudo cargar la información de la garantía');
    } finally {
      setLoading(false);
    }
  };

  const handleReclamarGarantia = () => {
    setDescripcionReclamo('');
    setErrorReclamo(null);
    setShowReclamoModal(true);
  };

  const enviarReclamo = async () => {
    if (!descripcionReclamo.trim()) {
      setErrorReclamo('Por favor, describí el problema');
      return;
    }

    setEnviandoReclamo(true);
    setErrorReclamo(null);

    try {
      const response = await garantiaService.reclamar(garantia.id_garantia, {
        id_garantia: garantia.id_garantia,
        descripcion_problema: descripcionReclamo,
      });

      console.log('📦 Respuesta del servidor:', response);

      // ✅ Verificar si la respuesta es exitosa (código 201 o 200)
      if (response.status === 201 || response.status === 200 || response.success === true) {
        alert('✅ Reclamo registrado correctamente. Un técnico se contactará contigo.');
        setShowReclamoModal(false);
        onHide(); // Cerrar modal de garantía
        // Recargar la página para actualizar el estado
        setTimeout(() => window.location.reload(), 500);
      } else {
        setErrorReclamo(response.data?.message || 'Error al procesar el reclamo');
      }
    } catch (error) {
      console.error('Error al reclamar garantía:', error);
      const errorMessage =
        error.response?.data?.message || error.message || 'Error al procesar el reclamo';
      setErrorReclamo(errorMessage);
    } finally {
      setEnviandoReclamo(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Sin fecha';
    return new Date(date).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'ACTIVA':
        return 'success';
      case 'VENCIDA':
        return 'danger';
      case 'RECLAMADA':
        return 'warning';
      case 'ANULADA':
        return 'secondary';
      default:
        return 'light';
    }
  };

  const getEstadoTexto = (estado) => {
    switch (estado) {
      case 'ACTIVA':
        return ' Garantía Activa';
      case 'VENCIDA':
        return ' Garantía Vencida';
      case 'RECLAMADA':
        return ' Garantía en Reclamo';
      case 'ANULADA':
        return ' Garantía Anulada';
      default:
        return estado;
    }
  };

  const calcularPorcentaje = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const hoy = new Date();

    if (hoy > fin) return 100;
    if (hoy < inicio) return 0;

    const total = fin - inicio;
    const transcurrido = hoy - inicio;
    return Math.round((transcurrido / total) * 100);
  };

  return (
    <>
      {/* Modal de detalle de garantía */}
      <Modal show={show} onHide={onHide} size="lg" centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <ShieldCheck size={24} className="text-primary" />
            Detalle de Garantía
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Cargando información de garantía...</p>
            </div>
          ) : error ? (
            <Alert variant="danger" className="mb-0">
              <Alert.Heading className="fs-6">Error</Alert.Heading>
              <p className="mb-0">{error}</p>
            </Alert>
          ) : !garantia ? (
            <Alert variant="info" className="mb-0">
              <Alert.Heading className="fs-6">Sin Garantía Activa</Alert.Heading>
              <p className="mb-0">
                Esta reparación no tiene una garantía activa actualmente. Las garantías se generan
                automáticamente al finalizar la reparación.
              </p>
            </Alert>
          ) : (
            <div>
              {/* Información general */}
              <div className="mb-4 p-3 rounded-3" style={{ background: '#f0f5ff' }}>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                  <Badge bg={getEstadoColor(garantia.estado)} style={{ fontSize: '0.9rem' }}>
                    {getEstadoTexto(garantia.estado)}
                  </Badge>
                  <Badge bg="secondary">{garantia.tipo_garantia || 'ESTANDAR'}</Badge>
                </div>

                <div className="row mt-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Calendar size={16} className="text-muted" />
                      <div>
                        <small className="text-muted d-block">Fecha de inicio</small>
                        <strong>{formatDate(garantia.fecha_inicio)}</strong>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Clock size={16} className="text-muted" />
                      <div>
                        <small className="text-muted d-block">Fecha de vencimiento</small>
                        <strong
                          className={
                            garantia.fecha_fin < new Date() ? 'text-danger' : 'text-success'
                          }
                        >
                          {formatDate(garantia.fecha_fin)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barra de progreso */}
                <div className="mt-3">
                  <div className="d-flex justify-content-between small mb-1">
                    <span className="text-muted">Progreso de garantía</span>
                    <span
                      className={
                        garantia.porcentaje_restante < 30 ? 'text-warning' : 'text-success'
                      }
                    >
                      {garantia.porcentaje_restante || 0}% restante
                    </span>
                  </div>
                  <ProgressBar
                    now={calcularPorcentaje(garantia.fecha_inicio, garantia.fecha_fin)}
                    variant={garantia.porcentaje_restante < 30 ? 'warning' : 'success'}
                    style={{ height: '10px', borderRadius: '5px' }}
                  />
                </div>

                {garantia.comentario && (
                  <div className="mt-3 p-2 bg-white rounded-2">
                    <small className="text-muted">Comentario:</small>
                    <p className="mb-0 small">{garantia.comentario}</p>
                  </div>
                )}
              </div>

              {/* Piezas cubiertas */}
              <div>
                <h6 className="mb-3">🛡️ Piezas cubiertas por garantía</h6>

                {piezas.length === 0 ? (
                  <Alert variant="info" className="py-2 small">
                    No hay piezas registradas para esta garantía.
                  </Alert>
                ) : (
                  <div className="d-flex flex-column gap-2">
                    {piezas.map((pieza) => {
                      const isActiva =
                        pieza.estado === 'ACTIVA' && new Date(pieza.fecha_fin) >= new Date();
                      const porcentajeConsumido = calcularPorcentaje(
                        pieza.fecha_inicio,
                        pieza.fecha_fin
                      );

                      return (
                        <div key={pieza.id_garantia_pieza} className="border rounded-3 p-3">
                          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-2">
                            <div>
                              <strong>{pieza.pieza?.nombre_pieza || 'Pieza'}</strong>
                              <Badge bg="secondary" className="ms-2">
                                {pieza.categoria?.categoria || 'Sin categoría'}
                              </Badge>
                            </div>
                            <Badge bg={isActiva ? 'success' : 'secondary'}>
                              {isActiva ? 'Activa' : 'Vencida'}
                            </Badge>
                          </div>

                          <div className="row small mb-2">
                            <div className="col-6">
                              <span className="text-muted">Garantía asignada:</span>
                              <strong className="ms-2">{pieza.garantia_dias_asignados} días</strong>
                            </div>
                            <div className="col-6">
                              <span className="text-muted">Vence:</span>
                              <strong
                                className={`ms-2 ${isActiva ? 'text-success' : 'text-danger'}`}
                              >
                                {formatDate(pieza.fecha_fin)}
                              </strong>
                            </div>
                          </div>

                          <div className="progress" style={{ height: '4px' }}>
                            <div
                              className={`progress-bar ${isActiva ? 'bg-success' : 'bg-secondary'}`}
                              style={{ width: `${porcentajeConsumido}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Información adicional */}
              <div className="mt-4 p-3 rounded-3" style={{ background: '#f8f9fa' }}>
                <h6 className="mb-2">📋 Información importante</h6>
                <ul className="small text-muted mb-0">
                  <li>La garantía cubre únicamente la misma falla reparada.</li>
                  <li>No cubre daños por mal uso, golpes o líquidos.</li>
                  <li>Para hacer efectiva la garantía, presentá este comprobante.</li>
                  <li>Si tenés algún problema, contactanos dentro del período de garantía.</li>
                </ul>
              </div>
            </div>
          )}
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button variant="secondary" onClick={onHide}>
            Cerrar
          </Button>
          {garantia && garantia.estado === 'ACTIVA' && (
            <Button variant="warning" onClick={handleReclamarGarantia}>
              <ShieldAlert size={16} className="me-1" />
              Reclamar garantía
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal de reclamo - solo descripción */}
      <Modal show={showReclamoModal} onHide={() => setShowReclamoModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            <ShieldAlert size={20} className="text-warning" />
            Reclamar Garantía
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p className="text-muted small mb-3">
            Completá el siguiente formulario para reclamar tu garantía. Un técnico se contactará
            contigo a la brevedad.
          </p>

          <Form.Group className="mb-3">
            <Form.Label className="fw-bold small">
              Descripción del problema <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={descripcionReclamo}
              onChange={(e) => setDescripcionReclamo(e.target.value)}
              placeholder="Describí detalladamente qué problema presenta el dispositivo..."
              isInvalid={!!errorReclamo}
            />
            <Form.Text className="text-muted small">
              Sé lo más específico posible para que podamos ayudarte mejor.
            </Form.Text>
          </Form.Group>

          {errorReclamo && (
            <Alert variant="danger" className="py-2 small">
              <AlertCircle size={14} className="me-1" />
              {errorReclamo}
            </Alert>
          )}

          <div className="p-3 rounded-3 mt-2" style={{ background: '#f0f5ff' }}>
            <small className="text-muted d-block mb-2">
              <strong>⚠️ Importante:</strong>
            </small>
            <ul className="small text-muted mb-0 ps-3">
              <li>El reclamo será evaluado por nuestro equipo técnico.</li>
              <li>La garantía cubre únicamente la misma falla reparada.</li>
              <li>Te contactaremos dentro de las 48 horas hábiles.</li>
            </ul>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0">
          <Button
            variant="secondary"
            onClick={() => setShowReclamoModal(false)}
            disabled={enviandoReclamo}
          >
            Cancelar
          </Button>
          <Button
            variant="warning"
            onClick={enviarReclamo}
            disabled={enviandoReclamo || !descripcionReclamo.trim()}
          >
            {enviandoReclamo ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Enviando...
              </>
            ) : (
              <>
                <ShieldAlert size={16} className="me-1" />
                Enviar reclamo
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default GarantiaDetalleModal;
