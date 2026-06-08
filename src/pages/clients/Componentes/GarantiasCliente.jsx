import React, { useState, useEffect } from 'react';
import {
  Card,
  Badge,
  Spinner,
  Alert,
  Collapse,
  ProgressBar,
  Table,
  Row,
  Col,
  Button,
} from 'react-bootstrap';
import {
  ShieldCheck,
  ShieldAlert,
  Calendar,
  ChevronDown,
  ChevronUp,
  Smartphone,
  CheckCircle,
  XCircle,
  Clock,
  Package,
  Eye,
  FileText,
} from 'lucide-react';
import garantiaService from '../../../services/garantiaService';
import GarantiaDetalleModal from './GarantiaDetalleModal'; // ✅ IMPORTAR MODAL

const GarantiasCliente = ({ dispositivos, clienteId }) => {
  const [loading, setLoading] = useState(true);
  const [garantiasPorDispositivo, setGarantiasPorDispositivo] = useState({});
  const [expandidos, setExpandidos] = useState({});

  // ✅ NUEVOS ESTADOS PARA EL MODAL
  const [showGarantiaModal, setShowGarantiaModal] = useState(false);
  const [reparacionId, setReparacionId] = useState(null);

  useEffect(() => {
    if (dispositivos && dispositivos.length > 0) {
      cargarGarantiasDeDispositivos();
    }
  }, [dispositivos]);

  const cargarGarantiasDeDispositivos = async () => {
    setLoading(true);
    const resultados = {};

    for (const dispositivo of dispositivos) {
      try {
        const response = await garantiaService.obtenerPorDispositivo(dispositivo.id_dispositivo);
        if (response.success && response.data.length > 0) {
          resultados[dispositivo.id_dispositivo] = {
            dispositivo: dispositivo,
            garantias: response.data,
          };
        }
      } catch (error) {
        console.error(
          `Error al cargar garantías del dispositivo ${dispositivo.id_dispositivo}:`,
          error
        );
      }
    }

    setGarantiasPorDispositivo(resultados);
    setLoading(false);
  };

  const toggleExpandirDispositivo = (id) => {
    setExpandidos((prev) => ({ ...prev, [`dispositivo-${id}`]: !prev[`dispositivo-${id}`] }));
  };

  const toggleExpandirGarantia = (id) => {
    setExpandidos((prev) => ({ ...prev, [`garantia-${id}`]: !prev[`garantia-${id}`] }));
  };

  const formatDate = (date) => {
    if (!date) return 'Sin fecha';
    return new Date(date).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getDiasRestantes = (fechaFin) => {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    if (fin < hoy) return 0;
    return Math.ceil((fin - hoy) / (1000 * 60 * 60 * 24));
  };

  const getPorcentajeRestante = (fechaInicio, fechaFin) => {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const hoy = new Date();

    if (hoy > fin) return 0;
    if (hoy < inicio) return 100;

    const total = fin - inicio;
    const restante = fin - hoy;
    return Math.round((restante / total) * 100);
  };

  const getEstadoGarantia = (garantia) => {
    const hoy = new Date();
    const fechaFin = new Date(garantia.fecha_fin);

    if (garantia.estado === 'ANULADA')
      return { texto: 'Anulada', color: 'secondary', activa: false };
    if (garantia.estado === 'RECLAMADA')
      return { texto: 'En reclamo', color: 'warning', activa: true };
    if (garantia.estado === 'VENCIDA' || fechaFin < hoy)
      return { texto: 'Vencida', color: 'danger', activa: false };
    if (garantia.estado === 'ACTIVA' && fechaFin >= hoy)
      return { texto: 'Activa', color: 'success', activa: true };

    return { texto: garantia.estado, color: 'secondary', activa: false };
  };

  const totalGarantias = Object.values(garantiasPorDispositivo).reduce(
    (total, item) => total + item.garantias.length,
    0
  );

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Cargando tus garantías...</p>
      </div>
    );
  }

  if (totalGarantias === 0) {
    return (
      <Card className="text-center p-5">
        <ShieldCheck size={48} className="text-muted mb-3 mx-auto" />
        <h5 className="text-muted">No tenés garantías</h5>
        <p className="text-muted small">
          Cuando completes una reparación, la garantía se generará automáticamente.
        </p>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-0 pt-3 pb-2">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0 fw-bold d-flex align-items-center gap-2">
              <ShieldCheck size={22} className="text-success" />
              Mis Garantías
            </h5>
            <Badge bg="secondary" className="px-3 py-2 rounded-pill">
              {totalGarantias} garantía{totalGarantias !== 1 ? 's' : ''}
            </Badge>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {Object.values(garantiasPorDispositivo).map(({ dispositivo, garantias }) => {
            const dispositivoExpandido =
              expandidos[`dispositivo-${dispositivo.id_dispositivo}`] || false;
            const garantiasActivas = garantias.filter((g) => {
              const estado = getEstadoGarantia(g);
              return estado.activa;
            });
            const garantiasVencidas = garantias.filter((g) => {
              const estado = getEstadoGarantia(g);
              return !estado.activa;
            });

            return (
              <div key={dispositivo.id_dispositivo} className="border-bottom">
                {/* Header del dispositivo */}
                <div
                  className="d-flex align-items-center p-3"
                  style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => toggleExpandirDispositivo(dispositivo.id_dispositivo)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="me-3 text-muted">
                    {dispositivoExpandido ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>

                  <div className="row w-100 align-items-center g-2">
                    <div className="col-md-5">
                      <div className="d-flex align-items-center gap-2">
                        <Smartphone size={16} className="text-primary" />
                        <strong className="small">
                          {dispositivo.marca?.marca || dispositivo.marca}{' '}
                          {dispositivo.modelo?.nombre_modelo || dispositivo.modelo}
                        </strong>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <Badge bg="secondary" className="small">
                        ID: {dispositivo.id_dispositivo}
                      </Badge>
                    </div>
                    <div className="col-md-4">
                      <div className="d-flex gap-2 justify-content-end">
                        <Badge bg="success" className="px-2 py-1">
                          {garantiasActivas.length} activas
                        </Badge>
                        {garantiasVencidas.length > 0 && (
                          <Badge bg="secondary" className="px-2 py-1">
                            {garantiasVencidas.length} vencidas
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detalle del dispositivo - garantías */}
                <Collapse in={dispositivoExpandido}>
                  <div className="p-4" style={{ background: '#f8f9fa' }}>
                    <div className="d-flex flex-column gap-3">
                      {garantias.map((garantia) => {
                        const estado = getEstadoGarantia(garantia);
                        const diasRestantes = getDiasRestantes(garantia.fecha_fin);
                        const porcentajeRestante = getPorcentajeRestante(
                          garantia.fecha_inicio,
                          garantia.fecha_fin
                        );
                        const garantiaExpandida =
                          expandidos[`garantia-${garantia.id_garantia}`] || false;

                        return (
                          <div
                            key={garantia.id_garantia}
                            className="bg-white rounded-3 border overflow-hidden"
                          >
                            {/* Fila principal de la garantía */}
                            <div
                              className="d-flex align-items-center p-3"
                              style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                              onClick={() => toggleExpandirGarantia(garantia.id_garantia)}
                              onMouseEnter={(e) => (e.currentTarget.style.background = '#f8f9fa')}
                              onMouseLeave={(e) => (e.currentTarget.style.background = 'white')}
                            >
                              <div className="me-3 text-muted">
                                {garantiaExpandida ? (
                                  <ChevronUp size={18} />
                                ) : (
                                  <ChevronDown size={18} />
                                )}
                              </div>

                              <div className="row w-100 align-items-center g-2">
                                <div className="col-md-3">
                                  <div className="d-flex align-items-center gap-2">
                                    {estado.texto === 'Activa' && (
                                      <CheckCircle size={14} className="text-success" />
                                    )}
                                    {estado.texto === 'En reclamo' && (
                                      <ShieldAlert size={14} className="text-warning" />
                                    )}
                                    {estado.texto === 'Vencida' && (
                                      <Clock size={14} className="text-danger" />
                                    )}
                                    <Badge bg={estado.color} className="px-2 py-1">
                                      {estado.texto}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="d-flex align-items-center">
                                    <Calendar size={14} className="me-2 text-muted" />
                                    <span className="small">
                                      {formatDate(garantia.fecha_inicio)}
                                    </span>
                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="d-flex align-items-center">
                                    <Clock size={14} className="me-2 text-muted" />
                                    <span className="small">
                                      {garantia.duracion_meses || 6} meses
                                    </span>
                                  </div>
                                </div>
                                <div className="col-md-3">
                                  <div className="d-flex align-items-center gap-2 justify-content-end">
                                    <Package size={14} className="text-muted" />
                                    <span className="small">
                                      {garantia.garantia_piezas?.length || 0} pieza(s)
                                    </span>
                                    {/* ✅ BOTÓN VER DETALLE */}
                                    <Button
                                      size="sm"
                                      variant="outline-primary"
                                      className="ms-2"
                                      onClick={(e) => {
                                        e.stopPropagation(); // Evita que se expanda el acordeón
                                        setReparacionId(garantia.id_reparacion);
                                        setShowGarantiaModal(true);
                                      }}
                                    >
                                      <Eye size={14} className="me-1" />
                                      Ver
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Detalle expandible de la garantía */}
                            <Collapse in={garantiaExpandida}>
                              <div className="p-3" style={{ background: '#f8f9fa' }}>
                                {/* Barra de progreso */}
                                {estado.activa && (
                                  <div className="mb-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                      <small className="text-muted">Progreso de garantía</small>
                                      <small
                                        className={
                                          porcentajeRestante < 30 ? 'text-warning' : 'text-success'
                                        }
                                      >
                                        {porcentajeRestante}% restante
                                      </small>
                                    </div>
                                    <ProgressBar
                                      now={100 - porcentajeRestante}
                                      variant={porcentajeRestante < 30 ? 'warning' : 'success'}
                                      style={{ height: '6px', borderRadius: '4px' }}
                                    />
                                    {estado.activa && diasRestantes <= 30 && (
                                      <div className="text-warning small mt-2">
                                        ⚠️ {diasRestantes} días restantes para que venza
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="row mb-3">
                                  <div className="col-md-6">
                                    <strong className="small text-secondary">
                                      Fecha de vencimiento:
                                    </strong>
                                    <p className="small mb-0">{formatDate(garantia.fecha_fin)}</p>
                                  </div>
                                  <div className="col-md-6">
                                    <strong className="small text-secondary">
                                      Reparación asociada:
                                    </strong>
                                    <p className="small mb-0">#{garantia.id_reparacion}</p>
                                  </div>
                                </div>

                                <div className="row mb-3">
                                  <div className="col-md-6">
                                    <strong className="small text-secondary">
                                      Tipo de garantía:
                                    </strong>
                                    <p className="small mb-0">
                                      {garantia.tipo_garantia || 'ESTÁNDAR'}
                                    </p>
                                  </div>
                                  <div className="col-md-6">
                                    <strong className="small text-secondary">Causa:</strong>
                                    <p className="small mb-0">
                                      {garantia.reparacion?.diagnostico?.causa_detectada ||
                                        'Sin causa registrada'}
                                    </p>
                                  </div>
                                </div>

                                {/* Piezas cubiertas */}
                                {garantia.garantia_piezas &&
                                  garantia.garantia_piezas.length > 0 && (
                                    <div className="mt-3">
                                      <strong className="small text-secondary">
                                        Piezas cubiertas:
                                      </strong>
                                      <Table size="sm" className="mt-2 mb-0">
                                        <thead>
                                          <tr>
                                            <th>Pieza</th>
                                            <th>Categoría</th>
                                            <th>Días de garantía</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {garantia.garantia_piezas.map((gp) => (
                                            <tr key={gp.id_garantia_pieza}>
                                              <td className="small">
                                                {gp.pieza?.nombre_pieza || 'Pieza no especificada'}
                                              </td>
                                              <td className="small">
                                                <Badge bg="secondary" pill>
                                                  {gp.categoria?.categoria || 'Sin categoría'}
                                                </Badge>
                                              </td>
                                              <td className="small">
                                                {gp.garantia_dias_asignados} días
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </Table>
                                    </div>
                                  )}

                                {/* Mensaje de reclamo activo */}
                                {garantia.estado === 'RECLAMADA' && (
                                  <Alert variant="warning" className="mb-0 mt-3 small">
                                    <ShieldAlert size={14} className="me-2" />
                                    Esta garantía tiene un reclamo activo.
                                  </Alert>
                                )}
                              </div>
                            </Collapse>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Collapse>
              </div>
            );
          })}
        </Card.Body>
      </Card>

      {/* ✅ MODAL DE DETALLE DE GARANTÍA */}
      <GarantiaDetalleModal
        show={showGarantiaModal}
        onHide={() => setShowGarantiaModal(false)}
        idReparacion={reparacionId}
      />
    </>
  );
};

export default GarantiasCliente;
