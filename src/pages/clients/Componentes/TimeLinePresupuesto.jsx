// pages/cliente/Componentes/TimeLinePresupuesto.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Spinner, Alert, Form, Row, Col } from 'react-bootstrap';
import { DollarSign, CheckCircle, XCircle, Wrench, ChevronDown, ChevronUp, Calendar, ShoppingCart } from 'lucide-react';
import PresupuestoService from '../../../services/PresupuestoService.jsx';
import pagoService from '../../../services/pagoService';

const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

const TimeLinePresupuesto = ({ dispositivo, onPresupuestoAceptado }) => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandidos, setExpandidos] = useState({});
  const [selecciones, setSelecciones] = useState({}); // Guarda qué piezas selecciona por presupuesto
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (dispositivo?.id_dispositivo) {
      cargarPresupuestosCalculados();
    }
  }, [dispositivo]);

  const cargarPresupuestosCalculados = async () => {
    setLoading(true);
    setError(null);
    try {
      // Obtener presupuestos del dispositivo con estado CALCULADO
      const response = await PresupuestoService.getPresupuestosByDispositivo(dispositivo.id_dispositivo);
      const lista = response?.data?.data || response?.data || [];
      
      // Filtrar solo los que están CALCULADO (no aprobados aún)
      const calculados = lista.filter(p => p.estado === 'CALCULADO');
      setPresupuestos(calculados);
      
      if (calculados.length > 0) {
        setExpandidos({ [calculados[0].id_presupuesto]: true });
      }
    } catch (err) {
      console.error('Error cargando presupuestos:', err);
      setError('No se pudieron cargar los presupuestos');
    } finally {
      setLoading(false);
    }
  };

  const togglePresupuesto = (id) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Manejar selección de una pieza
  const toggleSeleccionPieza = (presupuestoId, detalleId) => {
    setSelecciones(prev => {
      const presupuestoSelecciones = prev[presupuestoId] || [];
      if (presupuestoSelecciones.includes(detalleId)) {
        return {
          ...prev,
          [presupuestoId]: presupuestoSelecciones.filter(id => id !== detalleId)
        };
      } else {
        return {
          ...prev,
          [presupuestoId]: [...presupuestoSelecciones, detalleId]
        };
      }
    });
  };

  // Seleccionar todas las piezas de un presupuesto
  const seleccionarTodas = (presupuestoId, detalles) => {
    setSelecciones(prev => ({
      ...prev,
      [presupuestoId]: detalles.map(d => d.id_detalle)
    }));
  };

  // Deseleccionar todas
  const deseleccionarTodas = (presupuestoId) => {
    setSelecciones(prev => ({
      ...prev,
      [presupuestoId]: []
    }));
  };

  // Calcular total seleccionado
  const calcularTotalSeleccionado = (presupuesto) => {
    const seleccionadas = selecciones[presupuesto.id_presupuesto] || [];
    return presupuesto.detalles
      .filter(d => seleccionadas.includes(d.id_detalle))
      .reduce((sum, d) => sum + parseFloat(d.costo || 0), 0);
  };

  // Aprobar presupuesto con las piezas seleccionadas
  const handleAprobarPresupuesto = async (presupuesto) => {
    const seleccionadas = selecciones[presupuesto.id_presupuesto] || [];
    
    if (seleccionadas.length === 0) {
      alert('Debes seleccionar al menos una pieza para reparar');
      return;
    }

    setProcesando(true);
    try {
      // Enviar las piezas seleccionadas al backend
      const todasSeleccionadas = seleccionadas.length === presupuesto.detalles?.length;
    const response = await PresupuestoService.aprobarConSeleccion(presupuesto.id_presupuesto, {
    detalles_aprobados: seleccionadas,
    accion: 'APROBAR'  // el backend maneja parcial o total según qué IDs vienen
    });

      if (response.success) {
        const total = calcularTotalSeleccionado(presupuesto);
        
        // Iniciar pago con MercadoPago
        const pagoResponse = await pagoService.iniciarPago(
          total,
          `Reparación ${dispositivo.marca} ${dispositivo.modelo} - ${seleccionadas.length} pieza(s)`,
          null,
          presupuesto.id_presupuesto
        );
        
        if (pagoResponse.init_point) {
          window.location.href = pagoResponse.init_point;
        }
        
        if (onPresupuestoAceptado) onPresupuestoAceptado();
      }
    } catch (error) {
      console.error('Error al aprobar presupuesto:', error);
      alert('Error al procesar la solicitud');
    } finally {
      setProcesando(false);
    }
  };

  // Rechazar presupuesto completo
  const handleRechazarPresupuesto = async (presupuestoId) => {
    if (window.confirm('¿Estás seguro que quieres rechazar este presupuesto?')) {
      setProcesando(true);
      try {
        await PresupuestoService.rechazarPresupuesto(presupuestoId);
        await cargarPresupuestosCalculados();
        if (onPresupuestoAceptado) onPresupuestoAceptado();
      } catch (error) {
        console.error('Error al rechazar presupuesto:', error);
        alert('Error al rechazar el presupuesto');
      } finally {
        setProcesando(false);
      }
    }
  };

  if (loading) {
    return (
      <Card className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando presupuestos...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        {error}
      </Alert>
    );
  }

  if (presupuestos.length === 0) {
    return null; // No mostrar nada si no hay presupuestos calculados
  }

  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-info text-white">
        <div className="d-flex align-items-center gap-2">
          <ShoppingCart size={20} />
          <h5 className="mb-0">Presupuesto disponible</h5>
        </div>
        <small>Selecciona las reparaciones que deseas realizar</small>
      </Card.Header>

      <Card.Body>
        {presupuestos.map((presupuesto) => {
          const abierto = expandidos[presupuesto.id_presupuesto];
          const seleccionadas = selecciones[presupuesto.id_presupuesto] || [];
          const totalSeleccionado = calcularTotalSeleccionado(presupuesto);
          const todasSeleccionadas = presupuesto.detalles?.length === seleccionadas.length;
          const haySeleccionadas = seleccionadas.length > 0;

          return (
            <div
              key={presupuesto.id_presupuesto}
              className="border rounded-3 mb-3 overflow-hidden"
              style={{ borderColor: '#0dcaf0' }}
            >
              {/* Cabecera */}
              <div
                onClick={() => togglePresupuesto(presupuesto.id_presupuesto)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  background: '#e6f7ff',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div className="d-flex align-items-center gap-3 flex-wrap">
                  <Calendar size={16} className="text-info" />
                  <span className="fw-semibold">
                    Presupuesto #{presupuesto.id_presupuesto}
                  </span>
                  <Badge bg="info">CALCULADO</Badge>
                  <Badge bg="warning">
                    Validez: {formatearFecha(presupuesto.fecha_validez)}
                  </Badge>
                </div>
                {abierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {/* Contenido expandido */}
              {abierto && (
                <div style={{ padding: '16px' }}>
                  <p className="text-muted small mb-3">
                    Este presupuesto ya fue calculado. Selecciona las piezas que deseas reparar.
                  </p>

                  {/* Lista de piezas seleccionables */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong>Piezas disponibles:</strong>
                      <div className="d-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          onClick={() => seleccionarTodas(presupuesto.id_presupuesto, presupuesto.detalles)}
                        >
                          Seleccionar todas
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-secondary"
                          onClick={() => deseleccionarTodas(presupuesto.id_presupuesto)}
                        >
                          Deseleccionar todas
                        </Button>
                      </div>
                    </div>

                    {presupuesto.detalles?.map((detalle) => (
                      <div
                        key={detalle.id_detalle}
                        className="border rounded p-2 mb-2"
                        style={{
                          background: seleccionadas.includes(detalle.id_detalle) ? '#e3f2fd' : 'white',
                          cursor: 'pointer'
                        }}
                        onClick={() => toggleSeleccionPieza(presupuesto.id_presupuesto, detalle.id_detalle)}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center gap-2">
                            <Form.Check
                              type="checkbox"
                              checked={seleccionadas.includes(detalle.id_detalle)}
                              onChange={() => {}}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <Wrench size={16} className="text-muted" />
                            <div>
                              <strong>{detalle.descripcion}</strong>
                              {detalle.pieza && (
                                <small className="text-muted d-block">
                                  ID Pieza: #{detalle.pieza?.id_pieza || detalle.id_pieza}
                                </small>
                              )}
                            </div>
                          </div>
                          <span className="fw-bold text-success">
                            ${parseFloat(detalle.costo).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Resumen y acciones */}
                  <div className="border-top pt-3 mt-2">
                    <Row className="align-items-center">
                      <Col>
                        <div>
                          <span className="text-muted">Piezas seleccionadas:</span>
                          <strong className="ms-2">{seleccionadas.length}</strong>
                          <span className="text-muted ms-3">Total a pagar:</span>
                          <strong className="text-success ms-2 fs-5">
                            ${totalSeleccionado.toFixed(2)}
                          </strong>
                        </div>
                      </Col>
                      <Col className="text-end">
                        <div className="d-flex gap-2 justify-content-end">
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRechazarPresupuesto(presupuesto.id_presupuesto)}
                            disabled={procesando}
                          >
                            <XCircle size={16} className="me-1" />
                            Rechazar todo
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => handleAprobarPresupuesto(presupuesto)}
                            disabled={procesando || !haySeleccionadas}
                          >
                            <CheckCircle size={16} className="me-1" />
                            {procesando ? 'Procesando...' : 'Aceptar y pagar'}
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </Card.Body>
    </Card>
  );
};

export default TimeLinePresupuesto;