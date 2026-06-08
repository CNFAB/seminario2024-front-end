// src/pages/cliente/Componentes/TimeLineDiagnostico.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, Badge, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Wrench,
  LogOut,
  Package,
} from 'lucide-react';
import { diagnosticoService } from '../../../services/diagnosticoService';
import pagoService from '../../../services/pagoService';
import reparacionMultipleService from '../../../services/ReparacionMultipleService';
import './TimeLineDiagnostico.css';

// ============================================
// HELPERS
// ============================================

const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const formatearFechaLarga = (fecha) => {
  if (!fecha) return 'Sin fecha';
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const ESTADOS_REPARACION = ['APROBADO', 'LISTO_PARA_RETIRAR', 'TERMINADO', 'COMPLETADO'];
const ESTADOS_PAGO_PERMITIDO = ['LISTO_PARA_RETIRAR', 'TERMINADO', 'COMPLETADO'];

const getColorByEstado = (estado) => {
  const colores = {
    PAGADO: 'success',
    ESPERANDO_DIAGNOSTICO: 'warning',
    ESPERANDO_APROBACION: 'primary',
    NO_REPARADO: 'danger',
    EN_REPARACION: 'primary',
    EN_ESPERA_DE_PIEZAS: 'secondary',
    LISTO_PARA_RETIRAR: 'success',
    APROBADO: 'success',
    RECHAZADO: 'danger',
    COMPLETADO: 'success',
    TERMINADO: 'success',
    PENDIENTE: 'warning',
    CANCELADO: 'secondary',
    EN_REVISION: 'primary',
    EXPIRADO: 'danger',
    LEVE: 'info',
    MODERADO: 'warning',
    GRAVE: 'danger',
    URGENTE: 'danger',
  };
  return colores[estado] || 'light';
};

const getColorByEstadoReparacion = (estado) => {
  const colores = {
    PENDIENTE: 'secondary',
    EN_REPARACION: 'primary',
    ESPERANDO_PIEZA: 'warning',
    TERMINADO: 'success',
    COMPLETADO: 'success',
    LISTO_PARA_RETIRAR: 'info',
    APROBADO: 'success',
    RECHAZADO: 'danger',
  };
  return colores[estado] || 'light';
};

const getTextoEstadoReparacion = (estado) => {
  const textos = {
    PENDIENTE: ' Pendiente',
    EN_REPARACION: ' En reparación',
    ESPERANDO_PIEZA: ' Esperando pieza',
    TERMINADO: ' Terminado',
    COMPLETADO: ' Completado',
    LISTO_PARA_RETIRAR: ' Listo para retirar',
  };
  return textos[estado] || estado;
};

// ============================================
// COMPONENTE: BannerPago
// ============================================
const BannerPago = ({
  items,
  total,
  yaPago: yaPagoInicial,
  descripcion,
  idReferencia,
  idReparacion,
  onPagado,
  marca,
  modelo,
}) => {
  const [loadingPago, setLoadingPago] = useState(false);
  const [yaPago, setYaPago] = useState(yaPagoInicial);
  const pollingRef = useRef(null);

  useEffect(() => {
    setYaPago(yaPagoInicial);
  }, [yaPagoInicial]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const iniciarPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(async () => {
      try {
        const response = await reparacionMultipleService.obtenerEstadoPago(idReparacion);
        const estadoPago = response?.data?.estado_pago || response?.estado_pago;

        if (estadoPago === 'PAGADO' || estadoPago === 'PAGADO_LOCAL') {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          setYaPago(true);
          if (onPagado) onPagado();
        }
      } catch (err) {
        console.warn('Polling pago fallido, reintentando...', err);
      }
    }, 5000);
  };

  const handlePagar = async () => {
    setLoadingPago(true);
    try {
      const descripcionFinal = descripcion || `Reparación ${marca} ${modelo}`;
      await pagoService.iniciarPago(total, descripcionFinal, idReferencia, idReparacion);
      iniciarPolling();
      if (onPagado) onPagado();
    } catch (err) {
      console.error('Error al iniciar pago:', err);
      alert('No se pudo iniciar el pago. Intentá de nuevo.');
    } finally {
      setLoadingPago(false);
    }
  };

  const renderItems = () => {
    return items.map((pieza, idx) => (
      <div
        key={pieza.id_multiple || idx}
        className={idx !== items.length - 1 ? 'border-bottom pb-2 mb-2' : ''}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <span className="fw-semibold small">
              {pieza.pieza?.nombre_pieza || `Pieza #${pieza.id_pieza}`}
            </span>
            {pieza.comentario_tecnico && (
              <p className="mb-0 mt-1 text-muted" style={{ fontSize: '0.75rem' }}>
                {pieza.comentario_tecnico}
              </p>
            )}
          </div>
          <span className="text-success fw-bold small">
            ${parseFloat(pieza.precio_total || 0).toFixed(2)}
          </span>
        </div>
      </div>
    ));
  };

  return (
    <div className="mt-3">
      <div
        className="rounded-3 overflow-hidden mb-3"
        style={{ border: yaPago ? '1.5px solid #3b82f6' : '1.5px solid #10b981' }}
      >
        <div className="px-3 py-2" style={{ background: yaPago ? '#2563eb' : '#059669' }}>
          <span className="text-white fw-semibold" style={{ fontSize: '0.85rem' }}>
            📋 Resumen de piezas {yaPago ? 'pagadas' : 'a pagar'}
          </span>
        </div>
        <div className="bg-white p-3">
          {renderItems()}
          <div className="d-flex justify-content-between align-items-center pt-2 mt-2 border-top">
            <span className="fw-bold" style={{ color: yaPago ? '#1d4ed8' : '#059669' }}>
              {yaPago ? 'TOTAL PAGADO:' : 'TOTAL A PAGAR:'}
            </span>
            <span className="fw-bold fs-5" style={{ color: yaPago ? '#1d4ed8' : '#059669' }}>
              ${total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {yaPago ? (
        <div
          className="p-3 rounded-3 text-center"
          style={{
            background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
            border: '2px solid #3b82f6',
          }}
        >
          <CheckCircle size={32} className="text-primary mb-2" />
          <p className="fw-bold text-primary mb-0 small">
            Pago procesado. Pasá por el local a retirar tu dispositivo.
          </p>
        </div>
      ) : (
        <Button
          variant="primary"
          className="w-100 d-flex align-items-center justify-content-center gap-2 fw-bold"
          onClick={handlePagar}
          disabled={loadingPago}
        >
          {loadingPago ? (
            <>
              <Spinner size="sm" animation="border" /> Generando link...
            </>
          ) : (
            <>Pagar con MercadoPago — ${total.toFixed(2)}</>
          )}
        </Button>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE: VistaDiagnostico
// ============================================
const VistaDiagnostico = ({
  diagnostico,
  onConfirmarAccion,
  onAprobarPieza,
  onRechazarPieza,
  onAprobarDirecto,
  onSetMensaje,
}) => {
  const expirado = diagnostico.estado === 'EXPIRADO';
  const pendienteAprobacion = diagnostico.estado === 'ESPERANDO_APROBACION';

  const [estadosPiezas, setEstadosPiezas] = useState(() => {
    const map = {};
    diagnostico.piezas?.forEach((p) => {
      map[p.id_diagnostico_pieza] = p.estado;
    });
    return map;
  });
  const [enviando, setEnviando] = useState(false);

  const handleAprobarLocal = (idPieza) =>
    setEstadosPiezas((prev) => ({ ...prev, [idPieza]: 'APROBADO' }));

  const handleRechazarLocal = (idPieza) =>
    setEstadosPiezas((prev) => ({ ...prev, [idPieza]: 'RECHAZADO' }));

  const todasResueltas =
    diagnostico.piezas?.length > 0 &&
    Object.values(estadosPiezas).every((e) => e === 'APROBADO' || e === 'RECHAZADO');

  const costoTotalReal =
    diagnostico.piezas?.reduce((sum, pieza) => {
      const estadoActual = estadosPiezas[pieza.id_diagnostico_pieza];
      if (
        estadoActual === 'APROBADO' ||
        estadoActual === 'ESPERANDO_APROBACION' ||
        estadoActual === 'PENDIENTE'
      ) {
        return sum + parseFloat(pieza.costo || pieza.precio_total || 0);
      }
      return sum;
    }, 0) ?? parseFloat(diagnostico.costo || 0);

  const piezasAprobadas =
    diagnostico.piezas?.filter((p) => estadosPiezas[p.id_diagnostico_pieza] === 'APROBADO')
      .length ?? 0;

  const piezasRechazadas =
    diagnostico.piezas?.filter((p) => estadosPiezas[p.id_diagnostico_pieza] === 'RECHAZADO')
      .length ?? 0;

  const handleAprobarTodoYConfirmar = async () => {
    setEnviando(true);
    try {
      for (const [idPieza, estado] of Object.entries(estadosPiezas)) {
        if (estado === 'APROBADO') {
          await onAprobarPieza(idPieza);
        } else if (estado === 'RECHAZADO') {
          await onRechazarPieza(idPieza);
        }
      }
      await onAprobarDirecto(diagnostico.id_diagnostico);
    } catch (err) {
      console.error('Error aprobando todo:', err);
      onSetMensaje({ tipo: 'danger', texto: '❌ Error al aprobar. Intentá de nuevo.' });
      setTimeout(() => onSetMensaje(null), 3000);
      setEnviando(false);
    }
  };

  const tienePiezas = diagnostico.piezas?.length > 0;

  return (
    <>
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="d-flex gap-2 flex-wrap">
          <Badge bg={getColorByEstado(diagnostico.gravedad || 'LEVE')}>
            {diagnostico.gravedad || 'Leve'}
          </Badge>
          <Badge bg={getColorByEstado(diagnostico.estado)}>
            {diagnostico.estado === 'EXPIRADO'
              ? ' EXPIRADO'
              : diagnostico.estado?.replace(/_/g, ' ') || 'PENDIENTE'}
          </Badge>
          {diagnostico.fecha_expiracion && pendienteAprobacion && !expirado && (
            <small className="d-flex align-items-center text-muted">
              <Calendar size={12} className="me-1" />
              Expira: {formatearFecha(diagnostico.fecha_expiracion)}
            </small>
          )}
        </div>
        <small className="text-muted">Diagnóstico #{diagnostico.id_diagnostico}</small>
      </div>

      <div className="row mt-2">
        <div className="col-md-6">
          {diagnostico.causa_detectada && (
            <p className="mb-2">
              <strong>Causa detectada:</strong>
              <br />
              <span className="text-dark">{diagnostico.causa_detectada}</span>
            </p>
          )}
        </div>
        <div className="col-md-6">
          {diagnostico.solucion && (
            <p className="mb-2">
              <strong>Solución propuesta:</strong>
              <br />
              <span className="text-dark">{diagnostico.solucion}</span>
            </p>
          )}
        </div>
      </div>

      <div className="d-flex align-items-center gap-2 mb-2 mt-2">
        <strong>Costo total:</strong>{' '}
        <span className={`fw-bold fs-5 ${expirado ? 'text-muted' : 'text-success'}`}>
          <DollarSign size={16} style={{ display: 'inline' }} />
          {costoTotalReal.toFixed(2)}
        </span>
        {piezasRechazadas > 0 && (
          <Badge bg="info" className="ms-2">
            {piezasAprobadas} de {diagnostico.piezas.length} piezas seleccionadas
          </Badge>
        )}
      </div>

      {tienePiezas && (
        <div className="mb-3">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>
              {piezasAprobadas} aprobada{piezasAprobadas !== 1 ? 's' : ''}
            </span>
            <span>
              {piezasRechazadas} rechazada{piezasRechazadas !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="progress" style={{ height: '6px' }}>
            <div
              className="progress-bar bg-success"
              style={{ width: `${(piezasAprobadas / diagnostico.piezas.length) * 100}%` }}
            />
            <div
              className="progress-bar bg-danger"
              style={{ width: `${(piezasRechazadas / diagnostico.piezas.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {tienePiezas && pendienteAprobacion && !expirado && (
        <div className="mt-3">
          <p className="fw-semibold mb-2 small"> Piezas necesarias para la reparación</p>
          {diagnostico.piezas.map((pieza) => {
            const estadoActual = estadosPiezas[pieza.id_diagnostico_pieza];
            const esPendiente =
              estadoActual === 'ESPERANDO_APROBACION' || estadoActual === 'PENDIENTE';
            const esAprobada = estadoActual === 'APROBADO';
            const esRechazada = estadoActual === 'RECHAZADO';
            const subtotal = parseFloat(pieza.costo || pieza.precio_total || 0);

            return (
              <div
                key={pieza.id_diagnostico_pieza}
                className={`border rounded-2 p-3 mb-2 ${
                  esPendiente
                    ? 'bg-light'
                    : esAprobada
                      ? 'bg-success bg-opacity-10'
                      : 'bg-danger bg-opacity-10'
                }`}
              >
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <strong className="small">
                        {pieza.nombre_pieza || `Pieza #${pieza.id_pieza}`}
                      </strong>
                      {esAprobada && (
                        <Badge bg="success">
                          <CheckCircle size={10} className="me-1" />
                          Aprobada
                        </Badge>
                      )}
                      {esRechazada && (
                        <Badge bg="danger">
                          <XCircle size={10} className="me-1" />
                          Rechazada
                        </Badge>
                      )}
                      {esPendiente && (
                        <Badge bg="warning" className="text-dark">
                          Pendiente
                        </Badge>
                      )}
                    </div>
                    {pieza.comentario && pieza.comentario !== 'Sin comentario' && (
                      <p className="small text-muted mb-0 mt-1">
                        <span className="fw-bold">Nota:</span> {pieza.comentario}
                      </p>
                    )}
                  </div>
                  <div className="text-end">
                    {esRechazada ? (
                      <>
                        <div className="text-decoration-line-through text-muted small">
                          ${subtotal.toFixed(2)}
                        </div>
                        <div className="text-danger small fw-bold">No incluido</div>
                      </>
                    ) : (
                      <div className="fw-bold text-success small">${subtotal.toFixed(2)}</div>
                    )}
                  </div>
                </div>

                <div className="d-flex gap-2 mt-2 justify-content-end">
                  <Button
                    size="sm"
                    variant={esRechazada ? 'danger' : 'outline-danger'}
                    className="d-flex align-items-center gap-1"
                    onClick={() => handleRechazarLocal(pieza.id_diagnostico_pieza)}
                    disabled={enviando}
                  >
                    <XCircle size={14} /> Rechazar
                  </Button>
                  <Button
                    size="sm"
                    variant={esAprobada ? 'success' : 'outline-success'}
                    className="d-flex align-items-center gap-1"
                    onClick={() => handleAprobarLocal(pieza.id_diagnostico_pieza)}
                    disabled={enviando}
                  >
                    <CheckCircle size={14} /> Aprobar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {pendienteAprobacion && !expirado && !tienePiezas && (
        <div className="mt-3 d-flex gap-2 justify-content-end">
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => onConfirmarAccion(diagnostico.id_diagnostico, 'rechazar')}
          >
            <XCircle size={14} /> Rechazar diagnóstico
          </Button>
          <Button
            size="sm"
            variant="success"
            onClick={() => onConfirmarAccion(diagnostico.id_diagnostico, 'aceptar')}
          >
            <CheckCircle size={14} /> Aprobar reparación ($
            {parseFloat(diagnostico.costo || 0).toFixed(2)})
          </Button>
        </div>
      )}

      {pendienteAprobacion && !expirado && tienePiezas && (
        <div className="mt-3 d-flex gap-2 justify-content-between align-items-center">
          <Button
            size="sm"
            variant="outline-danger"
            onClick={() => onConfirmarAccion(diagnostico.id_diagnostico, 'rechazar')}
            disabled={enviando}
          >
            <XCircle size={14} /> Rechazar diagnóstico
          </Button>
          <Button
            size="sm"
            variant="success"
            onClick={handleAprobarTodoYConfirmar}
            disabled={enviando}
          >
            {enviando ? (
              <>
                <Spinner size="sm" animation="border" /> Procesando...
              </>
            ) : todasResueltas ? (
              <>
                <CheckCircle size={14} /> Confirmar y aprobar reparación
              </>
            ) : (
              <>
                <CheckCircle size={14} /> Aprobar todo (${costoTotalReal.toFixed(2)})
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );
};

// ============================================
// COMPONENTE: VistaReparacion
// ============================================
const VistaReparacion = ({
  diagnostico,
  marca,
  modelo,
  onPagado,
  esGarantia = false,
  estaRetirado = false,
}) => {
  console.log('🔧 [VistaReparacion] Props recibidas:', {
    id_diagnostico: diagnostico.id_diagnostico,
    esGarantia,
    estaRetirado,
    estado_pago_reparacion: diagnostico.reparacion?.estado_pago,
  });
  const piezas = diagnostico.reparacion?.reparaciones_multiples || [];

  const [estadoPago, setEstadoPago] = useState(diagnostico.reparacion?.estado_pago);
  const yaPago = estadoPago === 'PAGADO' || estadoPago === 'PAGADO_LOCAL';

  useEffect(() => {
    setEstadoPago(diagnostico.reparacion?.estado_pago);
  }, [diagnostico.reparacion?.estado_pago]);

  const handlePagado = () => {
    setEstadoPago('PAGADO');
    if (onPagado) onPagado();
  };

  // ✅ PASO 1: Si ya está retirado, mostrar mensaje de RETIRADO
  if (estaRetirado) {
    return (
      <div className="py-2">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Badge bg="secondary">RETIRADO</Badge>
          <small className="text-muted">Diagnóstico #{diagnostico.id_diagnostico}</small>
        </div>
        <div
          className="p-3 rounded-3 text-center"
          style={{
            background: 'linear-gradient(135deg, #e2e3e5, #d3d3d3)',
            border: '1.5px solid #adb5bd',
          }}
        >
          <CheckCircle size={32} className="text-secondary mb-2" />
          <p className="fw-bold text-secondary mb-0"> Dispositivo ya retirado</p>
          <p className="text-secondary mb-0 small">Este dispositivo fue retirado del local.</p>
        </div>
      </div>
    );
  }

  // ✅ PASO 2: Si es garantía
  if (esGarantia) {
    const piezasActivas = piezas.filter(
      (p) => p.estado !== 'RECHAZADO' && p.estado !== 'CANCELADO'
    );
    const todasTerminadas =
      piezasActivas.length > 0 && piezasActivas.every((p) => p.estado === 'TERMINADO');

    return (
      <div className="py-2">
        <div className="d-flex align-items-center gap-2 mb-3">
          <Badge bg="success">GARANTÍA</Badge>
          {todasTerminadas ? (
            <Badge bg="success">Listo para retirar</Badge>
          ) : (
            <Badge bg="primary">En reparación</Badge>
          )}
          <small className="text-muted">Diagnóstico #{diagnostico.id_diagnostico}</small>
        </div>

        {piezasActivas.length > 0 && (
          <div className="mb-3">
            <p className="fw-semibold mb-2 small text-success">
              Piezas reparadas (cubiertas por garantía)
            </p>
            {piezasActivas.map((pieza) => (
              <div
                key={pieza.id_multiple}
                className="d-flex justify-content-between align-items-center py-2 border-bottom small"
              >
                <div className="d-flex align-items-center gap-2">
                  <span>{pieza.pieza?.nombre_pieza || `Pieza #${pieza.id_pieza}`}</span>
                </div>
                <Badge bg={getColorByEstadoReparacion(pieza.estado)}>
                  {getTextoEstadoReparacion(pieza.estado)}
                </Badge>
              </div>
            ))}
          </div>
        )}

        {todasTerminadas ? (
          <div
            className="p-3 rounded-3 text-center"
            style={{
              background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
              border: '2px solid #3b82f6',
            }}
          >
            <CheckCircle size={32} className="text-primary mb-2" />
            <p className="fw-bold text-primary mb-0"> Reparación de garantía completada.</p>
            <p className="text-primary mb-0 small">Pasá por el local a retirar tu dispositivo.</p>
          </div>
        ) : (
          <div
            className="p-3 rounded-3 text-center"
            style={{
              background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
              border: '2px solid #6366f1',
            }}
          >
            <Wrench size={32} className="text-primary mb-2" />
            <p className="fw-bold text-primary mb-0">
              🔧 Reparación en proceso (cubierta por garantía)
            </p>
            <p className="text-primary mb-0 small">
              Tu dispositivo está siendo reparado sin costo adicional.
            </p>
          </div>
        )}
      </div>
    );
  }

  const total = piezas.reduce((sum, p) => sum + parseFloat(p.precio_total || 0), 0);
  const estaTerminado = piezas.every((p) => ESTADOS_PAGO_PERMITIDO.includes(p.estado));

  // ✅ PASO 3: Si está terminado y NO pagado
  if (estaTerminado && !yaPago) {
    return (
      <div className="opciones-pago-container">
        <BannerPago
          items={piezas}
          total={total}
          yaPago={false}
          descripcion={`Diagnóstico #${diagnostico.id_diagnostico} - ${marca} ${modelo}`}
          idReferencia={diagnostico.id_diagnostico}
          idReparacion={diagnostico.reparacion?.id_reparacion}
          onPagado={handlePagado}
          marca={marca}
          modelo={modelo}
        />
        <div className="retiro-local-card mb-3">
          <div className="retiro-local-header">
            <h6 className="mb-0 text-center"> También podés pagar y retirar en nuestro local</h6>
            <div className="text-center py-1">
              <small className="text-muted">
                Lunes a Viernes: 9:00 - 18:00 | Sábados: 9:00 - 13:00
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ PASO 4: Si está terminado y pagado (pero NO retirado)
  if (estaTerminado && yaPago) {
    return (
      <div className="opciones-pago-container">
        <BannerPago
          items={piezas}
          total={total}
          yaPago={true}
          descripcion={`Diagnóstico #${diagnostico.id_diagnostico} - ${marca} ${modelo}`}
          idReferencia={diagnostico.id_diagnostico}
          idReparacion={diagnostico.reparacion?.id_reparacion}
          onPagado={handlePagado}
          marca={marca}
          modelo={modelo}
        />
      </div>
    );
  }

  // ✅ PASO 5: Resto de casos (en reparación, etc.)
  return (
    <div className="mt-1">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center gap-2">
          <Badge bg="success">Aprobado</Badge>
          <small className="text-muted">Diagnóstico #{diagnostico.id_diagnostico}</small>
        </div>
      </div>

      <p className="fw-semibold mb-2 small text-primary">⚙️ Estado de reparación</p>
      {piezas.map((rep) => (
        <div
          key={rep.id_multiple}
          className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom"
        >
          <div>
            <strong className="small">{rep.pieza?.nombre_pieza || `Pieza #${rep.id_pieza}`}</strong>
          </div>
          <div className="text-end">
            <div className="fw-bold text-success small">
              ${parseFloat(rep.precio_total || 0).toFixed(2)}
            </div>
            <Badge bg={getColorByEstadoReparacion(rep.estado)}>
              {getTextoEstadoReparacion(rep.estado)}
            </Badge>
          </div>
        </div>
      ))}

      {piezas.some((r) => r.estado === 'EN_REPARACION') && (
        <Alert variant="info" className="py-2 small mb-0 mt-2">
          Tu dispositivo está siendo reparado. Te avisaremos cuando esté listo.
        </Alert>
      )}
      {piezas.some((r) => r.estado === 'ESPERANDO_PIEZA') && (
        <Alert variant="warning" className="py-2 small mb-0 mt-2">
          Estamos esperando la llegada de una pieza para continuar.
        </Alert>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE: ReparacionDirectaPendiente
// ============================================
const ReparacionDirectaPendiente = ({
  reparacion,
  fechaIngreso,
  onAprobarPieza,
  onRechazarPieza,
  onRecargar,
  esGarantia = false,
}) => {
  const [procesando, setProcesando] = useState(false);
  const [expandido, setExpandido] = useState(false);

  const [estadosPiezas, setEstadosPiezas] = useState(() => {
    const map = {};
    reparacion.reparaciones_multiples?.forEach((p) => {
      map[p.id_multiple] = p.estado;
    });
    return map;
  });

  const piezas = reparacion.reparaciones_multiples || [];
  const fechaMostrada = fechaIngreso || reparacion.fecha_ingreso || null;

  // Verificar si ya fue retirado (por el estado del ingreso)
  const estaRetirada = reparacion.ingreso?.estado === 'RETIRADO';
  console.log('total', reparacion);

  if (esGarantia) {
    const piezasActivas = piezas.filter(
      (p) => p.estado !== 'RECHAZADO' && p.estado !== 'CANCELADO'
    );
    const todasTerminadas =
      piezasActivas.length > 0 && piezasActivas.every((p) => p.estado === 'TERMINADO');

    return (
      <div
        className="border rounded-3 mb-3 overflow-hidden"
        style={{ borderColor: estaRetirada ? '#6c757d' : '#10b981' }}
      >
        <div
          onClick={() => setExpandido(!expandido)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            cursor: 'pointer',
            background: estaRetirada ? '#f8f9fa' : '#f0fdf4',
          }}
        >
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <Calendar size={16} style={{ color: estaRetirada ? '#6c757d' : '#10b981' }} />
            <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
              {fechaMostrada ? formatearFechaLarga(fechaMostrada) : 'Sin fecha'}
            </span>
            <span
              style={{
                background: estaRetirada ? '#6c757d' : '#10b981',
                color: 'white',
                fontSize: '0.7rem',
                padding: '2px 8px',
                borderRadius: '20px',
                fontWeight: 600,
              }}
            >
              🛡️ GARANTÍA
            </span>
            {estaRetirada ? (
              <Badge bg="secondary">Retirado</Badge>
            ) : (
              <Badge bg={todasTerminadas ? 'success' : 'primary'}>
                {todasTerminadas ? 'Listo para retirar' : 'En reparación'}
              </Badge>
            )}
          </div>
          <div className="d-flex align-items-center gap-2">
            <span style={{ fontSize: '0.78rem', color: '#888' }}>
              {piezasActivas.length} pieza{piezasActivas.length !== 1 ? 's' : ''}
            </span>
            {expandido ? (
              <ChevronUp size={16} color="#888" />
            ) : (
              <ChevronDown size={16} color="#888" />
            )}
          </div>
        </div>

        {expandido && (
          <div className="p-3 bg-white">
            <div className="mb-3">
              <Badge bg="success" className="me-2">
                🛡️ Reparación de Garantía
              </Badge>
            </div>

            {piezasActivas.length > 0 && (
              <div className="mb-3">
                <p className="fw-semibold mb-2 small text-success">
                  Piezas reparadas (cubiertas por garantía)
                </p>
                {piezasActivas.map((pieza) => (
                  <div
                    key={pieza.id_multiple}
                    className="d-flex justify-content-between align-items-center py-2 border-bottom small"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <span>{pieza.pieza?.nombre_pieza || `Pieza #${pieza.id_pieza}`}</span>
                    </div>
                    <Badge bg={getColorByEstadoReparacion(pieza.estado)}>
                      {getTextoEstadoReparacion(pieza.estado)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {estaRetirada ? (
              <div
                className="p-3 rounded-3 text-center"
                style={{
                  background: 'linear-gradient(135deg, #e2e3e5, #d3d3d3)',
                  border: '1.5px solid #adb5bd',
                }}
              >
                <LogOut size={28} className="text-secondary mb-2" />
                <p className="fw-bold text-secondary mb-0"> Garantía completada y retirada</p>
                <p className="text-secondary mb-0 small">
                  Este dispositivo fue reparado bajo garantía y ya fue retirado del local.
                </p>
              </div>
            ) : todasTerminadas ? (
              <div
                className="p-3 rounded-3 text-center"
                style={{
                  background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
                  border: '2px solid #3b82f6',
                }}
              >
                <CheckCircle size={28} className="text-primary mb-2" />
                <p className="fw-bold text-primary mb-0"> Reparación de garantía completada</p>
                <p className="text-primary mb-0 small">
                  Tu dispositivo está listo para retirar. Pasá por el local.
                </p>
              </div>
            ) : (
              <div
                className="p-3 rounded-3 text-center"
                style={{
                  background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe)',
                  border: '2px solid #6366f1',
                }}
              >
                <Wrench size={28} className="text-primary mb-2" />
                <p className="fw-bold text-primary mb-0">
                  🔧 Reparación en curso (cubierta por garantía)
                </p>
                <p className="text-primary mb-0 small">
                  El técnico está reparando tu dispositivo sin costo adicional.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Resto del código para reparaciones NO garantía
  const handleAprobarLocal = (idMultiple) =>
    setEstadosPiezas((prev) => ({ ...prev, [idMultiple]: 'APROBADO' }));

  const handleRechazarLocal = (idMultiple) =>
    setEstadosPiezas((prev) => ({ ...prev, [idMultiple]: 'RECHAZADO' }));

  const handleAprobarTodas = () => {
    const nuevoEstado = {};
    piezas.forEach((p) => {
      nuevoEstado[p.id_multiple] = 'APROBADO';
    });
    setEstadosPiezas(nuevoEstado);
  };

  const handleRechazarTodas = () => {
    const nuevoEstado = {};
    piezas.forEach((p) => {
      nuevoEstado[p.id_multiple] = 'RECHAZADO';
    });
    setEstadosPiezas(nuevoEstado);
  };

  const todasResueltas =
    piezas.length > 0 &&
    Object.values(estadosPiezas).every((e) => e === 'APROBADO' || e === 'RECHAZADO');

  const costoTotalReal = piezas.reduce((sum, pieza) => {
    const estadoActual = estadosPiezas[pieza.id_multiple];
    if (
      estadoActual === 'APROBADO' ||
      estadoActual === 'ESPERANDO_APROBACION' ||
      estadoActual === 'PENDIENTE'
    ) {
      return sum + parseFloat(pieza.precio_total || 0);
    }
    return sum;
  }, 0);

  const piezasAprobadas = piezas.filter((p) => estadosPiezas[p.id_multiple] === 'APROBADO').length;
  const piezasRechazadas = piezas.filter(
    (p) => estadosPiezas[p.id_multiple] === 'RECHAZADO'
  ).length;

  const handleConfirmar = async () => {
    setProcesando(true);
    try {
      for (const pieza of piezas) {
        const estado = estadosPiezas[pieza.id_multiple];
        if (estado === 'APROBADO' && pieza.estado === 'ESPERANDO_APROBACION') {
          await onAprobarPieza(pieza.id_multiple);
        } else if (estado === 'RECHAZADO' && pieza.estado === 'ESPERANDO_APROBACION') {
          await onRechazarPieza(pieza.id_multiple);
        }
      }
      if (onRecargar) onRecargar();
    } catch (err) {
      console.error('Error confirmando piezas:', err);
      alert('Error al guardar. Intentá de nuevo.');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="border rounded-3 mb-3 overflow-hidden" style={{ borderColor: '#ffc107' }}>
      <div
        onClick={() => setExpandido(!expandido)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          cursor: 'pointer',
          background: '#fff3cd',
        }}
      >
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Calendar size={16} style={{ color: '#ffc107' }} />
          <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
            {fechaMostrada ? formatearFechaLarga(fechaMostrada) : 'Sin fecha'}
          </span>
          <span
            style={{
              background: '#ffc107',
              color: '#000',
              fontSize: '0.7rem',
              padding: '2px 8px',
              borderRadius: '20px',
              fontWeight: 600,
            }}
          >
            Reparación directa
          </span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span style={{ fontSize: '0.78rem', color: '#888' }}>
            {piezas.length} pieza{piezas.length !== 1 ? 's' : ''}
          </span>
          {expandido ? (
            <ChevronUp size={16} color="#888" />
          ) : (
            <ChevronDown size={16} color="#888" />
          )}
        </div>
      </div>

      {expandido && (
        <div className="p-3 bg-white">
          <div className="mb-3">
            <Badge bg="warning" className="me-2">
              Pendiente de aprobación
            </Badge>
            <strong>Reparación directa #{reparacion.id_reparacion}</strong>
            {reparacion.comentario && (
              <p className="small text-muted mt-1 mb-0">{reparacion.comentario}</p>
            )}
          </div>

          <div className="d-flex align-items-center gap-2 mb-3">
            <strong>Costo total:</strong>{' '}
            <span className="fw-bold fs-5 text-success">
              <DollarSign size={16} style={{ display: 'inline' }} />
              {costoTotalReal.toFixed(2)}
            </span>
            {piezasRechazadas > 0 && (
              <Badge bg="info" className="ms-2">
                {piezasAprobadas} de {piezas.length} piezas seleccionadas
              </Badge>
            )}
          </div>

          <div className="mb-3">
            <div className="d-flex justify-content-between small text-muted mb-1">
              <span>
                {piezasAprobadas} aprobada{piezasAprobadas !== 1 ? 's' : ''}
              </span>
              <span>
                {piezasRechazadas} rechazada{piezasRechazadas !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="progress" style={{ height: '6px' }}>
              <div
                className="progress-bar bg-success"
                style={{ width: `${(piezasAprobadas / piezas.length) * 100}%` }}
              />
              <div
                className="progress-bar bg-danger"
                style={{ width: `${(piezasRechazadas / piezas.length) * 100}%` }}
              />
            </div>
          </div>

          {piezas.map((pieza) => {
            const estadoActual = estadosPiezas[pieza.id_multiple];
            const esPendiente =
              estadoActual === 'ESPERANDO_APROBACION' || estadoActual === 'PENDIENTE';
            const esAprobada = estadoActual === 'APROBADO';
            const esRechazada = estadoActual === 'RECHAZADO';
            const subtotal = parseFloat(pieza.precio_total || 0);

            return (
              <div
                key={pieza.id_multiple}
                className={`border rounded-2 p-3 mb-2 ${
                  esPendiente
                    ? 'bg-light'
                    : esAprobada
                      ? 'bg-success bg-opacity-10'
                      : 'bg-danger bg-opacity-10'
                }`}
              >
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center gap-2 flex-wrap">
                      <strong className="small">
                        {pieza.pieza?.nombre_pieza || `Pieza #${pieza.id_pieza}`}
                      </strong>
                      {esAprobada && (
                        <Badge bg="success">
                          <CheckCircle size={10} className="me-1" />
                          Aprobada
                        </Badge>
                      )}
                      {esRechazada && (
                        <Badge bg="danger">
                          <XCircle size={10} className="me-1" />
                          Rechazada
                        </Badge>
                      )}
                      {esPendiente && (
                        <Badge bg="warning" className="text-dark">
                          Pendiente
                        </Badge>
                      )}
                    </div>
                    {pieza.comentario_tecnico && (
                      <p className="small text-muted mb-0 mt-1">
                        <span className="fw-bold">Nota del técnico:</span>{' '}
                        {pieza.comentario_tecnico}
                      </p>
                    )}
                  </div>
                  <div className="text-end">
                    {esRechazada ? (
                      <>
                        <div className="text-decoration-line-through text-muted small">
                          ${subtotal.toFixed(2)}
                        </div>
                        <div className="text-danger small fw-bold">No incluido</div>
                      </>
                    ) : (
                      <div className="fw-bold text-success small">${subtotal.toFixed(2)}</div>
                    )}
                  </div>
                </div>

                {esPendiente && (
                  <div className="d-flex gap-2 mt-2 justify-content-end">
                    <Button
                      size="sm"
                      variant="outline-danger"
                      className="d-flex align-items-center gap-1"
                      onClick={() => handleRechazarLocal(pieza.id_multiple)}
                      disabled={procesando}
                    >
                      <XCircle size={14} /> Rechazar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline-success"
                      className="d-flex align-items-center gap-1"
                      onClick={() => handleAprobarLocal(pieza.id_multiple)}
                      disabled={procesando}
                    >
                      <CheckCircle size={14} /> Aprobar
                    </Button>
                  </div>
                )}
              </div>
            );
          })}

          {!todasResueltas && (
            <div className="mt-3 d-flex gap-2 justify-content-between align-items-center">
              <Button
                size="sm"
                variant="outline-danger"
                onClick={handleRechazarTodas}
                disabled={procesando}
              >
                <XCircle size={14} /> Rechazar todo
              </Button>
              <Button
                size="sm"
                variant="success"
                onClick={handleAprobarTodas}
                disabled={procesando}
              >
                <CheckCircle size={14} /> Aprobar todo (${costoTotalReal.toFixed(2)})
              </Button>
            </div>
          )}

          {todasResueltas && (
            <div className="mt-3 d-flex gap-2 justify-content-between align-items-center">
              <Button
                size="sm"
                variant="outline-danger"
                onClick={handleRechazarTodas}
                disabled={procesando}
              >
                <XCircle size={14} /> Rechazar todo
              </Button>
              <Button size="sm" variant="success" onClick={handleConfirmar} disabled={procesando}>
                {procesando ? (
                  <>
                    <Spinner size="sm" animation="border" /> Guardando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} /> Confirmar y aprobar (${costoTotalReal.toFixed(2)})
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================
// COMPONENTE PRINCIPAL: TimeLineDiagnostico
// ============================================
const TimeLineDiagnostico = ({ dispositivo, onAceptar, onRechazar }) => {
  const [ingresos, setIngresos] = useState([]);
  const [loadingIngresos, setLoadingIngresos] = useState(false);
  const [errorIngresos, setErrorIngresos] = useState(null);
  const [expandidos, setExpandidos] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [accionModal, setAccionModal] = useState(null);
  const [diagIdModal, setDiagIdModal] = useState(null);
  const [loadingAccion, setLoadingAccion] = useState(false);
  const [mensajeAccion, setMensajeAccion] = useState(null);
  const [reparacionesDirectas, setReparacionesDirectas] = useState([]);
  const [loadingDirectas, setLoadingDirectas] = useState(false);

  const [reparacionesEnProgreso, setReparacionesEnProgreso] = useState([]);
  const [reparacionesTerminadas, setReparacionesTerminadas] = useState([]);

  const [loadingEnProgreso, setLoadingEnProgreso] = useState(false);
  const [loadingTerminadas, setLoadingTerminadas] = useState(false);

  const [reparacionesCanceladas, setReparacionesCanceladas] = useState([]);
  const [loadingCanceladas, setLoadingCanceladas] = useState(false);

  useEffect(() => {
    if (dispositivo?.id_dispositivo) {
      cargarIngresos();
      cargarReparacionesDirectas();
      cargarReparacionesEnProgreso();
      cargarReparacionesTerminadas();
      cargarReparacionesCanceladas();
    }
  }, [dispositivo]);

  const cargarReparacionesEnProgreso = async () => {
    setLoadingEnProgreso(true);
    try {
      const response = await reparacionMultipleService.obtenerEnProgresoPorDispositivo(
        dispositivo.id_dispositivo
      );
      const data = response?.data || response || [];
      setReparacionesEnProgreso(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando en progreso:', err);
      setReparacionesEnProgreso([]);
    } finally {
      setLoadingEnProgreso(false);
    }
  };

  const cargarReparacionesTerminadas = async () => {
    setLoadingTerminadas(true);
    try {
      const response = await reparacionMultipleService.obtenerTerminadasPorDispositivo(
        dispositivo.id_dispositivo
      );
      console.log('hay algo o no', response);
      const data = response?.data || response || [];
      setReparacionesTerminadas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando terminadas:', err);
      setReparacionesTerminadas([]);
    } finally {
      setLoadingTerminadas(false);
    }
  };
  const cargarReparacionesCanceladas = async () => {
    setLoadingCanceladas(true);
    try {
      const response = await reparacionMultipleService.obtenerCanceladasPorDispositivo(
        dispositivo.id_dispositivo
      );
      console.log('canceladas', response);
      const data = response?.data || response || [];
      setReparacionesCanceladas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando canceladas:', err);
      setReparacionesCanceladas([]);
    } finally {
      setLoadingCanceladas(false);
    }
  };

  const cargarIngresos = async () => {
    setLoadingIngresos(true);
    setErrorIngresos(null);
    try {
      const diagnosticos = await diagnosticoService.obtenerPorDispositivoCliente(
        dispositivo.id_dispositivo
      );
      console.log('carga', diagnosticos);

      const ingresosMap = new Map();
      diagnosticos.forEach((diagnostico) => {
        const idIngreso = diagnostico.id_ingreso;
        if (!ingresosMap.has(idIngreso)) {
          ingresosMap.set(idIngreso, {
            id_ingreso: idIngreso,
            fecha_ingreso: diagnostico.ingreso?.fecha_ingreso || new Date().toISOString(),
            estado_ingreso: diagnostico.ingreso?.estado || 'PENDIENTE',
            diagnosticos: [],
          });
        }
        ingresosMap.get(idIngreso).diagnosticos.push(diagnostico);
      });

      const ingresosData = Array.from(ingresosMap.values());

      // ✅ PRIMERO: buscar ingresos ACTIVOS (NO retirados)
      const activos = ingresosData.filter((ingreso) => ingreso.estado_ingreso !== 'RETIRADO');

      if (activos.length > 0) {
        // Si hay activos, mostrar el más reciente
        const ingresoActual = activos.sort(
          (a, b) => new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso)
        )[0];
        setIngresos([ingresoActual]);
        if (!expandidos[ingresoActual.id_ingreso]) {
          setExpandidos({ [ingresoActual.id_ingreso]: true });
        }
      } else {
        // ✅ SEGUNDO: si NO hay activos, mostrar el ÚLTIMO retirado
        const retirados = ingresosData.filter((ingreso) => ingreso.estado_ingreso === 'RETIRADO');

        if (retirados.length > 0) {
          const ultimoRetirado = retirados.sort(
            (a, b) => new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso)
          )[0];
          setIngresos([ultimoRetirado]);
          if (!expandidos[ultimoRetirado.id_ingreso]) {
            setExpandidos({ [ultimoRetirado.id_ingreso]: true });
          }
          console.log('✅ Mostrando último ingreso retirado:', ultimoRetirado);
        } else {
          setIngresos([]);
        }
      }
    } catch (err) {
      console.error('Error al cargar diagnósticos:', err);
      setErrorIngresos('No se pudieron cargar los diagnósticos');
    } finally {
      setLoadingIngresos(false);
    }
  };

  const cargarReparacionesDirectas = async () => {
    setLoadingDirectas(true);
    try {
      const response = await reparacionMultipleService.obtenerPendientesPorDispositivo(
        dispositivo.id_dispositivo
      );
      const data = response?.data || response || [];
      const soloDirectas = Array.isArray(data)
        ? data.filter(
            (rep) =>
              rep.id_diagnostico === null || rep.es_garantia === true || rep.es_garantia === 1
          )
        : [];
      setReparacionesDirectas(soloDirectas);
    } catch (err) {
      console.error('Error cargando reparaciones directas:', err);
      setReparacionesDirectas([]);
    } finally {
      setLoadingDirectas(false);
    }
  };

  const recargarTodo = () => {
    cargarIngresos();
    cargarReparacionesDirectas();
    cargarReparacionesEnProgreso();
    cargarReparacionesTerminadas();
    cargarReparacionesCanceladas();
  };

  const handleAprobarPieza = async (idMultiple) => {
    try {
      await reparacionMultipleService.aprobarPieza(idMultiple);
    } catch (err) {
      console.error('Error aprobando pieza:', err);
      throw err;
    }
  };

  const handleRechazarPieza = async (idMultiple) => {
    try {
      await reparacionMultipleService.rechazarPieza(idMultiple);
    } catch (err) {
      console.error('Error rechazando pieza:', err);
      throw err;
    }
  };

  const handleAprobarPiezaDiagnostico = async (idDiagnosticoPieza) => {
    try {
      await diagnosticoService.aprobarPiezaDiagnostico(idDiagnosticoPieza);
    } catch (err) {
      console.error('Error aprobando pieza:', err);
      throw err;
    }
  };

  const handleRechazarPiezaDiagnostico = async (idDiagnosticoPieza) => {
    try {
      await diagnosticoService.rechazarPiezaDiagnostico(idDiagnosticoPieza);
    } catch (err) {
      console.error('Error rechazando pieza:', err);
      throw err;
    }
  };

  const toggleIngreso = (idIngreso) =>
    setExpandidos((prev) => ({ ...prev, [idIngreso]: !prev[idIngreso] }));

  const confirmarAccion = (idDiagnostico, accion) => {
    setDiagIdModal(idDiagnostico);
    setAccionModal(accion);
    setMensajeAccion(null);
    setShowModal(true);
  };

  const aprobarDirecto = async (idDiagnostico) => {
    try {
      await diagnosticoService.clienteAceptar(idDiagnostico);
      setMensajeAccion({ tipo: 'success', texto: '✅ Reparación aprobada correctamente' });
      if (onAceptar) onAceptar(idDiagnostico);
      await cargarIngresos();
      setTimeout(() => setMensajeAccion(null), 2000);
    } catch (err) {
      console.error('Error al aprobar:', err);
      if (err.response?.data?.code === 'DIAGNOSTICO_EXPIRADO') {
        setMensajeAccion({
          tipo: 'danger',
          texto: err.response?.data?.message || ' Este diagnóstico ya expiró.',
        });
      } else {
        setMensajeAccion({
          tipo: 'danger',
          texto: 'Error al procesar la acción. Intentá de nuevo.',
        });
      }
      throw err;
    }
  };

  const ejecutarAccion = async () => {
    setLoadingAccion(true);
    try {
      if (accionModal === 'aceptar') {
        await diagnosticoService.clienteAceptar(diagIdModal);
        setMensajeAccion({ tipo: 'success', texto: ' Reparación aprobada correctamente' });
        if (onAceptar) onAceptar(diagIdModal);
      } else {
        await diagnosticoService.clienteRechazar(diagIdModal);
        if (onRechazar) onRechazar(diagIdModal);
      }
      await cargarIngresos();
      setShowModal(false);
    } catch (err) {
      console.error('Error al ejecutar acción:', err);
      if (err.response?.data?.code === 'DIAGNOSTICO_EXPIRADO') {
        setMensajeAccion({
          tipo: 'danger',
          texto: err.response?.data?.message || ' Este diagnóstico ya expiró.',
        });
      } else {
        setMensajeAccion({
          tipo: 'danger',
          texto: 'Error al procesar la acción. Intentá de nuevo.',
        });
      }
      setShowModal(false);
    } finally {
      setLoadingAccion(false);
    }
  };

  if (!dispositivo) return null;

  const getNombreMarca = () => {
    if (dispositivo.marca)
      return typeof dispositivo.marca === 'object' ? dispositivo.marca.marca : dispositivo.marca;
    if (dispositivo.modelo?.marca)
      return typeof dispositivo.modelo.marca === 'object'
        ? dispositivo.modelo.marca.marca
        : dispositivo.modelo.marca;
    return 'Marca';
  };

  const getNombreModelo = () => {
    if (dispositivo.modelo)
      return typeof dispositivo.modelo === 'object'
        ? dispositivo.modelo.nombre_modelo
        : dispositivo.modelo;
    return 'Modelo';
  };

  const marca = getNombreMarca();
  const modelo = getNombreModelo();

  const esGarantia = (rep) => rep.es_garantia === true || rep.es_garantia === 1;

  // GARANTÍA UNIFICADA: tomar la más reciente (sin filtrar por retirado, porque el estado se muestra dentro)
  const todasLasGarantias = [
    ...reparacionesDirectas.filter(esGarantia).map((g) => ({ ...g, tipo: 'pendiente' })),
    ...reparacionesEnProgreso.filter(esGarantia).map((g) => ({ ...g, tipo: 'progreso' })),
    ...reparacionesTerminadas.filter(esGarantia).map((g) => ({ ...g, tipo: 'terminada' })),
  ];

  const garantiaUnica = todasLasGarantias.sort(
    (a, b) => new Date(b.fecha_ingreso || b.created_at) - new Date(a.fecha_ingreso || a.created_at)
  )[0];

  // Reparaciones directas NO garantía
  const directasNoGarantia = reparacionesDirectas.filter((rep) => !esGarantia(rep));
  const enProgresoNoGarantia = reparacionesEnProgreso.filter((rep) => !esGarantia(rep));
  const terminadasNoGarantia = reparacionesTerminadas.filter((rep) => !esGarantia(rep));

  const hayIngresoActivo = ingresos.length > 0;
  const hayGarantiaActiva = !!garantiaUnica;
  const hayContenido =
    hayIngresoActivo ||
    hayGarantiaActiva ||
    directasNoGarantia.length > 0 ||
    enProgresoNoGarantia.length > 0 ||
    terminadasNoGarantia.length > 0 ||
    reparacionesCanceladas.length > 0;

  return (
    <>
      <Card className="shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            {marca} {modelo}
          </h5>
          <small>ID: {dispositivo.id_dispositivo}</small>
        </Card.Header>

        <Card.Body>
          {mensajeAccion && (
            <Alert
              variant={mensajeAccion.tipo}
              dismissible
              onClose={() => setMensajeAccion(null)}
              className="py-2"
            >
              {mensajeAccion.texto}
            </Alert>
          )}

          <h6 className="mb-3">📋 Estado actual de tu dispositivo</h6>

          {loadingIngresos || loadingEnProgreso || loadingTerminadas || loadingDirectas ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" size="sm" />
              <p className="mt-2">Cargando información...</p>
            </div>
          ) : errorIngresos ? (
            <Alert variant="danger">{errorIngresos}</Alert>
          ) : !hayContenido ? (
            <div className="text-center py-4">
              <ClipboardList size={40} className="text-muted mb-2" />
              <p className="text-muted">No hay reparaciones activas para este dispositivo</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {/* ── INGRESO ACTUAL CON DIAGNÓSTICO ── */}
              {ingresos.map((ingreso) => {
                const estadoIngreso = ingreso.estado_ingreso;
                const badge =
                  estadoIngreso === 'RETIRADO'
                    ? { bg: '#6c757d', label: 'Retirado' }
                    : { bg: '#0d6efd', label: 'En taller' };
                const abierto = !!expandidos[ingreso.id_ingreso];
                const diags = ingreso.diagnosticos || [];
                const cantidad = diags.length;

                return (
                  <div
                    key={ingreso.id_ingreso}
                    style={{
                      border: '1.5px solid #0d6efd33',
                      borderRadius: '10px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      onClick={() => toggleIngreso(ingreso.id_ingreso)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        cursor: 'pointer',
                        background: '#f0f5ff',
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 flex-wrap">
                        <Calendar size={16} style={{ color: badge.bg }} />
                        <span className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                          {formatearFechaLarga(ingreso.fecha_ingreso)}
                        </span>
                        <span
                          style={{
                            background: badge.bg,
                            color: 'white',
                            fontSize: '0.7rem',
                            padding: '2px 8px',
                            borderRadius: '20px',
                            fontWeight: 600,
                          }}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ fontSize: '0.78rem', color: '#888' }}>
                          {cantidad} diagnóstico{cantidad !== 1 ? 's' : ''}
                        </span>
                        {abierto ? (
                          <ChevronUp size={16} color="#888" />
                        ) : (
                          <ChevronDown size={16} color="#888" />
                        )}
                      </div>
                    </div>

                    {abierto && (
                      <div style={{ padding: '12px 16px', background: 'white' }}>
                        {cantidad === 0 ? (
                          <p className="text-muted small text-center py-2 mb-0">
                            Sin diagnósticos en este ingreso
                          </p>
                        ) : (
                          <div className="d-flex flex-column gap-2">
                            {diags.map((diagnostico) => {
                              const enReparacion =
                                ESTADOS_REPARACION.includes(diagnostico.estado) &&
                                diagnostico.reparacion?.reparaciones_multiples?.length > 0;
                              console.log('🔍 [DEBUG] Datos del diagnóstico:', {
                                id_diagnostico: diagnostico.id_diagnostico,
                                estado_ingreso: diagnostico.ingreso?.estado,
                                es_garantia: diagnostico.reparacion?.es_garantia,
                                estado_pago: diagnostico.reparacion?.estado_pago,
                                tiene_piezas:
                                  diagnostico.reparacion?.reparaciones_multiples?.length || 0,
                                esta_retirado: diagnostico.ingreso?.estado === 'RETIRADO',
                              });
                              return (
                                <div
                                  key={diagnostico.id_diagnostico}
                                  className="border rounded-3 p-3 bg-white"
                                >
                                  {enReparacion ? (
                                    <VistaReparacion
                                      diagnostico={diagnostico}
                                      marca={marca}
                                      modelo={modelo}
                                      onPagado={recargarTodo}
                                      esGarantia={
                                        diagnostico.reparacion?.es_garantia === true ||
                                        diagnostico.reparacion?.es_garantia === 1
                                      }
                                      estaRetirado={diagnostico.ingreso?.estado === 'RETIRADO'}
                                    />
                                  ) : (
                                    <VistaDiagnostico
                                      diagnostico={diagnostico}
                                      onConfirmarAccion={confirmarAccion}
                                      onAprobarPieza={handleAprobarPiezaDiagnostico}
                                      onRechazarPieza={handleRechazarPiezaDiagnostico}
                                      onAprobarDirecto={aprobarDirecto}
                                      onSetMensaje={setMensajeAccion}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* ── GARANTÍA UNIFICADA (SOLO UNA, MUESTRA RETIRADO O LISTO) ── */}
              {garantiaUnica && (
                <ReparacionDirectaPendiente
                  key={garantiaUnica.id_reparacion}
                  reparacion={garantiaUnica}
                  fechaIngreso={garantiaUnica.fecha_ingreso}
                  onAprobarPieza={handleAprobarPieza}
                  onRechazarPieza={handleRechazarPieza}
                  onRecargar={recargarTodo}
                  esGarantia={true}
                />
              )}

              {/* ── REPARACIONES DIRECTAS (solo si NO hay ingreso activo NI garantía activa) ── */}
              {!hayIngresoActivo && !hayGarantiaActiva && (
                <>
                  {/* ── REPARACIONES DIRECTAS PENDIENTES ── */}
                  {directasNoGarantia.length > 0 && (
                    <div className="mt-2">
                      <h6 className="mb-3">🔧 Reparaciones directas pendientes</h6>
                      {directasNoGarantia.map((rep) => (
                        <ReparacionDirectaPendiente
                          key={rep.id_reparacion}
                          reparacion={rep}
                          fechaIngreso={rep.fecha_ingreso}
                          onAprobarPieza={handleAprobarPieza}
                          onRechazarPieza={handleRechazarPieza}
                          onRecargar={recargarTodo}
                          esGarantia={false}
                        />
                      ))}
                    </div>
                  )}

                  {/* ── REPARACIONES EN CURSO ── */}
                  {enProgresoNoGarantia.length > 0 && (
                    <div className="mt-2">
                      <h6 className="mb-3 text-primary">⚙️ Reparaciones en curso</h6>
                      {enProgresoNoGarantia.map((rep) => (
                        <div key={rep.id_reparacion} className="border rounded-3 p-3 mb-2 bg-light">
                          <div className="d-flex align-items-center gap-2 mb-2">
                            <Badge bg="primary">En curso</Badge>
                            <strong>Reparación directa #{rep.id_reparacion}</strong>
                            {rep.fecha_ingreso && (
                              <small className="text-muted ms-auto">
                                {formatearFechaLarga(rep.fecha_ingreso)}
                              </small>
                            )}
                          </div>
                          {rep.reparaciones_multiples
                            ?.filter(
                              (pieza) =>
                                pieza.estado !== 'RECHAZADO' && pieza.estado !== 'CANCELADO'
                            )
                            .map((pieza) => (
                              <div
                                key={pieza.id_multiple}
                                className="d-flex justify-content-between align-items-center py-1 border-bottom small"
                              >
                                <span>
                                  {pieza.pieza?.nombre_pieza || `Pieza #${pieza.id_pieza}`}
                                </span>
                                <div className="d-flex align-items-center gap-2">
                                  <span className="text-success fw-bold">
                                    ${parseFloat(pieza.precio_total || 0).toFixed(2)}
                                  </span>
                                  <Badge bg={getColorByEstadoReparacion(pieza.estado)}>
                                    {getTextoEstadoReparacion(pieza.estado)}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          {rep.reparaciones_multiples?.some(
                            (r) => r.estado === 'EN_REPARACION'
                          ) && (
                            <Alert variant="info" className="py-1 px-2 mt-2 small mb-0">
                              Tu dispositivo está siendo reparado.
                            </Alert>
                          )}
                          {rep.reparaciones_multiples?.some(
                            (r) => r.estado === 'ESPERANDO_PIEZA'
                          ) && (
                            <Alert variant="warning" className="py-1 px-2 mt-2 small mb-0">
                              Esperando pieza para continuar.
                            </Alert>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── REPARACIONES TERMINADAS (normal) ── */}
                  {terminadasNoGarantia.length > 0 && (
                    <div className="mt-2">
                      <h6 className="mb-3 text-success">✅ Reparaciones terminadas</h6>
                      {terminadasNoGarantia.map((rep) => {
                        const piezasActivas = (rep.reparaciones_multiples || []).filter(
                          (p) => p.estado !== 'RECHAZADO' && p.estado !== 'CANCELADO'
                        );
                        const totalActivo = piezasActivas.reduce(
                          (sum, p) => sum + parseFloat(p.precio_total || 0),
                          0
                        );
                        const yaEstaPagada =
                          rep.estado_pago === 'PAGADO' || rep.estado_pago === 'PAGADO_LOCAL';
                        const estaRetirado = rep.ingreso?.estado === 'RETIRADO';

                        // Si ya está retirado
                        if (estaRetirado) {
                          return (
                            <div key={rep.id_reparacion} className="border rounded-3 p-3 mb-2">
                              <div
                                className="rounded-3 overflow-hidden mb-3"
                                style={{ border: '1.5px solid #adb5bd' }}
                              >
                                <div className="px-3 py-2" style={{ background: '#6c757d' }}>
                                  <span
                                    className="text-white fw-semibold"
                                    style={{ fontSize: '0.85rem' }}
                                  >
                                    Resumen de piezas reparadas
                                  </span>
                                </div>
                                <div className="bg-white p-3">
                                  {piezasActivas.map((pieza, idx) => (
                                    <div
                                      key={pieza.id_multiple || idx}
                                      className={
                                        idx !== piezasActivas.length - 1
                                          ? 'border-bottom pb-2 mb-2'
                                          : ''
                                      }
                                    >
                                      <div className="d-flex justify-content-between align-items-center">
                                        <span className="fw-semibold small">
                                          {pieza.pieza?.nombre_pieza || `Pieza #${pieza.id_pieza}`}
                                        </span>
                                        <span className="text-muted fw-bold small">
                                          ${parseFloat(pieza.precio_total || 0).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  ))}
                                  <div className="d-flex justify-content-between align-items-center pt-2 mt-2 border-top">
                                    <span className="fw-bold" style={{ color: '#6c757d' }}>
                                      TOTAL PAGADO:
                                    </span>
                                    <span className="fw-bold fs-5" style={{ color: '#6c757d' }}>
                                      ${totalActivo.toFixed(2)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div
                                className="p-3 rounded-3 text-center"
                                style={{
                                  background: 'linear-gradient(135deg, #e2e3e5, #d3d3d3)',
                                  border: '1.5px solid #adb5bd',
                                }}
                              >
                                <CheckCircle size={32} className="text-secondary mb-2" />
                                <p className="fw-bold text-secondary mb-0">
                                  Dispositivo ya retirado
                                </p>
                                <p className="text-secondary mb-0 small">
                                  Este dispositivo fue retirado del local.
                                </p>
                              </div>
                            </div>
                          );
                        }

                        // Reparación normal (pagada o pendiente)
                        return (
                          <div key={rep.id_reparacion} className="opciones-pago-container">
                            <BannerPago
                              items={piezasActivas}
                              total={totalActivo}
                              yaPago={yaEstaPagada}
                              descripcion={`Reparación directa #${rep.id_reparacion} - ${marca} ${modelo}`}
                              idReferencia={rep.id_reparacion}
                              idReparacion={rep.id_reparacion}
                              onPagado={recargarTodo}
                              marca={marca}
                              modelo={modelo}
                            />
                            {!yaEstaPagada && (
                              <div className="retiro-local-card mb-3">
                                <div className="retiro-local-header">
                                  <h6 className="mb-0 text-center">
                                    {' '}
                                    También podés pagar y retirar en nuestro local
                                  </h6>
                                  <div className="text-center py-1">
                                    <small className="text-muted">
                                      Lunes a Viernes: 9:00 - 18:00 | Sábados: 9:00 - 13:00
                                    </small>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── REPARACIONES CANCELADAS (sección independiente) ── */}
                  {reparacionesCanceladas.length > 0 && (
                    <div className="mt-2">
                      <h6 className="mb-3 text-warning"> Reparaciones canceladas</h6>
                      {reparacionesCanceladas.map((rep) => {
                        const piezasActivas = (rep.reparaciones_multiples || []).filter(
                          (p) => p.estado !== 'RECHAZADO' && p.estado !== 'CANCELADO'
                        );
                        const totalActivo = piezasActivas.reduce(
                          (sum, p) => sum + parseFloat(p.precio_total || 0),
                          0
                        );
                        const estaRetirado = rep.ingreso?.estado === 'RETIRADO';

                        return (
                          <div
                            key={rep.id_reparacion}
                            className="border rounded-3 p-3 mb-2 bg-light"
                          >
                            <div className="d-flex align-items-center gap-2 mb-3">
                              <Badge bg="warning"> REPARACIÓN CANCELADA</Badge>
                              <small className="text-muted">Reparación #{rep.id_reparacion}</small>
                            </div>

                            {piezasActivas.length > 0 && (
                              <div className="mb-3">
                                <p className="fw-semibold mb-2 small text-muted">
                                  Piezas canceladas:
                                </p>
                                {piezasActivas.map((pieza) => (
                                  <div
                                    key={pieza.id_multiple}
                                    className="d-flex justify-content-between align-items-center py-1 border-bottom small"
                                  >
                                    <span>
                                      {pieza.pieza?.nombre_pieza || `Pieza #${pieza.id_pieza}`}
                                    </span>
                                    <span className="text-muted">
                                      ${parseFloat(pieza.precio_total || 0).toFixed(2)}
                                    </span>
                                  </div>
                                ))}
                                <div className="d-flex justify-content-between align-items-center pt-2 mt-2 border-top">
                                  <span className="fw-bold text-muted">TOTAL CANCELADO:</span>
                                  <span className="fw-bold text-muted">
                                    ${totalActivo.toFixed(2)}
                                  </span>
                                </div>
                              </div>
                            )}

                            {estaRetirado ? (
                              <div
                                className="p-3 rounded-3 text-center"
                                style={{
                                  background: 'linear-gradient(135deg, #e2e3e5, #d3d3d3)',
                                  border: '1.5px solid #adb5bd',
                                }}
                              >
                                <CheckCircle size={28} className="text-secondary mb-2" />
                                <p className="fw-bold text-secondary mb-0">
                                  Reparación cancelada y retirada
                                </p>
                                <p className="text-secondary mb-0 small">
                                  Este dispositivo ya fue retirado del local.
                                </p>
                              </div>
                            ) : (
                              <>
                                <Alert variant="warning" className="mb-3">
                                  <i className="fas fa-times-circle"></i> Cancelaste todas las
                                  piezas de esta reparación.
                                  <br />
                                  <small>Puedes retirar tu dispositivo sin costo adicional.</small>
                                </Alert>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => !loadingAccion && setShowModal(false)} centered>
        <Modal.Header closeButton={!loadingAccion} className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2">
            {accionModal === 'aceptar' ? (
              <>
                <CheckCircle size={20} className="text-success" /> Confirmar aprobación
              </>
            ) : (
              <>
                <XCircle size={20} className="text-danger" /> Confirmar rechazo
              </>
            )}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {accionModal === 'aceptar' ? (
            <p>
              ¿Estás seguro que querés <strong>aprobar</strong> esta reparación? El técnico
              comenzará a trabajar en tu dispositivo.
            </p>
          ) : (
            <p>
              ¿Estás seguro que querés <strong>rechazar</strong> este diagnóstico? Tu dispositivo
              será devuelto sin reparar.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowModal(false)}
            disabled={loadingAccion}
          >
            Cancelar
          </Button>
          <Button
            variant={accionModal === 'aceptar' ? 'success' : 'danger'}
            size="sm"
            onClick={ejecutarAccion}
            disabled={loadingAccion}
            className="d-flex align-items-center gap-1"
          >
            {loadingAccion ? (
              <>
                <Spinner size="sm" animation="border" /> Procesando...
              </>
            ) : accionModal === 'aceptar' ? (
              <>
                <CheckCircle size={14} /> Sí, aprobar
              </>
            ) : (
              <>
                <XCircle size={14} /> Sí, rechazar
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TimeLineDiagnostico;
