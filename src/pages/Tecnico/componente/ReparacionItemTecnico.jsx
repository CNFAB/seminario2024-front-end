// pages/Tecnico/componente/ReparacionItemTecnico.jsx

import React, { useState, useEffect, useRef } from 'react';
import { Badge, Button, Spinner, Alert, Row, Col, Form } from 'react-bootstrap';
import {
  Wrench,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle,
  Clock,
  XCircle,
  PlusCircle,
  Package,
  DollarSign,
  X,
  Save,
  Calculator,
  Edit2,
  ShieldCheck,
} from 'lucide-react';

import reparacionMultipleService from '../../../services/ReparacionMultipleService';
import reparacionService from '../../../services/ReparacionService';
import { ModalCalculadorPrecioReparacion } from './ModalCalculadorPrecioReparacion';

const ESTADO_CONFIG = {
  PENDIENTE: { color: 'warning', label: 'Pendiente' },
  EN_REPARACION: { color: 'primary', label: 'En reparación' },
  TERMINADO: { color: 'success', label: 'Terminado' },
  ESPERANDO_PIEZA: { color: 'secondary', label: 'Esperando pieza' },
  CANCELADO: { color: 'danger', label: 'Cancelado' },
  ESPERANDO_APROBACION: { color: 'info', label: 'Esperando aprobación' },
  APROBADO: { color: 'success', label: 'Aprobado' },
  RECHAZADO: { color: 'danger', label: 'Rechazado' },
};

const getEstadoConfig = (e) => ESTADO_CONFIG[e] || { color: 'primary', label: e };
const fmt = (v) =>
  parseFloat(v || 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const PIEZA_VACIA = {
  id_pieza: '',
  nombre_pieza: '',
  precio_pieza: '',
  mano_obra: '',
  precio_total: '',
  comentario_tecnico: '',
};

function EditarComentarioReparacion({ reparacion, onGuardado, esGarantia }) {
  const [editando, setEditando] = useState(false);
  const [comentario, setComentario] = useState(reparacion.comentario || '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await reparacionService.actualizar(reparacion.id_reparacion, { comentario });
      setEditando(false);
      if (onGuardado) onGuardado();
    } catch {
      setError('No se pudo guardar el comentario.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="mb-3 p-2 bg-white rounded-3 border">
      <div className="d-flex justify-content-between align-items-center mb-1">
        <small className="text-muted fw-bold d-flex align-items-center gap-1">
          <Edit2 size={12} />
          DESCRIPCIÓN DEL TRABAJO
        </small>
        {!editando && (
          <Button
            size="sm"
            variant="outline-secondary"
            onClick={() => setEditando(true)}
            style={{ fontSize: '0.72rem', padding: '2px 8px' }}
          >
            Editar
          </Button>
        )}
      </div>
      {editando ? (
        <>
          <Form.Control
            as="textarea"
            rows={3}
            size="sm"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Describí el trabajo realizado..."
          />
          {error && <small className="text-danger d-block mt-1">{error}</small>}
          <div className="d-flex gap-2 mt-2 justify-content-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setEditando(false);
                setComentario(reparacion.comentario || '');
              }}
              disabled={guardando}
            >
              <X size={12} className="me-1" />
              Cancelar
            </Button>
            <Button size="sm" variant="primary" onClick={guardar} disabled={guardando}>
              <Save size={12} className="me-1" />
              {guardando ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </>
      ) : (
        <p className="small text-dark mb-0">
          {comentario ? (
            comentario
          ) : (
            <span className="text-muted fst-italic">
              Sin descripción — hacé clic en Editar para agregar una
            </span>
          )}
        </p>
      )}
    </div>
  );
}

export function ReparacionItemTecnico({ reparacion, esGarantia = false, onRecargar }) {
  const [expandido, setExpandido] = useState(false);
  const [piezas, setPiezas] = useState([]);
  const [loadingPiezas, setLoadingPiezas] = useState(false);
  const [errorPiezas, setErrorPiezas] = useState(null);
  const [accionEnCurso, setAccionEnCurso] = useState(null);

  const [showNuevaPieza, setShowNuevaPieza] = useState(false);
  const [showCalculador, setShowCalculador] = useState(false);
  const [nuevaPieza, setNuevaPieza] = useState(PIEZA_VACIA);
  const [creandoPieza, setCreandoPieza] = useState(false);
  const [errorNueva, setErrorNueva] = useState(null);

  const [enviandoAprobacion, setEnviandoAprobacion] = useState(false);
  const enviandoRef = useRef(false);

  const esGarantiaReparacion =
    esGarantia || reparacion.es_garantia === true || reparacion.es_garantia === 1;
  const esDesdeDiagnostico = !!reparacion.id_diagnostico;
  const esReparacionDirecta = !esDesdeDiagnostico;

  useEffect(() => {
    if (expandido) cargarPiezas();
  }, [expandido]);

  const cargarPiezas = async () => {
    setLoadingPiezas(true);
    setErrorPiezas(null);
    try {
      const data = await reparacionMultipleService.obtenerPorReparacionId(reparacion.id_reparacion);
      const nuevasPiezas = Array.isArray(data) ? data : data?.data || [];
      setPiezas(nuevasPiezas);
    } catch (err) {
      console.error('Error cargando piezas:', err);
      setErrorPiezas('No se pudieron cargar las piezas');
    } finally {
      setLoadingPiezas(false);
    }
  };

  const puedeTrabajarPieza = (estadoPieza) => {
    if (esGarantiaReparacion) return ['PENDIENTE', 'EN_REPARACION'].includes(estadoPieza);
    if (esDesdeDiagnostico)
      return ['PENDIENTE', 'EN_REPARACION', 'ESPERANDO_PIEZA'].includes(estadoPieza);
    return ['APROBADO', 'EN_REPARACION', 'ESPERANDO_PIEZA'].includes(estadoPieza);
  };

  const handleAccion = async (idMultiple, accion) => {
    if (String(idMultiple).startsWith('temp-')) return;
    setAccionEnCurso(idMultiple);
    try {
      const acciones = {
        comenzar: () => reparacionMultipleService.comenzar(idMultiple),
        terminar: () => reparacionMultipleService.terminar(idMultiple),
        esperar: () => reparacionMultipleService.esperarPieza(idMultiple),
        cancelar: () => reparacionMultipleService.cancelar(idMultiple),
        retomar: () => reparacionMultipleService.retomarDesdeEsperaPieza(idMultiple),
      };
      await acciones[accion]();
      const mapaEstados = {
        comenzar: 'EN_REPARACION',
        terminar: 'TERMINADO',
        esperar: 'ESPERANDO_PIEZA',
        cancelar: 'CANCELADO',
        retomar: 'EN_REPARACION',
      };
      const nuevoEstado = mapaEstados[accion];
      if (nuevoEstado) {
        setPiezas((prev) =>
          prev.map((p) => (p.id_multiple === idMultiple ? { ...p, estado: nuevoEstado } : p))
        );
      }
      if (onRecargar) onRecargar();
    } catch (err) {
      console.error(`Error acción ${accion}:`, err);
      await cargarPiezas();
    } finally {
      setAccionEnCurso(null);
    }
  };

  const enviarAAprobacion = async () => {
    if (esGarantiaReparacion || !esReparacionDirecta) return;
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    setEnviandoAprobacion(true);
    try {
      await reparacionService.actualizarParcial(reparacion.id_reparacion, 'ESPERANDO_APROBACION');
      for (const pieza of piezas) {
        await reparacionMultipleService.enviarAprobacion(pieza.id_multiple);
      }
      setPiezas((prev) => prev.map((p) => ({ ...p, estado: 'ESPERANDO_APROBACION' })));
      if (onRecargar) onRecargar();
    } catch (err) {
      console.error('Error enviando a aprobación:', err);
      await cargarPiezas();
    } finally {
      setEnviandoAprobacion(false);
      enviandoRef.current = false;
    }
  };

  const handleCalculadorAceptar = (resultado) => {
    if (typeof resultado === 'object' && resultado !== null) {
      setNuevaPieza((p) => ({
        ...p,
        id_pieza: resultado.piezaId || '',
        nombre_pieza: resultado.nombrePieza || '',
        precio_pieza: resultado.precioPieza?.toFixed(2) || '',
        mano_obra: resultado.manoObra?.toFixed(2) || '',
        precio_total: resultado.total?.toFixed(2) || '',
      }));
    } else {
      setNuevaPieza((p) => ({ ...p, precio_total: resultado }));
    }
    setShowCalculador(false);
  };

  // ── Agregar pieza con actualización optimista ──
  const handleAgregarPieza = async () => {
    if (!nuevaPieza.id_pieza) {
      setErrorNueva('Seleccioná una pieza primero.');
      return;
    }
    setCreandoPieza(true);
    setErrorNueva(null);

    // 1. Agregar al estado local de inmediato (optimista)
    const tempId = `temp-${Date.now()}`;
    const piezaOptimista = {
      id_multiple: tempId,
      id_pieza: parseInt(nuevaPieza.id_pieza),
      estado: esGarantiaReparacion ? 'EN_REPARACION' : 'PENDIENTE',
      precio_pieza_momento: parseFloat(nuevaPieza.precio_pieza) || 0,
      mano_obra_momento: parseFloat(nuevaPieza.mano_obra) || 0,
      precio_total: parseFloat(nuevaPieza.precio_total) || 0,
      comentario_tecnico: nuevaPieza.comentario_tecnico || null,
      pieza: { nombre_pieza: nuevaPieza.nombre_pieza },
      _optimista: true,
    };
    setPiezas((prev) => [...prev, piezaOptimista]);
    setNuevaPieza(PIEZA_VACIA);
    setShowNuevaPieza(false);

    // 2. Llamar al servidor en segundo plano
    try {
      await reparacionMultipleService.crear({
        id_reparacion: reparacion.id_reparacion,
        id_pieza: parseInt(nuevaPieza.id_pieza),
        estado: esGarantiaReparacion ? 'EN_REPARACION' : 'PENDIENTE',
        precio_pieza_momento: parseFloat(nuevaPieza.precio_pieza) || 0,
        mano_obra_momento: parseFloat(nuevaPieza.mano_obra) || 0,
        precio_total: parseFloat(nuevaPieza.precio_total) || 0,
        comentario_tecnico: nuevaPieza.comentario_tecnico || null,
      });
      // 3. Reemplazar optimista con datos reales
      await cargarPiezas();
      if (onRecargar) onRecargar();
    } catch {
      // Revertir si falló
      setPiezas((prev) => prev.filter((p) => p.id_multiple !== tempId));
      setErrorNueva('No se pudo agregar. Verificá el stock disponible.');
      setShowNuevaPieza(true);
    } finally {
      setCreandoPieza(false);
    }
  };

  const getEstadoGeneral = () => {
    if (piezas.length === 0) return 'SIN_PIEZAS';
    const piezasActivas = piezas.filter(
      (p) => p.estado !== 'RECHAZADO' && p.estado !== 'CANCELADO'
    );
    if (piezasActivas.length === 0) return 'TERMINADO';
    if (piezasActivas.every((p) => p.estado === 'TERMINADO')) return 'TERMINADO';
    if (piezasActivas.some((p) => p.estado === 'EN_REPARACION')) return 'EN_REPARACION';
    if (piezasActivas.some((p) => p.estado === 'ESPERANDO_PIEZA')) return 'ESPERANDO_PIEZA';
    if (piezasActivas.some((p) => p.estado === 'ESPERANDO_APROBACION'))
      return 'ESPERANDO_APROBACION';
    return 'PENDIENTE';
  };

  const estadoGeneral = expandido ? getEstadoGeneral() : reparacion.estado_general || 'PENDIENTE';
  const { color, label } = getEstadoConfig(estadoGeneral);

  const ESTADOS_YA_PROCESADOS = [
    'ESPERANDO_APROBACION',
    'APROBADO',
    'EN_REPARACION',
    'ESPERANDO_PIEZA',
    'TERMINADO',
    'CANCELADO',
    'RECHAZADO',
  ];
  const yaEnviadaAAprobacion = piezas
    .filter((p) => !p._optimista)
    .some((p) => ESTADOS_YA_PROCESADOS.includes(p.estado));

  const puedeEnviarAAprobacion =
    !esGarantiaReparacion &&
    esReparacionDirecta &&
    piezas.length > 0 &&
    !yaEnviadaAAprobacion &&
    !enviandoAprobacion;
  const puedeAgregarPiezas =
    !esGarantiaReparacion && esReparacionDirecta && !yaEnviadaAAprobacion && !enviandoAprobacion;
  const puedeAgregarPiezasGarantia = esGarantiaReparacion && esReparacionDirecta;

  const totalGeneral = piezas.reduce((sum, p) => sum + parseFloat(p.precio_total || 0), 0);

  return (
    <div className="mb-3">
      {/* Cabecera */}
      <div
        className={`d-flex justify-content-between align-items-center p-3 rounded-3
          ${expandido ? 'bg-light' : 'bg-white'} border-start border-4 border-${color} shadow-sm`}
        onClick={() => {
          setExpandido((v) => !v);
          if (expandido) setShowNuevaPieza(false);
        }}
        style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
      >
        <div className="d-flex align-items-center gap-3">
          <div className={`bg-${color} bg-opacity-10 p-2 rounded-2`}>
            <Wrench size={18} className={`text-${color}`} />
          </div>
          <div>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <Badge bg={color}>{label}</Badge>
              {esGarantiaReparacion && (
                <Badge bg="success" className="opacity-75">
                  <ShieldCheck size={10} className="me-1" />
                  GARANTÍA
                </Badge>
              )}
              {esDesdeDiagnostico ? (
                <Badge bg="primary" className="opacity-75">
                  Desde diagnóstico #{reparacion.id_diagnostico}
                </Badge>
              ) : (
                <Badge bg="info" className="opacity-75">
                  Directa sin diagnóstico
                </Badge>
              )}
            </div>
            <strong className="small">Reparación #{reparacion.id_reparacion}</strong>
            {reparacion.comentario && (
              <p className="text-muted small mb-0 mt-1" style={{ maxWidth: 340 }}>
                {reparacion.comentario.length > 60
                  ? reparacion.comentario.substring(0, 60) + '...'
                  : reparacion.comentario}
              </p>
            )}
          </div>
        </div>
        <div>{expandido ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</div>
      </div>

      {/* Detalle expandible */}
      {expandido && (
        <div className="mt-2 p-3 bg-light rounded-3 border">
          <EditarComentarioReparacion
            reparacion={reparacion}
            onGuardado={onRecargar}
            esGarantia={esGarantiaReparacion}
          />

          {/* ── TABLA ACUMULATIVA DE PIEZAS ── */}
          <div className="bg-white rounded-3 border mb-3">
            <div className="d-flex justify-content-between align-items-center px-3 pt-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2">
                <Package size={16} className="text-success" />
                <h6 className="fw-bold mb-0 small">Piezas necesarias</h6>
                <Badge bg="secondary" className="rounded-pill">
                  {piezas.length} pieza(s)
                </Badge>
              </div>
              {(puedeAgregarPiezas || puedeAgregarPiezasGarantia) && (
                <Button
                  size="sm"
                  variant={showNuevaPieza ? 'outline-secondary' : 'outline-primary'}
                  className="d-flex align-items-center gap-1 rounded-pill"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowNuevaPieza((v) => !v);
                    setErrorNueva(null);
                    setNuevaPieza(PIEZA_VACIA);
                  }}
                >
                  {showNuevaPieza ? (
                    <>
                      <X size={13} /> Cancelar
                    </>
                  ) : (
                    <>
                      <PlusCircle size={13} /> Agregar pieza
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Formulario inline dentro del panel de piezas */}
            {showNuevaPieza && (puedeAgregarPiezas || puedeAgregarPiezasGarantia) && (
              <div
                className="p-3 border-bottom bg-light"
                style={{ animation: 'fadeSlideIn 0.2s ease' }}
              >
                <h6 className="fw-bold small mb-3 d-flex align-items-center gap-2">
                  <Package size={15} className="text-primary" />
                  Nueva pieza — Reparación #{reparacion.id_reparacion}
                  {esGarantiaReparacion && <Badge bg="success">Garantía</Badge>}
                </h6>

                {esGarantiaReparacion && (
                  <Alert variant="success" className="py-1 small mb-2">
                    <ShieldCheck size={12} className="me-1" />
                    Esta pieza está cubierta por la garantía. No se generará costo para el cliente.
                  </Alert>
                )}

                {nuevaPieza.id_pieza ? (
                  <div className="p-2 bg-success bg-opacity-10 border border-success border-opacity-25 rounded-2 mb-3">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong className="small">{nuevaPieza.nombre_pieza}</strong>
                        {!esGarantiaReparacion && (
                          <>
                            <div className="small text-muted mt-1">
                              Pieza: ${fmt(nuevaPieza.precio_pieza)} · M.O.: {nuevaPieza.mano_obra}%
                            </div>
                            <div className="d-flex align-items-center gap-1 mt-1">
                              <DollarSign size={13} className="text-success" />
                              <strong className="text-success small">
                                Total: ${fmt(nuevaPieza.precio_total)}
                              </strong>
                            </div>
                          </>
                        )}
                        {esGarantiaReparacion && (
                          <div className="small text-success mt-1">
                            <ShieldCheck size={12} className="me-1" />
                            Cubierto por garantía
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline-secondary"
                        onClick={() => setNuevaPieza(PIEZA_VACIA)}
                        title="Cambiar pieza"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="w-100 mb-3 d-flex align-items-center justify-content-center gap-2"
                    onClick={() => setShowCalculador(true)}
                  >
                    <Calculator size={15} />
                    Seleccionar pieza{' '}
                    {esGarantiaReparacion ? 'cubierta por garantía' : 'y calcular precio'}
                  </Button>
                )}

                <Form.Group className="mb-3">
                  <Form.Label className="text-muted small fw-bold">
                    COMENTARIO (opcional)
                  </Form.Label>
                  <Form.Control
                    size="sm"
                    type="text"
                    value={nuevaPieza.comentario_tecnico}
                    onChange={(e) =>
                      setNuevaPieza((p) => ({ ...p, comentario_tecnico: e.target.value }))
                    }
                    placeholder="Observaciones sobre esta pieza..."
                  />
                </Form.Group>

                {errorNueva && (
                  <Alert variant="danger" className="py-2 small mb-2">
                    {errorNueva}
                  </Alert>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={creandoPieza}
                    onClick={() => {
                      setShowNuevaPieza(false);
                      setNuevaPieza(PIEZA_VACIA);
                    }}
                  >
                    <X size={13} className="me-1" />
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    variant="primary"
                    disabled={creandoPieza || !nuevaPieza.id_pieza}
                    onClick={handleAgregarPieza}
                  >
                    <Save size={13} className="me-1" />
                    {creandoPieza ? 'Agregando...' : 'Agregar pieza'}
                  </Button>
                </div>
              </div>
            )}

            {/* Tabla de piezas */}
            {loadingPiezas ? (
              <div className="text-center py-4">
                <Spinner animation="border" size="sm" variant="primary" />
                <p className="mt-2 text-muted small">Cargando piezas...</p>
              </div>
            ) : errorPiezas ? (
              <Alert variant="danger" className="py-2 small m-3">
                {errorPiezas}
                <Button size="sm" variant="outline-danger" className="ms-2" onClick={cargarPiezas}>
                  Reintentar
                </Button>
              </Alert>
            ) : piezas.length === 0 ? (
              <div className="text-center py-4 text-muted small">
                <Package size={24} className="mb-2" />
                <p className="mb-0">Sin piezas asignadas todavía</p>
                {esReparacionDirecta && !esGarantiaReparacion && !yaEnviadaAAprobacion && (
                  <small>Usá el botón "Agregar pieza" para comenzar</small>
                )}
                {esGarantiaReparacion && (
                  <small className="text-success">
                    Agregá las piezas necesarias para la garantía
                  </small>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-bordered align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Pieza</th>
                      {!esGarantiaReparacion && <th className="text-end">Precio</th>}
                      {!esGarantiaReparacion && <th className="text-end">M.O.</th>}
                      {!esGarantiaReparacion && <th className="text-end">Total</th>}
                      {esGarantiaReparacion && <th>Cobertura</th>}
                      <th>Estado</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {piezas.map((rm) => {
                      const cfg = getEstadoConfig(rm.estado);
                      const enAccion = accionEnCurso === rm.id_multiple;
                      const esOptimista = !!rm._optimista;

                      return (
                        <tr
                          key={rm.id_multiple}
                          style={{
                            opacity: esOptimista ? 0.65 : 1,
                            transition: 'opacity 0.3s ease',
                          }}
                        >
                          <td>
                            <div className="d-flex align-items-start gap-2">
                              <Package size={14} className="text-muted flex-shrink-0 mt-1" />
                              <div>
                                <strong className="small">
                                  {rm.pieza?.nombre_pieza || `Pieza #${rm.id_pieza}`}
                                </strong>
                                {rm.pieza?.categoria && (
                                  <p className="text-muted mb-0" style={{ fontSize: '0.72rem' }}>
                                    {rm.pieza.categoria.categoria}
                                  </p>
                                )}
                                {rm.comentario_tecnico && (
                                  <p
                                    className="text-muted mb-0 fst-italic"
                                    style={{ fontSize: '0.72rem' }}
                                  >
                                    {rm.comentario_tecnico}
                                  </p>
                                )}
                                {esOptimista && (
                                  <span
                                    className="badge bg-warning text-dark"
                                    style={{ fontSize: '0.65rem' }}
                                  >
                                    Guardando...
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>
                          {!esGarantiaReparacion && (
                            <td className="text-end small">${fmt(rm.precio_pieza_momento)}</td>
                          )}
                          {!esGarantiaReparacion && (
                            <td className="text-end small">{rm.mano_obra_momento}%</td>
                          )}
                          {!esGarantiaReparacion && (
                            <td className="text-end fw-semibold text-success small">
                              ${fmt(rm.precio_total)}
                            </td>
                          )}
                          {esGarantiaReparacion && (
                            <td className="small text-success">
                              <ShieldCheck size={13} className="me-1" />
                              Cubierto
                            </td>
                          )}
                          <td>
                            <Badge bg={cfg.color} className="rounded-pill px-2">
                              {cfg.label}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex align-items-center justify-content-center gap-1">
                              {enAccion || esOptimista ? (
                                <Spinner animation="border" size="sm" variant="primary" />
                              ) : (
                                <>
                                  {(rm.estado === 'PENDIENTE' || rm.estado === 'APROBADO') && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline-info"
                                        title="Comenzar"
                                        onClick={() => handleAccion(rm.id_multiple, 'comenzar')}
                                      >
                                        <Play size={13} />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        title="Cancelar"
                                        onClick={() => handleAccion(rm.id_multiple, 'cancelar')}
                                      >
                                        <XCircle size={13} />
                                      </Button>
                                    </>
                                  )}
                                  {rm.estado === 'EN_REPARACION' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline-success"
                                        title="Terminar"
                                        onClick={() => handleAccion(rm.id_multiple, 'terminar')}
                                      >
                                        <CheckCircle size={13} />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-secondary"
                                        title="Esperar pieza"
                                        onClick={() => handleAccion(rm.id_multiple, 'esperar')}
                                      >
                                        <Clock size={13} />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        title="Cancelar"
                                        onClick={() => handleAccion(rm.id_multiple, 'cancelar')}
                                      >
                                        <XCircle size={13} />
                                      </Button>
                                    </>
                                  )}
                                  {rm.estado === 'ESPERANDO_PIEZA' && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline-info"
                                        title="Retomar"
                                        onClick={() => handleAccion(rm.id_multiple, 'retomar')}
                                      >
                                        <Play size={13} />
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline-danger"
                                        title="Cancelar"
                                        onClick={() => handleAccion(rm.id_multiple, 'cancelar')}
                                      >
                                        <XCircle size={13} />
                                      </Button>
                                    </>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {!esGarantiaReparacion && piezas.length > 0 && (
                    <tfoot className="table-light">
                      <tr>
                        <td colSpan={3} className="fw-bold text-end">
                          Costo total
                        </td>
                        <td className="fw-bold text-success fs-6">${fmt(totalGeneral)}</td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            )}
          </div>

          {esGarantiaReparacion && estadoGeneral === 'TERMINADO' && piezas.length > 0 && (
            <Alert variant="success" className="py-2 small mt-2">
              <ShieldCheck size={14} className="me-1" />✅ Reparación de garantía completada. El
              dispositivo está listo para que el cliente lo retire.
            </Alert>
          )}

          {!esGarantiaReparacion && esReparacionDirecta && yaEnviadaAAprobacion && (
            <Alert variant="info" className="py-2 small mt-2">
              <Clock size={14} className="me-1" />
              Esta reparación fue enviada al cliente para aprobación. Las piezas se habilitarán
              cuando el cliente las apruebe.
            </Alert>
          )}

          {puedeEnviarAAprobacion && (
            <div className="mt-3">
              <Button
                variant="warning"
                size="sm"
                className="w-100 d-flex align-items-center justify-content-center gap-2"
                onClick={enviarAAprobacion}
                disabled={enviandoAprobacion}
              >
                {enviandoAprobacion ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <Clock size={14} />
                )}
                {enviandoAprobacion ? 'Enviando...' : '📨 Enviar a aprobación del cliente'}
              </Button>
              <small className="text-muted d-block text-center mt-1">
                El cliente deberá aprobar cada pieza antes de que puedas trabajar
              </small>
            </div>
          )}
        </div>
      )}

      <ModalCalculadorPrecioReparacion
        show={showCalculador}
        onHide={() => setShowCalculador(false)}
        onAceptar={handleCalculadorAceptar}
      />

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
