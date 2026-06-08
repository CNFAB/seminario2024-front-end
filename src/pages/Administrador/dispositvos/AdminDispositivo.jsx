import React, { useEffect, useState, useMemo } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { dispositivoService } from '../../../services/DispositivoService';
import { ingresoService } from '../../../services/IngresoService';
import ModalHistorialDispositivo from './ModalHistorialDispositivo';
import './AdminDispositivo.css';

const AdminDispositivo = () => {
  const [dispositivos, setDispositivos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [modalDispositivo, setModalDispositivo] = useState(null);

  // ✅ Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(15);

  // ── Helper para calcular días en taller ────────────────────────────────────
  const calcularDiasEnTaller = (fechaIngreso) => {
    if (!fechaIngreso) return null;
    const ingreso = new Date(fechaIngreso);
    const hoy = new Date();
    const diffTime = Math.abs(hoy - ingreso);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDiasTexto = (dias) => {
    if (dias === null) return null;
    if (dias === 0) return 'Hoy';
    if (dias === 1) return '1 día';
    return `${dias} días`;
  };

  const getDiasColor = (dias) => {
    if (dias === null) return '#94a3b8';
    if (dias <= 3) return '#10b981';
    if (dias <= 7) return '#f59e0b';
    if (dias <= 15) return '#f97316';
    return '#ef4444';
  };

  // ── Carga de datos ─────────────────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const [dispositivosRes, ingresosRes] = await Promise.all([
          dispositivoService.obtenerTodos(),
          ingresoService.obtenerTodos(),
        ]);

        const disps = dispositivosRes?.data ?? dispositivosRes ?? [];
        const ingresos = ingresosRes?.data?.data ?? ingresosRes?.data ?? ingresosRes ?? [];

        const porDisp = {};
        (Array.isArray(ingresos) ? ingresos : []).forEach((ing) => {
          const id = ing.id_dispositivo;
          if (!porDisp[id]) porDisp[id] = [];
          porDisp[id].push(ing);
        });

        Object.values(porDisp).forEach((arr) =>
          arr.sort((a, b) => new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso))
        );

        const procesados = (Array.isArray(disps) ? disps : []).map((d) => {
          const ingresosDisp = porDisp[d.id_dispositivo] ?? [];
          const ultimoIngreso = ingresosDisp[0] ?? null;

          let estadoActual = 'SIN_INGRESOS';
          let estadoTexto = 'Sin ingresos';
          let estadoColor = 'gris';
          let diasEnTaller = null;
          let fechaIngresoActual = null;

          if (ultimoIngreso) {
            fechaIngresoActual = ultimoIngreso.fecha_ingreso;

            if (ultimoIngreso.estado === 'TALLER') {
              estadoActual = 'EN_TALLER';
              estadoTexto = 'En taller';
              estadoColor = 'amarillo';
              diasEnTaller = calcularDiasEnTaller(ultimoIngreso.fecha_ingreso);
            } else if (ultimoIngreso.estado === 'RETIRADO') {
              estadoActual = 'RETIRADO';
              estadoTexto = 'Retirado';
              estadoColor = 'verde';
            } else {
              estadoActual = ultimoIngreso.estado || 'PENDIENTE';
              estadoTexto = ultimoIngreso.estado || 'Pendiente';
              estadoColor = 'naranja';
              if (ultimoIngreso.estado !== 'RETIRADO') {
                diasEnTaller = calcularDiasEnTaller(ultimoIngreso.fecha_ingreso);
              }
            }
          }

          return {
            ...d,
            ingresos: ingresosDisp,
            ultimoIngreso: ultimoIngreso,
            estadoActual: estadoActual,
            estadoTexto: estadoTexto,
            estadoColor: estadoColor,
            diasEnTaller: diasEnTaller,
            fechaIngresoActual: fechaIngresoActual,
          };
        });

        setDispositivos(procesados);
      } catch (e) {
        console.error(e);
        setError('No se pudieron cargar los dispositivos.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = dispositivos.length;
    const enTaller = dispositivos.filter((d) => d.estadoActual === 'EN_TALLER').length;
    const retirados = dispositivos.filter((d) => d.estadoActual === 'RETIRADO').length;
    const sinIngresos = dispositivos.filter((d) => d.estadoActual === 'SIN_INGRESOS').length;
    const listos = dispositivos.filter((d) => d.estadoActual === 'LISTO').length;

    const dispositivosEnTaller = dispositivos.filter(
      (d) => d.estadoActual === 'EN_TALLER' && d.diasEnTaller !== null
    );
    const promedioDias =
      dispositivosEnTaller.length > 0
        ? Math.round(
            dispositivosEnTaller.reduce((sum, d) => sum + d.diasEnTaller, 0) /
              dispositivosEnTaller.length
          )
        : 0;

    const masDe7Dias = dispositivos.filter(
      (d) => d.estadoActual === 'EN_TALLER' && d.diasEnTaller > 7
    ).length;
    const masDe15Dias = dispositivos.filter(
      (d) => d.estadoActual === 'EN_TALLER' && d.diasEnTaller > 15
    ).length;

    return {
      total,
      enTaller,
      retirados,
      sinIngresos,
      listos,
      promedioDias,
      masDe7Dias,
      masDe15Dias,
    };
  }, [dispositivos]);

  // ── Filtrado ──────────────────────────────────────────────────────────────
  const filtrados = useMemo(() => {
    return dispositivos.filter((d) => {
      const marca = d.modelo?.marca?.marca ?? '';
      const modelo = d.modelo?.nombre_modelo ?? '';
      const cliente = `${d.cliente?.nombre ?? ''} ${d.cliente?.apellido ?? ''}`;
      const term = busqueda.toLowerCase();

      const okBus =
        !busqueda ||
        marca.toLowerCase().includes(term) ||
        modelo.toLowerCase().includes(term) ||
        cliente.toLowerCase().includes(term);

      const okEst = filtroEstado === 'todos' || d.estadoActual === filtroEstado;

      return okBus && okEst;
    });
  }, [dispositivos, busqueda, filtroEstado]);

  // ✅ Lógica de paginación
  const totalPaginas = Math.ceil(filtrados.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const dispositivosPagina = filtrados.slice(inicio, fin);

  // ✅ Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [busqueda, filtroEstado]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const fmtFecha = (iso) => {
    if (!iso) return null;
    const d = new Date(iso);
    return {
      fecha: d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      hora: d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }),
    };
  };

  const getEstadoStyles = (color) => {
    switch (color) {
      case 'amarillo':
        return { bg: '#fef3c7', text: '#d97706', dot: '#f59e0b' };
      case 'verde':
        return { bg: '#d1fae5', text: '#059669', dot: '#10b981' };
      case 'azul':
        return { bg: '#dbeafe', text: '#2563eb', dot: '#3b82f6' };
      case 'naranja':
        return { bg: '#ffedd5', text: '#ea580c', dot: '#f97316' };
      default:
        return { bg: '#f1f5f9', text: '#64748b', dot: '#94a3b8' };
    }
  };

  if (loading)
    return (
      <div className="disp-loading">
        <Spinner animation="border" size="sm" style={{ color: '#6366f1' }} />
        <span>Cargando dispositivos...</span>
      </div>
    );
  if (error)
    return (
      <Alert variant="danger" style={{ borderRadius: 10, margin: 0 }}>
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </Alert>
    );

  return (
    <div className="disp-wrap">
      {/* Header STICKY */}
      <div className="disp-header">
        <h2>
          <i className="fas fa-mobile-alt"></i>
          Dispositivos Registrados
        </h2>
        <span className="disp-total-badge">
          <i className="fas fa-layer-group"></i>
          {dispositivos.length} dispositivos
        </span>
      </div>

      {/* KPIs - Scrollean normalmente */}
      <div className="disp-kpi-grid">
        <div className="disp-kpi-card">
          <div className="disp-kpi-icon azul">
            <i className="fas fa-mobile-alt"></i>
          </div>
          <div>
            <div className="disp-kpi-valor">{kpis.total}</div>
            <div className="disp-kpi-label">Total dispositivos</div>
          </div>
        </div>
        <div className="disp-kpi-card">
          <div className="disp-kpi-icon amarillo">
            <i className="fas fa-tools"></i>
          </div>
          <div>
            <div className="disp-kpi-valor">{kpis.enTaller}</div>
            <div className="disp-kpi-label">En taller</div>
          </div>
        </div>
        <div className="disp-kpi-card">
          <div className="disp-kpi-icon verde">
            <i className="fas fa-check-circle"></i>
          </div>
          <div>
            <div className="disp-kpi-valor">{kpis.retirados}</div>
            <div className="disp-kpi-label">Retirados</div>
          </div>
        </div>
        <div className="disp-kpi-card">
          <div className="disp-kpi-icon rojo">
            <i className="fas fa-hourglass-half"></i>
          </div>
          <div>
            <div className="disp-kpi-valor">{kpis.promedioDias}</div>
            <div className="disp-kpi-label">Promedio días en taller</div>
          </div>
        </div>
      </div>

      {/* Alertas de días */}
      {(kpis.masDe7Dias > 0 || kpis.masDe15Dias > 0) && (
        <div className="disp-kpi-grid" style={{ marginTop: '-10px' }}>
          {kpis.masDe7Dias > 0 && (
            <div className="disp-kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
              <div className="disp-kpi-icon amarillo">
                <i className="fas fa-clock"></i>
              </div>
              <div>
                <div className="disp-kpi-valor">{kpis.masDe7Dias}</div>
                <div className="disp-kpi-label">+7 días en taller</div>
              </div>
            </div>
          )}
          {kpis.masDe15Dias > 0 && (
            <div className="disp-kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="disp-kpi-icon rojo">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <div>
                <div className="disp-kpi-valor">{kpis.masDe15Dias}</div>
                <div className="disp-kpi-label">+15 días en taller</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ Filtros STICKY - Se quedan arriba al hacer scroll */}
      <div className="disp-filtros-sticky">
        <div className="disp-filtros-card">
          <div className="disp-filtros-row">
            <div className="disp-input-group" style={{ flex: 2 }}>
              <span className="disp-input-icon">
                <i className="fas fa-search"></i>
              </span>
              <input
                className="disp-input"
                type="text"
                placeholder="Buscar por marca, modelo o cliente..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <div className="disp-input-group">
              <span className="disp-input-icon">
                <i className="fas fa-filter"></i>
              </span>
              <select
                className="disp-select"
                value={filtroEstado}
                onChange={(e) => setFiltroEstado(e.target.value)}
              >
                <option value="todos">Todos los estados</option>
                <option value="EN_TALLER">En taller</option>
                <option value="RETIRADO">Retirados</option>
                <option value="SIN_INGRESOS">Sin ingresos</option>
              </select>
            </div>
            <button
              className="disp-btn-limpiar"
              onClick={() => {
                setBusqueda('');
                setFiltroEstado('todos');
              }}
            >
              <i className="fas fa-times" style={{ marginRight: 4 }}></i>Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      {/* Tabla */}
      <div className="disp-tabla-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="disp-table">
            <thead>
              <tr>
                <th>Dispositivo</th>
                <th>Cliente</th>
                <th>Estado actual</th>
                <th>Último recepcionista</th>
                <th>Ingreso</th>
                <th>Días en taller</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dispositivosPagina.length > 0 ? (
                dispositivosPagina.map((d) => {
                  const ult = d.ultimoIngreso;
                  const fechaObj = fmtFecha(ult?.fecha_ingreso);
                  const estilos = getEstadoStyles(d.estadoColor);
                  const diasColor = getDiasColor(d.diasEnTaller);
                  const diasTexto = getDiasTexto(d.diasEnTaller);

                  return (
                    <tr
                      key={d.id_dispositivo}
                      onClick={() => setModalDispositivo(d)}
                      style={{ cursor: 'pointer' }}
                      title="Ver historial completo"
                    >
                      {/* Dispositivo */}
                      <td>
                        <div className="disp-cell-modelo">
                          {d.modelo?.marca?.marca ?? '—'} {d.modelo?.nombre_modelo ?? '—'}
                        </div>
                        <div className="disp-cell-sub">
                          {[d.memoria_ram, d.almacenamiento].filter(Boolean).join(' · ') ||
                            'Sin especificaciones'}
                        </div>
                      </td>

                      {/* Cliente */}
                      <td>
                        <div className="disp-cell-cliente">
                          {`${d.cliente?.nombre ?? ''} ${d.cliente?.apellido ?? ''}`.trim() ||
                            'Sin cliente'}
                        </div>
                        <div className="disp-cell-tel">
                          {d.cliente?.numero_celular ?? 'Sin teléfono'}
                        </div>
                      </td>

                      {/* Estado actual */}
                      <td>
                        <span
                          className="disp-estado-badge"
                          style={{ background: estilos.bg, color: estilos.text }}
                        >
                          <span
                            className="disp-estado-dot"
                            style={{ background: estilos.dot }}
                          ></span>
                          {d.estadoTexto}
                        </span>
                      </td>

                      {/* Último recepcionista */}
                      <td>
                        {ult ? (
                          <>
                            <div className="disp-recep-nombre">
                              {`${ult.usuario?.nombre ?? ''} ${ult.usuario?.apellido ?? ''}`.trim() ||
                                '—'}
                            </div>
                            <div className="disp-recep-rol">
                              <span className="disp-recep-dot"></span>
                              {ult.usuario?.es_recepcionista ? 'Recepcionista' : 'Usuario'}
                            </div>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>Sin registro</span>
                        )}
                      </td>

                      {/* Fecha ingreso */}
                      <td>
                        {fechaObj ? (
                          <>
                            <div className="disp-fecha">{fechaObj.fecha}</div>
                            <div className="disp-fecha-hora">{fechaObj.hora}</div>
                          </>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                        )}
                      </td>

                      {/* Días en taller */}
                      <td>
                        {d.diasEnTaller !== null ? (
                          <div>
                            <span
                              className="disp-dias-badge"
                              style={{
                                background: `${diasColor}15`,
                                color: diasColor,
                                border: `1px solid ${diasColor}`,
                              }}
                            >
                              <i className="fas fa-calendar-day" style={{ marginRight: 4 }}></i>
                              {diasTexto}
                            </span>
                            {d.diasEnTaller > 15 && (
                              <div className="disp-dias-alerta">⚠️ Urgente</div>
                            )}
                          </div>
                        ) : (
                          <span style={{ fontSize: 12, color: '#94a3b8' }}>—</span>
                        )}
                      </td>

                      {/* Historial */}
                      <td>
                        {d.ingresos.length > 1 && (
                          <button
                            className="disp-btn-hist"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalDispositivo(d);
                            }}
                          >
                            <i className="fas fa-history"></i>
                            Ver {d.ingresos.length}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="disp-vacio">
                      <i className="fas fa-mobile-alt"></i>
                      {busqueda || filtroEstado !== 'todos'
                        ? 'No se encontraron dispositivos con ese filtro'
                        : 'No hay dispositivos registrados'}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <div className="disp-pagination">
            <div className="disp-pagination-info">
              Mostrando {inicio + 1} - {Math.min(fin, filtrados.length)} de {filtrados.length}{' '}
              dispositivos
            </div>
            <div className="disp-pagination-controls">
              <button
                className="disp-pagination-btn"
                onClick={() => setPaginaActual(1)}
                disabled={paginaActual === 1}
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button
                className="disp-pagination-btn"
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1}
              >
                <i className="fas fa-angle-left"></i>
              </button>

              <span className="disp-pagination-current">
                Página {paginaActual} de {totalPaginas}
              </span>

              <button
                className="disp-pagination-btn"
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
              >
                <i className="fas fa-angle-right"></i>
              </button>
              <button
                className="disp-pagination-btn"
                onClick={() => setPaginaActual(totalPaginas)}
                disabled={paginaActual === totalPaginas}
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>

            <div className="disp-pagination-rows">
              <span>Mostrar</span>
              <select
                value={itemsPorPagina}
                onChange={(e) => {
                  setItemsPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="disp-pagination-select"
              >
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>por página</span>
            </div>
          </div>
        )}

        <div className="disp-tabla-footer">
          {filtrados.length} dispositivo{filtrados.length !== 1 ? 's' : ''}
          {filtrados.length !== dispositivos.length && ` (filtrados de ${dispositivos.length})`}
        </div>
      </div>

      {/* Resumen de estados */}
      {dispositivos.length > 0 && (
        <div className="disp-resumen-card">
          <div className="disp-resumen-title">
            <span className="icon">
              <i className="fas fa-chart-bar"></i>
            </span>
            Resumen de estados
          </div>
          <div className="disp-resumen-row">
            <span className="disp-resumen-key">Dispositivos en taller</span>
            <span className="disp-resumen-value" style={{ color: '#f59e0b' }}>
              {kpis.enTaller}
            </span>
          </div>
          <div className="disp-resumen-row">
            <span className="disp-resumen-key">Dispositivos retirados</span>
            <span className="disp-resumen-value" style={{ color: '#10b981' }}>
              {kpis.retirados}
            </span>
          </div>
          <div className="disp-resumen-row">
            <span className="disp-resumen-key">Dispositivos listos para retirar</span>
            <span className="disp-resumen-value" style={{ color: '#3b82f6' }}>
              {kpis.listos}
            </span>
          </div>
          <div className="disp-resumen-row">
            <span className="disp-resumen-key">Dispositivos sin ingresos</span>
            <span className="disp-resumen-value" style={{ color: '#94a3b8' }}>
              {kpis.sinIngresos}
            </span>
          </div>
          <div className="disp-resumen-row">
            <span className="disp-resumen-key">Promedio de días en taller</span>
            <span className="disp-resumen-value" style={{ color: '#8b5cf6' }}>
              {kpis.promedioDias} días
            </span>
          </div>
          {kpis.masDe7Dias > 0 && (
            <div className="disp-resumen-row">
              <span className="disp-resumen-key">⚠️ Dispositivos con +7 días</span>
              <span className="disp-resumen-value" style={{ color: '#f59e0b' }}>
                {kpis.masDe7Dias}
              </span>
            </div>
          )}
          {kpis.masDe15Dias > 0 && (
            <div className="disp-resumen-row">
              <span className="disp-resumen-key">🚨 Dispositivos con +15 días (urgente)</span>
              <span className="disp-resumen-value" style={{ color: '#ef4444' }}>
                {kpis.masDe15Dias}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Modal historial */}
      {modalDispositivo && (
        <ModalHistorialDispositivo
          dispositivo={modalDispositivo}
          onClose={() => setModalDispositivo(null)}
        />
      )}
    </div>
  );
};

export default AdminDispositivo;
