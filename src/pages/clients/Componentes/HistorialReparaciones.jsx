// pages/cliente/componentes/HistorialReparaciones.jsx
import React, { useState } from 'react';
import { Card, Badge, Spinner, Alert, Collapse } from 'react-bootstrap';
import {
  History,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Wrench,
  User,
  Clock,
  DollarSign,
} from 'lucide-react';

export const HistorialReparaciones = ({ dispositivos, historialData = [], loading = false }) => {
  const [expandidos, setExpandidos] = useState({});

  let todasLasReparaciones = historialData || [];

  if (todasLasReparaciones.length === 0 && dispositivos?.length > 0) {
    todasLasReparaciones = dispositivos
      .flatMap((disp) =>
        (disp.reparaciones_historial || []).map((rep) => ({
          ...rep,
          dispositivo: `${disp.marca || ''} ${disp.modelo || ''}`.trim() || 'Dispositivo',
          codigo_interno: disp.codigo_interno,
        }))
      )
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }

  const toggleExpandir = (id) => {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getEstadoColor = (estado) => {
    const colores = {
      TERMINADO: 'success',
      TERMINADA: 'success',
      COMPLETADO: 'success',
      LISTO_PARA_RETIRAR: 'success',
      CANCELADO: 'danger',
      CANCELADA: 'danger',
      RECHAZADO: 'danger',
      EN_REPARACION: 'warning',
      EN_PROCESO: 'warning',
      PENDIENTE: 'secondary',
      ESPERANDO_PIEZA: 'info',
      ESPERANDO_APROBACION: 'primary',
      APROBADO: 'success',
    };
    return colores[estado] || 'secondary';
  };

  const getEstadoTexto = (estado) => {
    const textos = {
      TERMINADO: 'Terminado',
      TERMINADA: 'Terminada',
      COMPLETADO: 'Completado',
      LISTO_PARA_RETIRAR: 'Listo para retirar',
      CANCELADO: 'Cancelado',
      CANCELADA: 'Cancelada',
      RECHAZADO: 'Rechazado',
      EN_REPARACION: 'En reparación',
      EN_PROCESO: 'En proceso',
      PENDIENTE: 'Pendiente',
      ESPERANDO_PIEZA: 'Esperando pieza',
      ESPERANDO_APROBACION: 'Esperando aprobación',
      APROBADO: 'Aprobado',
    };
    return textos[estado] || estado || 'Desconocido';
  };

  const calcularCostoTotal = (rep) => {
    // Si tiene reparaciones_multiples, calcular desde las piezas NO rechazadas/canceladas
    if (rep.reparaciones_multiples && Array.isArray(rep.reparaciones_multiples)) {
      const totalPiezas = rep.reparaciones_multiples
        .filter((pieza) => pieza.estado !== 'RECHAZADO' && pieza.estado !== 'CANCELADO')
        .reduce((sum, pieza) => {
          return sum + parseFloat(pieza.precio_total || 0);
        }, 0);
      return totalPiezas;
    }

    // Último recurso: usar costo_diagnostico (solo si no hay reparaciones)
    if (rep.costo_diagnostico > 0) {
      return parseFloat(rep.costo_diagnostico);
    }

    return 0;
  };

  const getTipoReparacionBadge = (tipo) => {
    return tipo === 'con_diagnostico'
      ? { bg: 'info', text: 'Con diagnóstico' }
      : { bg: 'warning', text: 'Directa' };
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // 👉 Helper para obtener solo piezas activas
  const getPiezasActivas = (rep) => {
    if (!rep.reparaciones_multiples || !Array.isArray(rep.reparaciones_multiples)) return [];
    return rep.reparaciones_multiples.filter(
      (pieza) => pieza.estado !== 'RECHAZADO' && pieza.estado !== 'CANCELADO'
    );
  };

  if (loading) {
    return (
      <Card className="text-center p-5 shadow-sm">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <h5>Cargando historial...</h5>
      </Card>
    );
  }

  if (todasLasReparaciones.length === 0) {
    return (
      <Card className="text-center p-5 shadow-sm">
        <History size={48} className="text-muted mb-3 mx-auto" />
        <h5>No hay historial de reparaciones</h5>
        <p className="text-muted">Aún no tienes reparaciones registradas en tu historial.</p>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white border-0 pt-3 pb-2">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold">Historial de reparaciones</h5>
          <Badge bg="secondary" className="px-3 py-2 rounded-pill">
            {todasLasReparaciones.length} reparación{todasLasReparaciones.length !== 1 ? 'es' : ''}
          </Badge>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {todasLasReparaciones.map((rep) => {
          const tipoBadge = getTipoReparacionBadge(rep.tipo);
          const expandido = expandidos[rep.id] || false;
          const piezas = rep.reparaciones_multiples || [];
          const piezasActivas = getPiezasActivas(rep);
          const costoTotal = calcularCostoTotal(rep);
          const tieneDiagnostico = rep.tipo === 'con_diagnostico';

          return (
            <div key={rep.id} className="border-bottom">
              {/* Fila principal - Click para expandir */}
              <div
                className="d-flex align-items-center p-3"
                style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                onClick={() => toggleExpandir(rep.id)}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="me-3 text-muted">
                  {expandido ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                <div className="row w-100 align-items-center g-2">
                  {/* Fecha */}
                  <div className="col-md-2">
                    <div className="d-flex align-items-center">
                      <Calendar size={14} className="me-2 text-muted" />
                      <span className="small">{formatearFecha(rep.fecha)}</span>
                    </div>
                  </div>

                  {/* Dispositivo */}
                  <div className="col-md-2">
                    <strong className="small">{rep.dispositivo}</strong>
                    {rep.marca && <small className="d-block text-muted">{rep.marca}</small>}
                  </div>

                  {/* Código */}
                  <div className="col-md-1">
                    <code className="small bg-light px-2 py-1 rounded">
                      {rep.codigo_interno || 'N/A'}
                    </code>
                  </div>

                  {/* Descripción */}
                  <div className="col-md-3">
                    <div className="small text-truncate" style={{ maxWidth: '200px' }}>
                      {rep.descripcion || 'Reparación'}
                    </div>
                    {piezasActivas.length > 0 && (
                      <Badge bg="light" text="dark" className="mt-1 small">
                        {piezasActivas.length} pieza{piezasActivas.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>

                  {/* Estado */}
                  <div className="col-md-2">
                    <Badge bg={getEstadoColor(rep.estado)} className="px-2 py-1">
                      {getEstadoTexto(rep.estado)}
                    </Badge>
                  </div>

                  {/* Tipo */}
                  <div className="col-md-1">
                    <Badge bg={tipoBadge.bg} className="px-2 py-1">
                      {tipoBadge.text}
                    </Badge>
                  </div>

                  {/* Costo */}
                  <div className="col-md-1 text-end">
                    <span className="fw-bold text-success small">
                      ${costoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Detalle expandible */}
              <Collapse in={expandido}>
                <div className="p-3" style={{ background: '#f8f9fa' }}>
                  {/* Información del diagnóstico (solo para con_diagnostico) */}
                  {tieneDiagnostico && (
                    <div className="mb-3 p-3 bg-white rounded-3 border">
                      <h6 className="fw-bold mb-3 d-flex align-items-center text-primary">
                        <FileText size={18} className="me-2" />
                        Información del diagnóstico
                      </h6>
                      {rep.causa_detectada && (
                        <div className="mb-2">
                          <strong className="small text-secondary">Causa detectada:</strong>
                          <p className="small mb-0 mt-1">{rep.causa_detectada}</p>
                        </div>
                      )}
                      {rep.solucion && (
                        <div className="mb-2">
                          <strong className="small text-secondary">Solución propuesta:</strong>
                          <p className="small mb-0 mt-1">{rep.solucion}</p>
                        </div>
                      )}
                      {rep.costo_diagnostico > 0 && (
                        <div className="mt-2 pt-2 border-top">
                          <strong className="small text-secondary">Costo del diagnóstico:</strong>
                          <span className="text-success fw-bold ms-2">
                            $
                            {parseFloat(rep.costo_diagnostico).toLocaleString('es-AR', {
                              minimumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Lista de piezas - SOLO ACTIVAS */}
                  {piezasActivas.length > 0 && (
                    <div className="mb-3">
                      <h6 className="fw-bold mb-3 d-flex align-items-center text-success">
                        <Wrench size={18} className="me-2" />
                        Piezas {tieneDiagnostico ? 'utilizadas' : 'reparadas'}
                      </h6>
                      {piezasActivas.map((pieza, idx) => (
                        <div
                          key={pieza.id_multiple || idx}
                          className="bg-white rounded-3 border p-3 mb-2"
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                              <strong className="small">
                                {pieza.nombre_pieza || `Pieza #${pieza.id_pieza}`}
                              </strong>
                              <Badge bg={getEstadoColor(pieza.estado)} className="ms-2 small">
                                {getEstadoTexto(pieza.estado)}
                              </Badge>
                            </div>
                            <span className="fw-bold text-success small">
                              Precio: $
                              {parseFloat(pieza.precio_total || 0).toLocaleString('es-AR', {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </div>

                          {(pieza.comentario_tecnico || pieza.comentario_diagnostico) && (
                            <div className="small bg-light p-2 rounded-2">
                              <strong>Nota del técnico:</strong>{' '}
                              {pieza.comentario_tecnico || pieza.comentario_diagnostico}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Resumen final */}
                  <div className="bg-white rounded-3 border p-3">
                    <div className="row">
                      <div className="col-md-6">
                        {rep.tecnico && (
                          <div className="d-flex align-items-center mb-2">
                            <User size={16} className="text-muted me-2" />
                            <span className="small">
                              <strong>Técnico:</strong> {rep.tecnico}
                            </span>
                          </div>
                        )}
                        {rep.fecha && (
                          <div className="d-flex align-items-center">
                            <Clock size={16} className="text-muted me-2" />
                            <span className="small">
                              <strong>Finalizado:</strong> {formatearFecha(rep.fecha)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="col-md-6 text-md-end">
                        <div className="d-flex align-items-center justify-content-md-end">
                          <DollarSign size={20} className="text-success me-2" />
                          <div>
                            <small className="text-muted d-block">Total de la reparación</small>
                            <span className="fw-bold fs-5 text-success">
                              ${costoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Collapse>
            </div>
          );
        })}
      </Card.Body>
    </Card>
  );
};
