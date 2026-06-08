// pages/tecnico/componentes/DiagnosticoItemTecnico.jsx
import React, { useState, useEffect } from 'react';
import { Badge, Button, Spinner } from 'react-bootstrap';
import useAlert from '../../../components/Alert/useAlert';
import {
  Wrench,
  ChevronDown,
  ChevronUp,
  Calendar,
  DollarSign,
  Save,
  X,
  CheckCircle,
  Plus,
  Trash2,
  Package,
  FileText,
  Lightbulb,
  User,
  Play,
} from 'lucide-react';
import { DiagnosticoForm } from './DiagnosticoForm';
import { AgregarPiezaForm } from './AgregarPiezaForm';
import { diagnosticoService } from '../../../services/DiagnosticoService';
import {
  getGravedadColor,
  getGravedadLabel,
  getEstadoColor,
  getEstadoLabel,
} from '../../../constant/estados';

const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export function DiagnosticoItemTecnico({
  diagnostico: diagnosticoProp,
  onUpdate,
  onEstadoCambiado,
}) {
  const { showSuccess, showError, showConfirm } = useAlert();
  const [diagnostico, setDiagnostico] = useState(diagnosticoProp);
  const [expandido, setExpandido] = useState(false);
  const [editando, setEditando] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [mostrarAgregarPieza, setMostrarAgregarPieza] = useState(false);
  const [cargandoPiezas, setCargandoPiezas] = useState(false);
  const puedeIniciar = diagnostico.estado === 'ESPERANDO_DIAGNOSTICO';
  const puedeEnviarAprobacion = diagnostico.estado === 'EN_REVISION';

  useEffect(() => {
    if (expandido && diagnostico.id_diagnostico) {
      cargarDiagnosticoConPiezas();
    }
  }, [expandido]);

  const cargarDiagnosticoConPiezas = async () => {
    setCargandoPiezas(true);
    try {
      const response = await diagnosticoService.obtenerConPiezas(diagnostico.id_diagnostico);
      const data = response?.data || response;
      setDiagnostico(data);
    } catch (error) {
      console.error('Error cargando diagnóstico con piezas:', error);
    } finally {
      setCargandoPiezas(false);
    }
  };

  const gravColor = getGravedadColor?.(diagnostico.gravedad) || 'primary';
  const estColor = getEstadoColor?.(diagnostico.estado) || 'secondary';

  const iniciarEdicion = () => {
    setEditForm({
      gravedad: diagnostico.gravedad,
      estado: diagnostico.estado,
      causa_detectada: diagnostico.causa_detectada || '',
      solucion: diagnostico.solucion || '',
      observacion: diagnostico.observacion || '',
      costo: diagnostico.costo || '0.00',
      fecha_expiracion: diagnostico.fecha_expiracion || '',
    });
    setEditando(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setEditForm({});
  };
  const handleIniciarDiagnostico = async () => {
    try {
      setGuardando(true);
      // Cambiar estado a EN_REVISION
      await diagnosticoService.actualizarEstado(diagnostico.id_diagnostico, 'EN_REVISION');
      await cargarDiagnosticoConPiezas();
      if (onEstadoCambiado) onEstadoCambiado();
    } catch (error) {
      console.error('Error al iniciar diagnóstico:', error);
    } finally {
      setGuardando(false);
    }
  };

  const guardarEdicion = async () => {
    try {
      setGuardando(true);
      await onUpdate(diagnostico.id_diagnostico, editForm);
      setDiagnostico({ ...diagnostico, ...editForm });
      setEditando(false);
      await showSuccess('Diagnóstico actualizado correctamente', '¡Guardado!');
    } catch (err) {
      console.error('Error al actualizar diagnóstico:', err);
      await showError('No se pudo actualizar el diagnóstico', 'Error');
    } finally {
      setGuardando(false);
    }
  };

  const handleAgregarPieza = async () => {
    await cargarDiagnosticoConPiezas();
    setMostrarAgregarPieza(false);
  };

  const eliminarPieza = async (piezaId) => {
    await showConfirm({
      title: '¿Eliminar pieza?',
      message: 'Esta acción no se puede deshacer.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      onConfirm: async () => {
        try {
          await diagnosticoService.eliminarPieza(diagnostico.id_diagnostico, piezaId);
          await cargarDiagnosticoConPiezas();
        } catch (error) {
          console.error('Error eliminando pieza:', error);
          await showError('No se pudo eliminar la pieza', 'Error');
        }
      },
    });
  };

  // Dentro de tu componente
  const enviarAprobacion = async () => {
    // ✅ showSuccess/showError ya están disponibles desde arriba, sin llamar useAlert() acá
    try {
      setGuardando(true);
      await diagnosticoService.enviarAprobacion(diagnostico.id_diagnostico);
      await cargarDiagnosticoConPiezas();
      if (onEstadoCambiado) onEstadoCambiado();
      await showSuccess('Diagnóstico enviado a aprobación correctamente', '¡Enviado!');
    } catch (error) {
      console.error('Error enviando a aprobación:', error);
      await showError('Error al enviar el diagnóstico a aprobación', 'Error');
    } finally {
      setGuardando(false);
    }
  };

  const handleToggle = () => {
    setExpandido((v) => !v);
    if (expandido && editando) cancelarEdicion();
  };

  const tienePiezas = diagnostico.piezas && diagnostico.piezas.length > 0;

  return (
    <div className="mb-3">
      {/* Cabecera clickeable */}
      <div
        className={`d-flex justify-content-between align-items-center p-3 rounded-3
          ${expandido ? 'bg-light' : 'bg-white'}
          border-start border-4 border-${gravColor} shadow-sm`}
        onClick={handleToggle}
        style={{ cursor: 'pointer' }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className={`bg-${gravColor} bg-opacity-10 p-2 rounded-2`}>
            <Wrench size={18} className={`text-${gravColor}`} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              {getGravedadLabel && (
                <Badge bg={gravColor} className="px-2">
                  {getGravedadLabel(diagnostico.gravedad)}
                </Badge>
              )}
              {getEstadoLabel && (
                <Badge bg={estColor} className="px-2">
                  {getEstadoLabel(diagnostico.estado)}
                </Badge>
              )}
              <small className="text-muted d-flex align-items-center">
                <Calendar size={11} className="me-1" />
                Exp: {formatearFecha(diagnostico.fecha_expiracion)}
              </small>
            </div>
            <div className="d-flex align-items-center gap-2">
              <strong className="small">Diagnóstico #{diagnostico.id_diagnostico}</strong>
              {diagnostico.usuario && (
                <span className="text-muted small">
                  <User size={11} className="me-1" />
                  {diagnostico.usuario.nombre} {diagnostico.usuario.apellido}
                </span>
              )}
            </div>
          </div>
        </div>
        <div>{expandido ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
      </div>

      {/* Detalle expandible - TODO UNIFICADO */}
      {/* Detalle expandible - TODO UNIFICADO */}
      {expandido && (
        <div className="mt-2 p-4 bg-white rounded-3 border shadow-sm">
          {cargandoPiezas ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted small">Cargando detalles...</p>
            </div>
          ) : editando ? (
            <>
              <DiagnosticoForm
                formData={editForm}
                onChange={(field, value) => setEditForm((prev) => ({ ...prev, [field]: value }))}
                modo="edicion"
              />
              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={cancelarEdicion}
                  disabled={guardando}
                >
                  <X size={14} className="me-1" />
                  Cancelar
                </Button>
                <Button size="sm" variant="primary" onClick={guardarEdicion} disabled={guardando}>
                  <Save size={14} className="me-1" />
                  {guardando ? 'Guardando...' : 'Guardar cambios'}
                </Button>
              </div>
            </>
          ) : puedeIniciar ? (
            // ✅ PANTALLA DE INICIO (estado = ESPERANDO_DIAGNOSTICO)
            <div className="text-center py-2">
              <div className="bg-light rounded-3 p-2">
                <Wrench size={20} className="text-primary mb-3" />
                <h5 className="mb-2">Diagnóstico pendiente</h5>
                <p className="text-muted mb-3">
                  Hacé clic en "Iniciar diagnóstico" para comenzar a trabajar
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleIniciarDiagnostico}
                  disabled={guardando}
                  className="d-flex align-items-center gap-2 mx-auto"
                  style={{ width: 'fit-content' }}
                >
                  {guardando ? <Spinner size="sm" /> : <Play size={15} />}
                  {guardando ? 'Iniciando...' : 'Iniciar diagnóstico'}
                </Button>
              </div>
            </div>
          ) : (
            // ✅ FORMULARIO COMPLETO (estado = EN_REVISION o superior)
            <>
              {/* CAUSA Y SOLUCIÓN */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="bg-light rounded-3 p-3 h-100">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <FileText size={16} className="text-primary" />
                      <h6 className="fw-bold mb-0">Causa detectada</h6>
                    </div>
                    <p className="text-dark mb-0">
                      {diagnostico.causa_detectada || 'No especificada'}
                    </p>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="bg-light rounded-3 p-3 h-100">
                    <div className="d-flex align-items-center gap-2 mb-2">
                      <Lightbulb size={16} className="text-warning" />
                      <h6 className="fw-bold mb-0">Solución propuesta</h6>
                    </div>
                    <p className="text-dark mb-0">{diagnostico.solucion || 'No especificada'}</p>
                  </div>
                </div>
              </div>

              {/* OBSERVACIONES */}
              {diagnostico.observacion && (
                <div className="mb-4 p-3 bg-light rounded-3">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <Wrench size={16} className="text-secondary" />
                    <h6 className="fw-bold mb-0">Observaciones</h6>
                  </div>
                  <p className="text-muted small mb-0">{diagnostico.observacion}</p>
                </div>
              )}

              {/* PIEZAS NECESARIAS */}
              <div className="mt-2">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <Package size={18} className="text-success" />
                    <h6 className="fw-bold mb-0">Piezas necesarias</h6>
                    <Badge bg="secondary" className="rounded-pill">
                      {diagnostico.piezas?.length || 0} pieza(s)
                    </Badge>
                  </div>
                  {puedeEnviarAprobacion && (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => setMostrarAgregarPieza(!mostrarAgregarPieza)}
                      className="d-flex align-items-center gap-1 rounded-pill"
                    >
                      <Plus size={14} />
                      Agregar pieza
                    </Button>
                  )}
                </div>

                {mostrarAgregarPieza && (
                  <AgregarPiezaForm
                    diagnosticoId={diagnostico.id_diagnostico}
                    onPiezaAgregada={handleAgregarPieza}
                    onClose={() => setMostrarAgregarPieza(false)}
                  />
                )}

                {diagnostico.piezas && diagnostico.piezas.length > 0 ? (
                  <div className="table-responsive">
                    <table className="table table-bordered align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Pieza</th>
                          <th>Costo</th>
                          <th>Comentario</th>
                          <th>Estado</th>
                          {puedeEnviarAprobacion && <th width="50"></th>}
                        </tr>
                      </thead>
                      <tbody>
                        {diagnostico.piezas.map((pieza) => (
                          <tr key={pieza.id_pieza}>
                            <td className="fw-medium">{pieza.nombre_pieza || pieza.nombre}</td>
                            <td className="text-success fw-semibold">
                              ${parseFloat(pieza.pivot?.costo || 0).toFixed(2)}
                            </td>
                            <td className="text-muted small">{pieza.pivot?.comentario || '-'}</td>
                            <td>
                              <Badge
                                bg={
                                  pieza.pivot?.estado === 'aprobado'
                                    ? 'success'
                                    : pieza.pivot?.estado === 'rechazado'
                                      ? 'danger'
                                      : 'warning'
                                }
                                className="rounded-pill px-3"
                              >
                                {pieza.pivot?.estado || 'pendiente'}
                              </Badge>
                            </td>
                            {puedeEnviarAprobacion && (
                              <td>
                                <Button
                                  variant="link"
                                  size="sm"
                                  className="text-danger p-0"
                                  onClick={() => eliminarPieza(pieza.id_pieza)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <td colSpan="3" className="fw-bold fs-6">
                            Costo total
                          </td>
                          <td colSpan="2" className="fw-bold text-success fs-5">
                            $
                            {parseFloat(diagnostico.costo_total || diagnostico.costo || 0).toFixed(
                              2
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-light rounded-3">
                    <Package size={32} className="text-muted mb-2" />
                    <p className="text-muted mb-0 small">No hay piezas agregadas</p>
                    <p className="text-muted small">Use el botón "+ Agregar pieza" para comenzar</p>
                  </div>
                )}
              </div>

              {/* BOTONES FINALES */}
              <div className="mt-4 d-flex justify-content-between align-items-center pt-3 border-top">
                <Button
                  size="sm"
                  variant="link"
                  onClick={iniciarEdicion}
                  className="text-primary text-decoration-none"
                >
                  Editar diagnóstico
                </Button>
                {puedeEnviarAprobacion && (
                  <Button
                    variant="success"
                    size="md"
                    onClick={enviarAprobacion}
                    disabled={!tienePiezas || guardando}
                    className="d-flex align-items-center gap-2 px-4 rounded-pill"
                  >
                    {guardando ? <Spinner size="sm" /> : <CheckCircle size={16} />}
                    {guardando ? 'Enviando...' : 'Enviar Diagnóstico'}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        .diagnostico-item {
          transition: all 0.2s ease;
        }
        .diagnostico-item:hover {
          transform: translateX(4px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.08) !important;
        }
      `}</style>
    </div>
  );
}
