// src/components/Recepcion/ListaIngresos.jsx
import React, { useState } from 'react';
import { Spinner, Modal, Alert } from 'react-bootstrap';
import { ingresoService } from '../../services/IngresoService';
import { clienteService } from '../../services/clienteService';
import './ListaIngresos.css';

const ListaIngresos = ({ onRetiroCompleto }) => {
  const [paso, setPaso] = useState('buscar');
  const [busqueda, setBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [cliente, setCliente] = useState(null);
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null);
  const [retirando, setRetirando] = useState(false);

  const [showResumenModal, setShowResumenModal] = useState(false);
  const [resumenData, setResumenData] = useState(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);

  const buscarCliente = async () => {
    if (!busqueda.trim()) {
      setError('Ingresá un correo o número de celular');
      return;
    }

    setBuscando(true);
    setError(null);
    setCliente(null);

    try {
      const result = await clienteService.buscarClienteConDispositivos(busqueda);

      if (result.success && result.data) {
        setCliente(result.data);
        if (result.data && result.data.id_cliente) {
          await cargarDispositivosCliente(result.data.id_cliente);
          setPaso('lista');
        } else {
          setError('Cliente no tiene ID válido');
        }
      } else {
        setError(result.message || 'Cliente no encontrado');
      }
    } catch (err) {
      console.error(err);
      setError('Error al buscar el cliente');
    } finally {
      setBuscando(false);
    }
  };

  const cargarDispositivosCliente = async (idCliente) => {
    if (!idCliente) {
      setError('ID de cliente no válido');
      return;
    }

    setLoading(true);
    try {
      const response = await ingresoService.obtenerPorCliente(idCliente);

      let todosIngresos = [];
      if (response?.success && response?.data) {
        todosIngresos = response.data;
      } else if (Array.isArray(response)) {
        todosIngresos = response;
      } else if (response?.data && Array.isArray(response.data)) {
        todosIngresos = response.data;
      }

      // ✅ Mostrar ingresos NO retirados + los que tienen diagnóstico rechazado + reparaciones canceladas
      const activos = todosIngresos.filter((i) => {
        // Si está retirado, mostrarlo solo si tiene diagnóstico rechazado o reparación cancelada
        if (i.estado === 'RETIRADO') {
          const tieneDiagnosticoRechazado = i.diagnosticos?.some((d) => d.estado === 'RECHAZADO');
          const tieneReparacionCancelada = i.reparacion?.estado_general === 'CANCELADO';
          return tieneDiagnosticoRechazado || tieneReparacionCancelada;
        }
        return true; // No retirado, mostrarlo siempre
      });

      // ✅ Consultamos el resumen de cada ingreso activo en paralelo
      const resumenes = await Promise.all(
        activos.map((ingreso) =>
          ingresoService.obtenerResumenReparaciones(ingreso.id_ingreso).catch(() => null)
        )
      );

      const dispositivosConEstado = activos.map((ingreso, index) => {
        const resumen = resumenes[index];

        console.log(resumen);
        const tieneDiagnostico = ingreso.diagnosticos && ingreso.diagnosticos.length > 0;
        const diagnostico = ingreso.diagnosticos?.[0];
        const reparacionDirecta = ingreso.reparacion;
        const retirado = ingreso.estado === 'RETIRADO';
        let yaPagado = false;
        let estadoPago = 'PENDIENTE';
        let listoParaRetirar = false;
        let estadoTexto = '';
        let estadoColor = '';

        // ✅ Verificar si el diagnóstico está RECHAZADO
        const diagnosticoRechazado = tieneDiagnostico && diagnostico?.estado === 'RECHAZADO';
        // ✅ Verificar si la reparación está CANCELADA
        const reparacionCancelada = reparacionDirecta?.estado_general === 'CANCELADO';

        // 👉 yaPagado desde el resumen
        if (resumen?.ya_pagado !== undefined) {
          yaPagado = resumen.ya_pagado;
          estadoPago = resumen.estado_pago_general || 'PENDIENTE';
        } else if (reparacionDirecta) {
          estadoPago = reparacionDirecta.estado_pago || 'PENDIENTE';
          yaPagado = ['PAGADO', 'PAGADO_LOCAL'].includes(estadoPago);
        } else if (diagnostico?.reparacion) {
          estadoPago = diagnostico.reparacion.estado_pago || 'PENDIENTE';
          yaPagado = ['PAGADO', 'PAGADO_LOCAL'].includes(estadoPago);
        }

        // 👉 listoParaRetirar: PRIORIDAD 1 - Diagnóstico RECHAZADO
        if (diagnosticoRechazado) {
          listoParaRetirar = true;
          estadoTexto = ' DIAGNÓSTICO RECHAZADO - RETIRAR';
          estadoColor = '#f59e0b';
        }
        // 👉 PRIORIDAD 2 - Reparación CANCELADA
        else if (reparacionCancelada) {
          listoParaRetirar = true;
          estadoTexto = ' REPARACIÓN CANCELADA - RETIRAR';
          estadoColor = '#f59e0b';
        }
        // 👉 listoParaRetirar: Usar el resumen para reparaciones directas
        else if (resumen?.listo_para_retirar !== undefined && !tieneDiagnostico) {
          listoParaRetirar = resumen.listo_para_retirar;
          estadoTexto = listoParaRetirar ? ' LISTO PARA RETIRAR' : ' En proceso';
          estadoColor = listoParaRetirar ? '#10b981' : '#64748b';
        }
        // 👉 Diagnóstico LISTO_PARA_RETIRAR
        else if (tieneDiagnostico && diagnostico?.estado === 'LISTO_PARA_RETIRAR') {
          listoParaRetirar = true;
          estadoTexto = ' LISTO PARA RETIRAR';
          estadoColor = '#10b981';
        }
        // 👉 Reparación directa terminada
        else if (reparacionDirecta?.estado_general === 'TERMINADO') {
          listoParaRetirar = true;
          estadoTexto = ' TERMINADO - LISTO PARA RETIRAR';
          estadoColor = '#10b981';
        }
        // 👉 En reparación (con diagnóstico)
        else if (tieneDiagnostico && diagnostico?.estado === 'EN_REPARACION') {
          estadoTexto = ' En reparación';
          estadoColor = '#6366f1';
        }
        // 👉 En reparación (directa)
        else if (reparacionDirecta?.estado_general === 'EN_REPARACION') {
          estadoTexto = ' En reparación';
          estadoColor = '#6366f1';
        }
        // 👉 Otros casos
        else {
          estadoTexto = ' En proceso';
          estadoColor = '#64748b';
        }

        return {
          id_ingreso: ingreso.id_ingreso,
          id_dispositivo: ingreso.dispositivo?.id_dispositivo,
          nombre:
            `${ingreso.dispositivo?.modelo?.marca?.marca || ''} ${ingreso.dispositivo?.modelo?.nombre_modelo || ''}`.trim(),
          imei: ingreso.dispositivo?.imei || ingreso.dispositivo?.codigo_interno || 'Sin código',
          fecha_ingreso: ingreso.fecha_ingreso,
          listoParaRetirar,
          estadoTexto,
          estadoColor,
          yaPagado,
          estadoPago,
          retirado,
          esGarantia: resumen?.es_garantia === true || resumen?.es_garantia === 1,
          diagnosticoRechazado,
          reparacionCancelada,
        };
      });

      const ordenados = dispositivosConEstado.sort((a, b) => {
        if (a.listoParaRetirar && !b.listoParaRetirar) return -1;
        if (!a.listoParaRetirar && b.listoParaRetirar) return 1;
        return 0;
      });

      setDispositivos(ordenados);

      if (ordenados.length === 0) {
        setError('Este cliente no tiene dispositivos en el taller actualmente');
      }
    } catch (err) {
      console.error(err);
      setError('Error al cargar los dispositivos del cliente');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fix: sincroniza yaPagado en la lista con lo que devuelve el resumen
  const verResumen = async (
    idIngreso,
    diagnosticoRechazado = false,
    reparacionCancelada = false
  ) => {
    setCargandoResumen(true);
    setShowResumenModal(true);

    try {
      const response = await ingresoService.obtenerResumenReparaciones(idIngreso);
      console.log('resumen response:', response);

      // ✅ CASO 1: Diagnóstico rechazado
      if (diagnosticoRechazado) {
        const dispositivo = dispositivos.find((d) => d.id_ingreso === idIngreso);
        const resumenPersonalizado = {
          tiene_reparaciones: false,
          diagnostico_rechazado: true,
          id_ingreso: idIngreso,
          dispositivo_nombre: dispositivo?.nombre || 'Dispositivo',
          imei: dispositivo?.imei || 'No registrado',
          mensaje:
            'Diagnóstico rechazado por el cliente. El dispositivo puede ser retirado sin costo.',
        };
        setResumenData(resumenPersonalizado);
        return;
      }

      // ✅ CASO 2: Reparación CANCELADA
      if (reparacionCancelada || response.estado_reparacion === 'CANCELADO') {
        const dispositivo = dispositivos.find((d) => d.id_ingreso === idIngreso);
        const resumenPersonalizado = {
          ...response,
          reparacion_cancelada: true,
          id_ingreso: idIngreso,
          dispositivo_nombre: dispositivo?.nombre || response.dispositivo_nombre || 'Dispositivo',
          imei: dispositivo?.imei || response.imei || 'No registrado',
          mensaje:
            'El cliente canceló todas las piezas. El dispositivo puede ser retirado sin costo.',
        };
        setResumenData(resumenPersonalizado);
        return;
      }

      // ✅ CASO 3: Respuesta normal
      const dataConId = {
        ...response,
        id_ingreso: idIngreso,
        diagnostico_rechazado: false,
        reparacion_cancelada: false,
      };
      setResumenData(dataConId);
    } catch (error) {
      console.error('❌ Error en verResumen:', error);
      alert(error.response?.data?.message || 'Error al cargar el resumen');
      setShowResumenModal(false);
    } finally {
      setCargandoResumen(false);
    }
  };

  const handlePagarLocal = async () => {
    if (!resumenData) return;

    setProcesandoPago(true);
    try {
      const response = await ingresoService.pagarLocalYRetirar(resumenData.id_ingreso);

      if (response?.success || response?.data?.success) {
        alert('✅ Pago registrado y dispositivo marcado como retirado');
        setShowResumenModal(false);
        setShowModal(false);
        if (cliente && cliente.id_cliente) {
          await cargarDispositivosCliente(cliente.id_cliente);
        }
        if (onRetiroCompleto) onRetiroCompleto();
      } else {
        alert(response?.message || response?.data?.message || 'Error al procesar el pago');
      }
    } catch (error) {
      console.error('Error completo:', error);
      alert(error.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setProcesandoPago(false);
    }
  };

  const handleMarcarRetirado = async () => {
    if (!ingresoSeleccionado) return;

    setRetirando(true);
    try {
      await ingresoService.marcarComoRetirado(ingresoSeleccionado.id_ingreso);
      alert('✅ Dispositivo marcado como retirado');
      setShowModal(false);

      if (cliente && cliente.id_cliente) {
        await cargarDispositivosCliente(cliente.id_cliente);
      }

      if (dispositivos.length === 1) {
        resetear();
      }
    } catch (err) {
      console.error(err);
      alert('❌ Error al marcar como retirado');
    } finally {
      setRetirando(false);
    }
  };

  const retirarDesdeModal = async () => {
    if (!resumenData) return;

    setProcesandoPago(true);
    try {
      await ingresoService.marcarComoRetirado(resumenData.id_ingreso);
      alert('✅ Dispositivo marcado como retirado');
      setShowResumenModal(false);

      if (cliente && cliente.id_cliente) {
        await cargarDispositivosCliente(cliente.id_cliente);
      }
      if (onRetiroCompleto) onRetiroCompleto();
    } catch (err) {
      console.error(err);
      alert('❌ Error al marcar como retirado');
    } finally {
      setProcesandoPago(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') buscarCliente();
  };

  const resetear = () => {
    setPaso('buscar');
    setBusqueda('');
    setCliente(null);
    setDispositivos([]);
    setError(null);
    if (onRetiroCompleto) onRetiroCompleto();
  };

  if (paso === 'buscar') {
    return (
      <div className="retiro-buscar-wrap">
        <div className="retiro-buscar-card">
          <div className="retiro-buscar-icon">
            <i className="fas fa-user-check"></i>
          </div>
          <h2 className="retiro-buscar-titulo">Buscar cliente para retirar</h2>
          <p className="retiro-buscar-sub">
            Ingresá el correo electrónico o número de celular del cliente
          </p>

          <div className="retiro-buscar-input-group">
            <input
              className="retiro-buscar-input"
              type="text"
              placeholder="correo@ejemplo.com o +54 11 1234-5678"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <button className="retiro-buscar-btn" onClick={buscarCliente} disabled={buscando}>
              {buscando ? (
                <Spinner animation="border" size="sm" />
              ) : (
                <>
                  <i className="fas fa-search"></i> Buscar
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="retiro-error">
              <i className="fas fa-exclamation-circle"></i>
              {error}
            </div>
          )}

          <button className="retiro-volver-btn" onClick={resetear}>
            <i className="fas fa-arrow-left"></i> Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="retiro-lista-container">
      <div className="retiro-cliente-header">
        <div className="retiro-cliente-avatar">
          {(cliente?.nombre?.[0] || '').toUpperCase()}
          {(cliente?.apellido?.[0] || '').toUpperCase()}
        </div>
        <div className="retiro-cliente-info">
          <h3>
            {cliente?.nombre} {cliente?.apellido}
          </h3>
          <p>
            <i className="fas fa-envelope"></i> {cliente?.correo}
            <i className="fas fa-phone-alt" style={{ marginLeft: 16 }}></i>{' '}
            {cliente?.numero_celular}
          </p>
        </div>
        <button className="retiro-cambiar-cliente" onClick={resetear}>
          <i className="fas fa-exchange-alt"></i> Cambiar cliente
        </button>
      </div>

      <div className="retiro-dispositivos-section">
        <h4>Dispositivos en taller {dispositivos.length}</h4>

        {loading ? (
          <div className="retiro-loading">
            <Spinner animation="border" size="sm" />
            <span>Cargando dispositivos...</span>
          </div>
        ) : dispositivos.length === 0 ? (
          <div className="retiro-vacio">
            <i className="fas fa-check-circle"></i>
            <p>No hay dispositivos pendientes de retiro para este cliente</p>
            <button className="retiro-btn-nuevo" onClick={resetear}>
              Buscar otro cliente
            </button>
          </div>
        ) : (
          <div className="retiro-cards-grid">
            {dispositivos.map((disp) => (
              <div
                key={disp.id_ingreso}
                className={`retiro-dispositivo-card ${disp.listoParaRetirar ? 'listo' : ''}`}
              >
                <div className="retiro-card-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <div className="retiro-card-info">
                  <div className="retiro-card-modelo">{disp.nombre}</div>
                  <div className="retiro-card-imei">{disp.imei}</div>
                  <div className="retiro-card-fecha">
                    Ingreso: {formatearFecha(disp.fecha_ingreso)}
                  </div>
                  <div className="retiro-card-estado">
                    {disp.retirado ? (
                      <span className="retiro-badge-retirado">
                        <i className="fas fa-check-double"></i> Retirado
                      </span>
                    ) : (
                      <>
                        <span
                          className={`retiro-badge ${disp.listoParaRetirar ? 'listo' : 'taller'}`}
                        >
                          {disp.listoParaRetirar ? (
                            <i className="fas fa-check-circle"></i>
                          ) : (
                            <i className="fas fa-tools"></i>
                          )}
                          {disp.estadoTexto}
                        </span>

                        {disp.listoParaRetirar && (
                          <span
                            className={`retiro-badge-pago ${disp.yaPagado || disp.esGarantia ? 'pagado' : 'pendiente'}`}
                          >
                            {disp.esGarantia ? (
                              <>
                                <i className="fas fa-shield-alt"></i> Cubierto por garantía
                              </>
                            ) : disp.yaPagado ? (
                              <>
                                <i className="fas fa-check-circle"></i> Pagado
                              </>
                            ) : (
                              <>
                                <i className="fas fa-clock"></i> Pago pendiente
                              </>
                            )}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div className="retiro-card-buttons">
                  <button
                    className="retiro-card-btn-ver"
                    onClick={() =>
                      verResumen(
                        disp.id_ingreso,
                        disp.diagnosticoRechazado,
                        disp.reparacionCancelada
                      )
                    }
                  >
                    <i className="fas fa-eye"></i> Ver
                  </button>

                  <button
                    className="retiro-card-btn"
                    disabled={disp.retirado}
                    style={disp.retirado ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                    onClick={async () => {
                      if (disp.retirado) {
                        alert('Este dispositivo ya fue retirado');
                        return;
                      }
                      if (!disp.listoParaRetirar) {
                        alert('Este dispositivo aún no está listo para retirar');
                        return;
                      }
                      if (!disp.yaPagado && !disp.esGarantia) {
                        const verResumenPrimero = window.confirm(
                          'Este dispositivo no tiene registrado el pago.\n\n¿Quieres ver el resumen para pagar?'
                        );
                        if (verResumenPrimero) {
                          await verResumen(
                            disp.id_ingreso,
                            disp.diagnosticoRechazado,
                            disp.reparacionCancelada
                          );
                        }
                        return;
                      }
                      setIngresoSeleccionado(disp);
                      setShowModal(true);
                    }}
                  >
                    <i className="fas fa-sign-out-alt"></i> Retirar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal confirmación retiro */}
      <Modal show={showModal} size="sm" onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar retiro</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            ¿Estás seguro que deseas marcar este dispositivo como <strong>RETIRADO</strong>?
          </p>
          <div className="modal-disp-info">
            <strong>{ingresoSeleccionado?.nombre}</strong>
            <small>IMEI: {ingresoSeleccionado?.imei}</small>
          </div>
          {ingresoSeleccionado?.listoParaRetirar && (
            <div className="retiro-modal-alerta">
              <i className="fas fa-check-circle"></i> Este dispositivo está listo para retirar
            </div>
          )}
          <p className="text-muted mt-2">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-cancelar" onClick={() => setShowModal(false)} disabled={retirando}>
            Cancelar
          </button>
          <button className="btn-confirmar" onClick={handleMarcarRetirado} disabled={retirando}>
            {retirando ? <Spinner animation="border" size="sm" /> : ' Confirmar retiro'}
          </button>
        </Modal.Footer>
      </Modal>

      {/* Modal resumen reparaciones */}
      <Modal show={showResumenModal} onHide={() => setShowResumenModal(false)} size="md" centered>
        <Modal.Header closeButton>
          <Modal.Title>Resumen de Reparaciones</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cargandoResumen ? (
            <div className="text-center p-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Cargando resumen...</p>
            </div>
          ) : resumenData ? (
            <div>
              <div className="resumen-dispositivo-info">
                <h5>{resumenData.dispositivo_nombre || 'Dispositivo'}</h5>
                <p className="text-muted">IMEI: {resumenData.imei || 'No registrado'}</p>
                <p className="text-muted">
                  Tipo:{' '}
                  {resumenData.tiene_diagnostico ? '📋 Con diagnóstico' : ' Reparación directa'}
                </p>
                <p>
                  Estado reparación:
                  <strong
                    className={`ms-2 text-${resumenData.estado_reparacion === 'TERMINADO' ? 'success' : 'warning'}`}
                  >
                    {resumenData.estado_reparacion}
                  </strong>
                </p>
              </div>

              <hr />

              <h6>Piezas reparadas:</h6>
              <div className="resumen-piezas-lista">
                {resumenData.piezas?.map((pieza) => (
                  <div key={pieza.id_multiple} className="resumen-pieza-item">
                    <div className="pieza-info">
                      <strong>{pieza.nombre_pieza}</strong>
                      <span className={`pieza-estado estado-${pieza.estado_pieza?.toLowerCase()}`}>
                        {pieza.estado_pieza}
                      </span>
                    </div>
                    <div className="pieza-precios">
                      <span>Pieza: ${pieza.precio_pieza_momento}</span>
                      <span>Mano obra: {pieza.mano_obra_momento}%</span>
                      <strong>Total: ${pieza.precio_total}</strong>
                    </div>
                    {pieza.comentario_tecnico && (
                      <div className="pieza-comentario">
                        <small>Comentario: {pieza.comentario_tecnico}</small>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <hr />

              {!resumenData.es_garantia &&
                !resumenData.diagnostico_rechazado &&
                !resumenData.reparacion_cancelada && (
                  <div className="resumen-total">
                    <h4>Total a pagar: ${resumenData.costo_total}</h4>
                    <div
                      className={`estado-pago ${resumenData.ya_pagado ? 'pagado' : 'pendiente'}`}
                    >
                      Estado pago: {resumenData.ya_pagado ? ' Pagado' : ' Pendiente'}
                      {resumenData.estado_pago_general === 'PAGADO_LOCAL' && ' (en local)'}
                      {resumenData.estado_pago_general === 'PAGADO' && ' (MercadoPago)'}
                    </div>
                  </div>
                )}

              {resumenData.es_garantia &&
                !resumenData.diagnostico_rechazado &&
                !resumenData.reparacion_cancelada && (
                  <div className="resumen-total">
                    <div className="estado-pago pagado">
                      🛡️ Cubierto por garantía — sin costo para el cliente
                    </div>
                  </div>
                )}

              {/* ✅ Diagnóstico RECHAZADO */}
              {resumenData.diagnostico_rechazado && (
                <>
                  <Alert variant="warning" className="mt-3">
                    <i className="fas fa-times-circle"></i>{' '}
                    {resumenData.mensaje || 'Diagnóstico rechazado por el cliente.'}
                    <br />
                    <small>El dispositivo puede ser retirado sin costo.</small>
                  </Alert>
                  <div className="mt-3">
                    <button
                      className="btn-retirar-rechazado w-100"
                      onClick={retirarDesdeModal}
                      style={{
                        padding: '10px',
                        background: '#f59e0b',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      <i className="fas fa-sign-out-alt"></i> Retirar dispositivo (sin costo)
                    </button>
                  </div>
                </>
              )}

              {/* ✅ Reparación CANCELADA */}
              {resumenData.reparacion_cancelada && (
                <>
                  <Alert variant="warning" className="mt-3">
                    <i className="fas fa-times-circle"></i>{' '}
                    {resumenData.mensaje || 'El cliente canceló todas las piezas.'}
                    <br />
                    <small>El dispositivo puede ser retirado sin costo.</small>
                  </Alert>
                  <div className="mt-3">
                    <button
                      className="btn-retirar-cancelado w-100"
                      onClick={retirarDesdeModal}
                      style={{
                        padding: '10px',
                        background: '#f59e0b',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                      }}
                    >
                      <i className="fas fa-sign-out-alt"></i> Retirar dispositivo (reparación
                      cancelada)
                    </button>
                  </div>
                </>
              )}

              {!resumenData.ya_pagado &&
                resumenData.listo_para_retirar &&
                !resumenData.es_garantia &&
                !resumenData.diagnostico_rechazado &&
                !resumenData.reparacion_cancelada && (
                  <div className="resumen-pago-local mt-3">
                    <Alert variant="success">
                      <p>El dispositivo está listo para retirar.</p>
                      <button
                        className="btn-pagar-local"
                        onClick={handlePagarLocal}
                        disabled={procesandoPago}
                      >
                        {procesandoPago ? (
                          <Spinner animation="border" size="sm" />
                        ) : (
                          'Pagar en local y retirar'
                        )}
                      </button>
                    </Alert>
                  </div>
                )}

              {resumenData.es_garantia &&
                resumenData.listo_para_retirar &&
                !resumenData.diagnostico_rechazado &&
                !resumenData.reparacion_cancelada && (
                  <>
                    <Alert variant="success" className="mt-3">
                      <i className="fas fa-shield-alt"></i> Reparación cubierta por garantía. Sin
                      costo adicional.
                    </Alert>
                    <div className="mt-3">
                      <button
                        className="btn-retirar-garantia w-100"
                        onClick={retirarDesdeModal}
                        style={{
                          padding: '10px',
                          background: '#10b981',
                          border: 'none',
                          borderRadius: '8px',
                          color: 'white',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                        }}
                      >
                        <i className="fas fa-sign-out-alt"></i> Retirar dispositivo (garantía)
                      </button>
                    </div>
                  </>
                )}

              {resumenData.ya_pagado &&
                !resumenData.diagnostico_rechazado &&
                !resumenData.reparacion_cancelada && (
                  <Alert variant="info" className="mt-3">
                    <i className="fas fa-check-circle"></i> Este dispositivo ya fue pagado.
                  </Alert>
                )}

              {!resumenData.ya_pagado &&
                !resumenData.listo_para_retirar &&
                !resumenData.diagnostico_rechazado &&
                !resumenData.reparacion_cancelada && (
                  <Alert variant="warning" className="mt-3">
                    <i className="fas fa-clock"></i> Este dispositivo aún no está listo para
                    retirar.
                  </Alert>
                )}
            </div>
          ) : (
            <p>No se encontraron reparaciones</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn-cerrar" onClick={() => setShowResumenModal(false)}>
            Cerrar
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ListaIngresos;
