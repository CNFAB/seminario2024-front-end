// src/pages/cliente/Componentes/MisReclamosCliente.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Spinner, Alert, Collapse, ProgressBar, Table } from 'react-bootstrap';
import {
  ShieldAlert,
  Calendar,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Wrench,
  Package,
  Clock,
  AlertTriangle,
  Truck,
  FileText,
  ThumbsUp,
  RefreshCw,
  LogOut,
  Settings,
} from 'lucide-react';
import reclamoGarantiaService from '../../../services/reclamoGarantiaService';

const MisReclamosCliente = () => {
  const [reclamos, setReclamos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandidos, setExpandidos] = useState({});

  useEffect(() => {
    cargarReclamos();
  }, []);

  const cargarReclamos = async () => {
    setLoading(true);
    try {
      const response = await reclamoGarantiaService.obtenerMisReclamos();
      const reclamosData = response.data?.data || response.data || [];
      console.log('📋 Reclamos cargados:', reclamosData);
      setReclamos(reclamosData);
    } catch (err) {
      console.error('Error al cargar reclamos:', err);
      setError(err.response?.data?.message || 'No se pudieron cargar tus reclamos');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpandir = (id) => {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Configuración de estados del RECLAMO
  const getEstadoReclamoConfig = (estado) => {
    const config = {
      PENDIENTE: {
        bg: 'warning',
        text: 'Pendiente',
        icon: <Clock size={16} className="me-1" />,
        progreso: 10,
        descripcion: 'Tu reclamo está siendo revisado',
      },
      EN_REVISION: {
        bg: 'info',
        text: 'En revisión',
        icon: <RefreshCw size={16} className="me-1" />,
        progreso: 30,
        descripcion: 'Un técnico está analizando tu reclamo',
      },
      APROBADO: {
        bg: 'success',
        text: 'Aprobado',
        icon: <CheckCircle size={16} className="me-1" />,
        progreso: 50,
        descripcion: 'Tu reclamo fue aprobado',
      },
      COMPLETADO: {
        bg: 'secondary',
        text: 'Completado',
        icon: <CheckCircle size={16} className="me-1" />,
        progreso: 100,
        descripcion: 'Reclamo completado exitosamente',
      },
      RECHAZADO: {
        bg: 'danger',
        text: 'Rechazado',
        icon: <XCircle size={16} className="me-1" />,
        progreso: 100,
        descripcion: 'Tu reclamo fue rechazado',
      },
    };
    return (
      config[estado] || { bg: 'secondary', text: estado, icon: null, progreso: 0, descripcion: '' }
    );
  };

  // Configuración de estados de la REPARACIÓN
  const getEstadoReparacionConfig = (estado) => {
    const config = {
      PENDIENTE: { bg: 'warning', text: 'Pendiente', icon: <Clock size={14} /> },
      EN_REPARACION: { bg: 'primary', text: 'En reparación', icon: <Wrench size={14} /> },
      TERMINADO: { bg: 'success', text: 'Terminado', icon: <CheckCircle size={14} /> },
      ESPERANDO_PIEZA: { bg: 'secondary', text: 'Esperando pieza', icon: <Package size={14} /> },
      CANCELADO: { bg: 'danger', text: 'Cancelado', icon: <XCircle size={14} /> },
    };
    return config[estado] || { bg: 'secondary', text: estado || 'Sin estado', icon: null };
  };

  // Configuración de estados de las PIEZAS
  const getEstadoPiezaConfig = (estado) => {
    const config = {
      PENDIENTE: { bg: 'warning', text: 'Pendiente' },
      EN_REPARACION: { bg: 'primary', text: 'En reparación' },
      TERMINADO: { bg: 'success', text: 'Terminado' },
      ESPERANDO_PIEZA: { bg: 'secondary', text: 'Esperando pieza' },
      CANCELADO: { bg: 'danger', text: 'Cancelado' },
      RECHAZADO: { bg: 'danger', text: 'Rechazado' },
    };
    return config[estado] || { bg: 'secondary', text: estado };
  };

  // Configuración de estados del INGRESO
  const getEstadoIngresoConfig = (estado) => {
    const config = {
      TALLER: { bg: 'info', text: 'En taller', icon: <Settings size={14} /> },
      RETIRADO: { bg: 'success', text: 'Retirado', icon: <LogOut size={14} /> },
    };
    return config[estado] || { bg: 'secondary', text: estado || 'Sin estado', icon: null };
  };

  const getEstadoBadge = (estado, tipo = 'reclamo') => {
    let config;
    if (tipo === 'reparacion') {
      config = getEstadoReparacionConfig(estado);
    } else if (tipo === 'pieza') {
      config = getEstadoPiezaConfig(estado);
    } else if (tipo === 'ingreso') {
      config = getEstadoIngresoConfig(estado);
    } else {
      config = getEstadoReclamoConfig(estado);
    }

    return (
      <Badge bg={config.bg} className="px-3 py-2 d-inline-flex align-items-center gap-1">
        {config.icon}
        {config.text}
      </Badge>
    );
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatearFechaLarga = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatearMoneda = (monto) => {
    if (!monto || monto === 0) return 'Gratuito (Cubierto por garantía)';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(monto);
  };

  // Obtener dispositivo del reclamo
  const getDispositivoInfo = (reclamo) => {
    const garantia = reclamo.garantia;
    if (!garantia) return { nombre: 'Dispositivo no especificado' };

    const reparacion = garantia.reparacion;
    if (!reparacion) return { nombre: 'Dispositivo no especificado' };

    let dispositivo = reparacion.ingreso?.dispositivo;

    if (!dispositivo && reparacion.diagnostico?.ingreso?.dispositivo) {
      dispositivo = reparacion.diagnostico.ingreso.dispositivo;
    }

    if (!dispositivo) return { nombre: 'Dispositivo no especificado' };

    const modelo = dispositivo.modelo;
    return {
      nombre: modelo
        ? `${modelo.marca?.marca || ''} ${modelo.nombre_modelo || ''}`.trim()
        : 'Dispositivo',
    };
  };

  // Obtener piezas cubiertas por la garantía
  const getPiezasCubiertas = (reclamo) => {
    const garantia = reclamo.garantia;
    if (!garantia || !garantia.garantia_piezas) return [];

    return garantia.garantia_piezas.map((gp) => ({
      id: gp.id_garantia_pieza,
      nombre: gp.pieza?.nombre_pieza || 'Pieza no especificada',
      categoria: gp.categoria?.categoria || 'Sin categoría',
      fecha_fin: gp.fecha_fin,
      estado: gp.estado,
    }));
  };

  // Obtener la NUEVA REPARACIÓN (reparación de garantía)
  const getNuevaReparacion = (reclamo) => {
    return reclamo.nueva_reparacion || null;
  };

  // Obtener piezas de la reparación
  const getPiezasReparacion = (reparacion) => {
    if (!reparacion || !reparacion.reparaciones_multiples) return [];

    return reparacion.reparaciones_multiples.map((rm) => ({
      id: rm.id_multiple,
      nombre: rm.pieza?.nombre_pieza || 'Pieza no especificada',
      estado: rm.estado,
      precio_total: rm.precio_total,
      comentario: rm.comentario_tecnico,
    }));
  };

  // Calcular progreso de la reparación
  const calcularProgresoReparacion = (piezas) => {
    if (!piezas.length) return 0;
    const terminadas = piezas.filter((p) => p.estado === 'TERMINADO').length;
    return Math.round((terminadas / piezas.length) * 100);
  };

  if (loading) {
    return (
      <Card className="text-center p-5 shadow-sm">
        <Spinner animation="border" variant="primary" className="mb-3" />
        <h5>Cargando tus reclamos...</h5>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        <AlertTriangle size={18} className="me-2" />
        {error}
      </Alert>
    );
  }

  if (reclamos.length === 0) {
    return (
      <Card className="text-center p-5 shadow-sm">
        <ShieldAlert size={48} className="text-muted mb-3 mx-auto" />
        <h5>No tenés reclamos activos</h5>
        <p className="text-muted">Cuando reclames una garantía, aparecerá aquí.</p>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white border-0 pt-3 pb-2">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <ShieldAlert size={22} className="text-warning" />
            Mis Reclamos de Garantía
          </h5>
          <Badge bg="secondary" className="px-3 py-2 rounded-pill">
            {reclamos.length} reclamo{reclamos.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </Card.Header>

      <Card.Body className="p-0">
        {reclamos.map((reclamo) => {
          const expandido = expandidos[reclamo.id_reclamo] || false;
          const dispositivoInfo = getDispositivoInfo(reclamo);
          const piezasCubiertas = getPiezasCubiertas(reclamo);

          // Obtener la nueva reparación (reparación de garantía)
          const nuevaReparacion = getNuevaReparacion(reclamo);
          const tieneReparacion = !!nuevaReparacion;
          const estadoReparacion = nuevaReparacion?.estado;
          const piezasReparacion = getPiezasReparacion(nuevaReparacion);
          const progresoReparacion = calcularProgresoReparacion(piezasReparacion);
          const todasPiezasTerminadas =
            piezasReparacion.length > 0 && piezasReparacion.every((p) => p.estado === 'TERMINADO');

          // ✅ ACCESO DIRECTO: nueva_reparacion.ingreso.estado
          const ingreso = nuevaReparacion?.ingreso;
          const estadoIngreso = ingreso?.estado;
          const dispositivoRetirado = estadoIngreso === 'RETIRADO';
          const fechaIngreso = ingreso?.fecha_ingreso;

          return (
            <div key={reclamo.id_reclamo} className="border-bottom">
              {/* Fila principal */}
              <div
                className="d-flex align-items-center p-3"
                style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                onClick={() => toggleExpandir(reclamo.id_reclamo)}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div className="me-3 text-muted">
                  {expandido ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>

                <div className="row w-100 align-items-center g-2">
                  <div className="col-md-2">
                    <div className="d-flex align-items-center">
                      <Calendar size={14} className="me-2 text-muted" />
                      <span className="small">{formatearFecha(reclamo.fecha_reclamo)}</span>
                    </div>
                  </div>

                  <div className="col-md-3">
                    <strong className="small">{dispositivoInfo.nombre}</strong>
                  </div>

                  <div className="col-md-2">
                    <Badge bg="secondary" className="small">
                      Garantía #{reclamo.id_garantia}
                    </Badge>
                  </div>

                  <div className="col-md-3">
                    <div className="small text-truncate" style={{ maxWidth: '200px' }}>
                      {reclamo.descripcion_problema?.substring(0, 50)}
                      {reclamo.descripcion_problema?.length > 50 ? '...' : ''}
                    </div>
                  </div>

                  <div className="col-md-2">{getEstadoBadge(reclamo.estado, 'reclamo')}</div>
                </div>
              </div>

              {/* Detalle expandible */}
              <Collapse in={expandido}>
                <div className="p-4" style={{ background: '#f8f9fa' }}>
                  {/* Detalle del reclamo */}
                  <div className="mb-4 p-3 bg-white rounded-3 border">
                    <h6 className="fw-bold mb-3 d-flex align-items-center text-warning">
                      <FileText size={18} className="me-2" />
                      Detalle del reclamo
                    </h6>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <strong className="small text-secondary">Fecha del reclamo:</strong>
                        <p className="small mb-0">{formatearFechaLarga(reclamo.fecha_reclamo)}</p>
                      </div>
                      <div className="col-md-6">
                        <strong className="small text-secondary">Estado del reclamo:</strong>
                        <div className="mt-1">{getEstadoBadge(reclamo.estado, 'reclamo')}</div>
                      </div>
                    </div>

                    <div className="mb-3">
                      <strong className="small text-secondary">Descripción del problema:</strong>
                      <p className="small mb-0 mt-1 bg-light p-2 rounded">
                        {reclamo.descripcion_problema || 'Sin descripción'}
                      </p>
                    </div>

                    {reclamo.diagnostico_tecnico && (
                      <div className="mb-3 p-2 bg-info bg-opacity-10 rounded-2">
                        <strong className="small text-info">🔍 Diagnóstico del técnico:</strong>
                        <p className="small mb-0 mt-1">{reclamo.diagnostico_tecnico}</p>
                      </div>
                    )}
                  </div>

                  {/* Piezas cubiertas por la garantía */}
                  {piezasCubiertas.length > 0 && (
                    <div className="mb-4 p-3 bg-white rounded-3 border">
                      <h6 className="fw-bold mb-3 d-flex align-items-center text-primary">
                        <Package size={18} className="me-2" />
                        Piezas cubiertas por tu garantía
                      </h6>
                      <Table responsive size="sm" className="mb-0">
                        <thead>
                          <tr>
                            <th>Pieza</th>
                            <th>Categoría</th>
                            <th>Vencimiento</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {piezasCubiertas.map((pieza, idx) => (
                            <tr key={idx}>
                              <td className="small">{pieza.nombre}</td>
                              <td className="small">{pieza.categoria}</td>
                              <td className="small">{formatearFecha(pieza.fecha_fin)}</td>
                              <td>
                                <Badge bg={pieza.estado === 'ACTIVA' ? 'success' : 'secondary'}>
                                  {pieza.estado}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}

                  {/* SECCIÓN DE LA NUEVA REPARACIÓN */}
                  {tieneReparacion && (
                    <div className="mb-4 p-3 bg-white rounded-3 border">
                      <h6 className="fw-bold mb-3 d-flex align-items-center text-success">
                        <Wrench size={18} className="me-2" />
                        Estado de la reparación en garantía
                      </h6>

                      {/* Estado de la reparación */}
                      <div className="mb-3">
                        <strong className="small text-secondary">Estado de la reparación:</strong>
                        <div className="mt-2">{getEstadoBadge(estadoReparacion, 'reparacion')}</div>
                      </div>

                      {/* ✅ Estado del ingreso (directamente desde reparacion.ingreso) */}
                      {ingreso && (
                        <div className="mb-3">
                          <strong className="small text-secondary">
                            Estado del dispositivo en el taller:
                          </strong>
                          <div className="mt-2">{getEstadoBadge(estadoIngreso, 'ingreso')}</div>
                          {fechaIngreso && (
                            <small className="text-muted d-block mt-1">
                              📅 Ingresó al taller el: {formatearFechaLarga(fechaIngreso)}
                            </small>
                          )}
                        </div>
                      )}

                      {/* Progreso de la reparación */}
                      {piezasReparacion.length > 0 && (
                        <>
                          <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted">Progreso de la reparación</small>
                              <small className="text-muted">{progresoReparacion}%</small>
                            </div>
                            <ProgressBar
                              now={progresoReparacion}
                              variant={todasPiezasTerminadas ? 'success' : 'primary'}
                              className="rounded-pill"
                              style={{ height: '8px' }}
                            />
                          </div>

                          {/* Tabla de piezas */}
                          <Table responsive size="sm" className="mb-0 mt-3">
                            <thead>
                              <tr>
                                <th>Pieza a reparar/cambiar</th>
                                <th>Estado</th>
                                <th>Costo</th>
                                <th>Comentario</th>
                              </tr>
                            </thead>
                            <tbody>
                              {piezasReparacion.map((pieza, idx) => (
                                <tr key={pieza.id}>
                                  <td className="small fw-bold">{pieza.nombre}</td>
                                  <td>{getEstadoBadge(pieza.estado, 'pieza')}</td>
                                  <td className="small text-success">
                                    {formatearMoneda(pieza.precio_total)}
                                  </td>
                                  <td className="small text-muted">{pieza.comentario || '-'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </>
                      )}

                      {/* ✅ Mensajes según el estado del ingreso */}
                      {dispositivoRetirado ? (
                        <Alert variant="success" className="mb-0 mt-3">
                          <LogOut size={16} className="me-2" />
                          🎉 ¡Tu dispositivo ya fue retirado del taller! Esperamos que hayas quedado
                          satisfecho con la reparación.
                        </Alert>
                      ) : (
                        <>
                          {estadoReparacion === 'EN_REPARACION' && (
                            <Alert variant="info" className="mb-0 mt-3">
                              <Wrench size={16} className="me-2" />
                              🛠️ Tu dispositivo está siendo reparado. Te avisaremos cuando esté
                              listo.
                            </Alert>
                          )}

                          {estadoReparacion === 'ESPERANDO_PIEZA' && (
                            <Alert variant="secondary" className="mb-0 mt-3">
                              <Package size={16} className="me-2" />
                              📦 Estamos esperando una pieza para completar la reparación.
                            </Alert>
                          )}

                          {estadoReparacion === 'PENDIENTE' && (
                            <Alert variant="warning" className="mb-0 mt-3">
                              <Clock size={16} className="me-2" />⏳ La reparación está pendiente de
                              iniciar.
                            </Alert>
                          )}

                          {!estadoReparacion && (
                            <Alert variant="info" className="mb-0 mt-3">
                              <Settings size={16} className="me-2" />
                              📝 La reparación está siendo preparada.
                            </Alert>
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Mensaje cuando el reclamo está aprobado pero aún no hay reparación */}
                  {reclamo.estado === 'APROBADO' && !tieneReparacion && (
                    <Alert variant="success" className="mb-0">
                      <CheckCircle size={16} className="me-2" />✅ Tu reclamo fue aprobado. En breve
                      nos comunicaremos para coordinar el ingreso de tu dispositivo al taller.
                    </Alert>
                  )}

                  {/* Mensaje cuando el reclamo fue rechazado */}
                  {reclamo.estado === 'RECHAZADO' && (
                    <Alert variant="danger" className="mb-0">
                      <XCircle size={16} className="me-2" />❌ Tu reclamo fue rechazado. Motivo:{' '}
                      {reclamo.diagnostico_tecnico || 'Consulta con el taller para más información'}
                    </Alert>
                  )}

                  {/* Mensaje cuando el reclamo está completado */}
                  {reclamo.estado === 'COMPLETADO' && (
                    <Alert variant="secondary" className="mb-0">
                      <ThumbsUp size={16} className="me-2" />
                      🎉 ¡Reclamo completado! Gracias por confiar en nosotros.
                    </Alert>
                  )}
                </div>
              </Collapse>
            </div>
          );
        })}
      </Card.Body>
    </Card>
  );
};

export default MisReclamosCliente;
