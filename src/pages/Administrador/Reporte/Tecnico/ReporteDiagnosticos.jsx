// ReporteDiagnosticos.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { usuarioService } from '../../../../services/UsuarioService';
import { diagnosticoService } from '../../../../services/diagnosticoService';
import CustomTooltip from '../Componentes/CustomTooltip';
import BtnExportarPDF from '../Componentes/BtnExportarPDF';
import { exportarPDF } from '../Componentes/exportarPDF';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from 'recharts';
import { Clock, Table as TableIcon, Trophy, AlertCircle } from 'lucide-react';
import './ReporteDiagnosticos.css';

const ESTADO_COLOR_DIAG = {
  ESPERANDO_DIAGNOSTICO: '#f59e0b',
  EN_REVISION: '#6366f1',
  ESPERANDO_APROBACION: '#22d3ee',
  APROBADO: '#10b981',
  RECHAZADO: '#f43f5e',
  NO_REPARADO: '#94a3b8',
  EN_REPARACION: '#fb923c',
  LISTO_PARA_RETIRAR: '#c084fc',
  PAGADO: '#059669',
};

const ESTADO_LABEL_DIAG = {
  ESPERANDO_DIAGNOSTICO: 'PENDIENTE',
  EN_REVISION: 'En revisión',
  ESPERANDO_APROBACION: 'Esperando aprobación',
  APROBADO: 'Aprobado',
  RECHAZADO: 'Rechazado',
  NO_REPARADO: 'No reparado',
  LISTO_PARA_RETIRAR: 'Listo para retirar',
  EN_REPARACION: 'En reparación',
};

const ReporteDiagnosticos = () => {
  const [diagnosticos, setDiagnosticos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroTecnico, setFiltroTecnico] = useState('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [rangoPreset, setRangoPreset] = useState('ultimos30');
  const [exportando, setExportando] = useState(false);
  const [modoTiempos, setModoTiempos] = useState(false);

  // ✅ Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(15);

  const pdfRef = useRef();

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================
  const setRangoFechas = (preset) => {
    setRangoPreset(preset);
    const hoy = new Date();
    let desde = new Date();
    let hasta = new Date(hoy);

    switch (preset) {
      case 'ultimos7':
        desde.setDate(hoy.getDate() - 7);
        break;
      case 'ultimos15':
        desde.setDate(hoy.getDate() - 15);
        break;
      case 'ultimos30':
        desde.setDate(hoy.getDate() - 30);
        break;
      case 'esteMes':
        desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
      case 'mesPasado':
        desde = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        hasta = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        break;
      default:
        return;
    }
    setFechaDesde(desde.toISOString().split('T')[0]);
    setFechaHasta(hasta.toISOString().split('T')[0]);
  };

  const formatearFecha = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatearTiempo = (horas) => {
    if (!horas) return '—';

    const horasNum = parseFloat(horas);
    if (isNaN(horasNum)) return '—';

    const minutos = Math.round(horasNum * 60);

    if (horasNum < 1) {
      if (minutos === 0) return '< 1 min';
      return `${minutos} minuto${minutos !== 1 ? 's' : ''}`;
    }

    if (horasNum < 24) {
      const horasEnteras = Math.floor(horasNum);
      const minutosRestantes = Math.round((horasNum - horasEnteras) * 60);

      if (minutosRestantes === 0) {
        return `${horasEnteras} hora${horasEnteras !== 1 ? 's' : ''}`;
      }
      return `${horasEnteras} h ${minutosRestantes} min`;
    }

    const dias = Math.floor(horasNum / 24);
    const horasRestantes = horasNum % 24;
    const horasEnteras = Math.floor(horasRestantes);
    const minutosRestantes = Math.round((horasRestantes - horasEnteras) * 60);

    let resultado = `${dias} día${dias !== 1 ? 's' : ''}`;

    if (horasEnteras > 0) {
      resultado += ` ${horasEnteras} h`;
    }

    if (minutosRestantes > 0) {
      resultado += ` ${minutosRestantes} min`;
    }

    return resultado;
  };

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [resDiag, resTec] = await Promise.all([
        diagnosticoService.obtenerTodos(),
        usuarioService.obtenerTecnicos(),
      ]);
      console.log('📦 RESPUESTA DIAGNÓSTICOS (raw):', resDiag);
      let diagnosticosArray = [];
      if (Array.isArray(resDiag)) {
        diagnosticosArray = resDiag;
      } else if (resDiag?.data && Array.isArray(resDiag.data)) {
        diagnosticosArray = resDiag.data;
      } else if (resDiag?.success && Array.isArray(resDiag.data)) {
        diagnosticosArray = resDiag.data;
      }
      setDiagnosticos(diagnosticosArray);

      let tecnicosArray = [];
      if (Array.isArray(resTec)) {
        tecnicosArray = resTec;
      } else if (resTec?.data && Array.isArray(resTec.data)) {
        tecnicosArray = resTec.data;
      } else {
        tecnicosArray = [];
      }
      setTecnicos(tecnicosArray);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los datos de diagnósticos.');
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // useEffect
  // ============================================
  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (diagnosticos.length > 0 && !fechaDesde) {
      setRangoFechas('ultimos30');
    }
  }, [diagnosticos]);

  // ============================================
  // 1. diagsFiltrados (depende de diagnosticos, filtroTecnico, fechaDesde, fechaHasta)
  // ============================================
  const diagsFiltrados = useMemo(() => {
    let filtrados = diagnosticos;

    if (filtroTecnico !== 'todos') {
      filtrados = filtrados.filter(
        (d) => String(d.id_usuario ?? d.usuario?.id_usuario) === filtroTecnico
      );
    }

    if (fechaDesde && fechaHasta) {
      const desde = new Date(fechaDesde + 'T00:00:00');
      const hasta = new Date(fechaHasta + 'T23:59:59');
      filtrados = filtrados.filter((d) => {
        const fechaStr = d.ingreso?.fecha_ingreso || d.created_at;
        if (!fechaStr) return false;
        const fecha = new Date(fechaStr);
        return fecha >= desde && fecha <= hasta;
      });
    }

    return filtrados;
  }, [diagnosticos, filtroTecnico, fechaDesde, fechaHasta]);

  // ============================================
  // 2. diagnosticosConTiempos (depende de diagsFiltrados)
  // ============================================
  const diagnosticosConTiempos = useMemo(() => {
    return diagsFiltrados.map((d) => {
      const fechaIngreso = new Date(d.ingreso?.fecha_ingreso);
      const fechaInicioRevision = d.fecha_inicio_revision
        ? new Date(d.fecha_inicio_revision)
        : null;
      const fechaFinRevision = d.fecha_fin_revision ? new Date(d.fecha_fin_revision) : null;

      let tiempoInicioHoras = null;
      let tiempoDuracionHoras = null;
      let tiempoTotalHoras = null;

      if (
        fechaIngreso &&
        !isNaN(fechaIngreso) &&
        fechaInicioRevision &&
        !isNaN(fechaInicioRevision)
      ) {
        tiempoInicioHoras = ((fechaInicioRevision - fechaIngreso) / (1000 * 60 * 60)).toFixed(1);
      }

      if (
        fechaInicioRevision &&
        !isNaN(fechaInicioRevision) &&
        fechaFinRevision &&
        !isNaN(fechaFinRevision)
      ) {
        tiempoDuracionHoras = ((fechaFinRevision - fechaInicioRevision) / (1000 * 60 * 60)).toFixed(
          1
        );
      }

      if (fechaIngreso && !isNaN(fechaIngreso) && fechaFinRevision && !isNaN(fechaFinRevision)) {
        tiempoTotalHoras = ((fechaFinRevision - fechaIngreso) / (1000 * 60 * 60)).toFixed(1);
      }

      return {
        ...d,
        tiempoInicio: tiempoInicioHoras,
        tiempoDuracion: tiempoDuracionHoras,
        tiempoTotal: tiempoTotalHoras,
        fecha_inicio_revision: d.fecha_inicio_revision,
        fecha_fin_revision: d.fecha_fin_revision,
      };
    });
  }, [diagsFiltrados]);

  // ============================================
  // 3. kpisDiag (depende de diagsFiltrados)
  // ============================================
  const kpisDiag = useMemo(() => {
    const total = diagsFiltrados.length;
    const pendientes = diagsFiltrados.filter((d) => d.estado === 'ESPERANDO_DIAGNOSTICO').length;
    const enRevision = diagsFiltrados.filter((d) => d.estado === 'EN_REVISION').length;
    const esperandoAprobacion = diagsFiltrados.filter(
      (d) => d.estado === 'ESPERANDO_APROBACION'
    ).length;
    const aprobados = diagsFiltrados.filter((d) => d.estado === 'APROBADO').length;
    const rechazados = diagsFiltrados.filter((d) => d.estado === 'RECHAZADO').length;
    const tasaAprobacion =
      aprobados + rechazados > 0 ? Math.round((aprobados / (aprobados + rechazados)) * 100) : 0;

    return {
      total,
      pendientes,
      enRevision,
      esperandoAprobacion,
      aprobados,
      rechazados,
      tasaAprobacion,
    };
  }, [diagsFiltrados]);

  // 4. barDiagsTecnicos (depende de diagsFiltrados - respeta filtros)
  const barDiagsTecnicos = useMemo(() => {
    const map = {};
    diagsFiltrados.forEach((d) => {
      const id = String(d.id_usuario ?? d.usuario?.id_usuario ?? '?');
      const nom = d.usuario
        ? `${d.usuario.nombre ?? ''} ${d.usuario.apellido ?? ''}`.trim()
        : `Técnico ${id}`;
      if (!map[id])
        map[id] = {
          nombre: nom.split(' ')[0],
          nombreFull: nom,
          aprobados: 0,
          rechazados: 0,
          pendientes: 0,
          esperandoAprobacion: 0,
          total: 0,
        };
      map[id].total++;
      if (d.estado === 'APROBADO') map[id].aprobados++;
      if (d.estado === 'RECHAZADO') map[id].rechazados++;
      if (d.estado === 'ESPERANDO_DIAGNOSTICO') map[id].pendientes++;
      if (d.estado === 'ESPERANDO_APROBACION') map[id].esperandoAprobacion++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [diagsFiltrados]);

  // ============================================
  // 5. pieDiags (depende de diagsFiltrados)
  // ============================================
  const pieDiags = useMemo(() => {
    const map = {};
    diagsFiltrados.forEach((d) => {
      const est = d.estado ?? 'DESCONOCIDO';
      map[est] = (map[est] ?? 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({
      name: ESTADO_LABEL_DIAG[name] ?? name,
      value,
      color: ESTADO_COLOR_DIAG[name] ?? '#94a3b8',
    }));
  }, [diagsFiltrados]);

  // ============================================
  // 6. rankingEficiencia (depende de diagnosticosConTiempos)
  // ============================================
  const rankingEficiencia = useMemo(() => {
    const map = {};
    diagnosticosConTiempos.forEach((d) => {
      if (!d.tiempoDuracion) return;
      const id = String(d.id_usuario ?? d.usuario?.id_usuario ?? '?');
      const nombre = d.usuario ? `${d.usuario.nombre} ${d.usuario.apellido}` : `Técnico ${id}`;
      if (!map[id]) map[id] = { nombre, total: 0, sumaHoras: 0, tiempos: [] };
      map[id].total++;
      map[id].sumaHoras += parseFloat(d.tiempoDuracion);
      map[id].tiempos.push(parseFloat(d.tiempoDuracion));
    });

    return Object.values(map)
      .map((t) => ({
        nombre: t.nombre,
        total: t.total,
        promedio: (t.sumaHoras / t.total).toFixed(1),
        rapido: Math.min(...t.tiempos).toFixed(1),
        lento: Math.max(...t.tiempos).toFixed(1),
      }))
      .sort((a, b) => a.promedio - b.promedio);
  }, [diagnosticosConTiempos]);

  // ============================================
  // 7. tiemposPorGravedad (depende de diagnosticosConTiempos)
  // ============================================
  const tiemposPorGravedad = useMemo(() => {
    const map = {};
    diagnosticosConTiempos.forEach((d) => {
      if (!d.tiempoDuracion || !d.gravedad) return;
      const gravedad = d.gravedad;
      if (!map[gravedad]) map[gravedad] = { total: 0, suma: 0 };
      map[gravedad].total++;
      map[gravedad].suma += parseFloat(d.tiempoDuracion);
    });
    return Object.entries(map).map(([gravedad, data]) => ({
      gravedad,
      promedio: (data.suma / data.total).toFixed(1),
      total: data.total,
    }));
  }, [diagnosticosConTiempos]);

  // ============================================
  // 8. diagnosticosDemorados (depende de diagnosticosConTiempos)
  // ============================================
  const diagnosticosDemorados = useMemo(() => {
    return diagnosticosConTiempos.filter(
      (d) =>
        d.estado !== 'EXPIRADO' &&
        d.estado !== 'RECHAZADO' &&
        d.estado !== 'NO_REPARADO' &&
        parseFloat(d.tiempoDuracion) > 72
    );
  }, [diagnosticosConTiempos]);

  // ============================================
  // 8b. tiemposPorMarca (depende de diagnosticosConTiempos)
  // ============================================
  const tiemposPorMarca = useMemo(() => {
    const map = {};
    diagnosticosConTiempos.forEach((d) => {
      if (!d.tiempoDuracion) return;
      const marca =
        d.ingreso?.dispositivo?.modelo?.marca?.marca ||
        d.ingreso?.dispositivo?.modelo?.marca ||
        'Sin marca';
      if (!map[marca]) map[marca] = { total: 0, suma: 0, diagnosticos: [] };
      map[marca].total++;
      map[marca].suma += parseFloat(d.tiempoDuracion);
      map[marca].diagnosticos.push(parseFloat(d.tiempoDuracion));
    });

    return Object.entries(map)
      .map(([marca, data]) => ({
        marca,
        promedio: (data.suma / data.total).toFixed(1),
        total: data.total,
        rapido: Math.min(...data.diagnosticos).toFixed(1),
        lento: Math.max(...data.diagnosticos).toFixed(1),
      }))
      .sort((a, b) => a.promedio - b.promedio);
  }, [diagnosticosConTiempos]);

  // ============================================
  // PAGINACIÓN PARA TABLA DETALLE
  // ============================================
  const datosTabla = useMemo(() => {
    return modoTiempos ? diagnosticosConTiempos : diagsFiltrados;
  }, [modoTiempos, diagnosticosConTiempos, diagsFiltrados]);

  const totalPaginas = Math.ceil(datosTabla.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const datosPagina = datosTabla.slice(inicio, fin);

  // Resetear a página 1 cuando cambian los filtros o el modo
  useEffect(() => {
    setPaginaActual(1);
  }, [filtroTecnico, fechaDesde, fechaHasta, modoTiempos]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleExportarPDF = async () => {
    setExportando(true);
    try {
      await exportarPDF(pdfRef, 'Reporte_Diagnosticos', 'Reporte de Diagnósticos');
    } catch (err) {
      console.error('Error al exportar PDF:', err);
    } finally {
      setExportando(false);
    }
  };

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p>Cargando diagnósticos...</p>
      </div>
    );
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div ref={pdfRef} className="diag-wrap">
      {/* Header */}
      <div className="diag-header">
        <div className="diag-header-top">
          <div>
            <h2>📋 Reporte de Diagnósticos</h2>
            <p>
              {diagsFiltrados.length} diagnósticos analizados
              {fechaDesde &&
                fechaHasta &&
                ` · ${formatearFecha(fechaDesde)} → ${formatearFecha(fechaHasta)}`}
            </p>
          </div>
          <BtnExportarPDF
            onClick={handleExportarPDF}
            exportando={exportando}
            disabled={diagsFiltrados.length === 0}
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="diag-filtros-fechas">
        <div className="fechas-presets">
          <button
            className={`preset-btn ${rangoPreset === 'ultimos7' ? 'active' : ''}`}
            onClick={() => setRangoFechas('ultimos7')}
          >
            📅 Últimos 7 días
          </button>
          <button
            className={`preset-btn ${rangoPreset === 'ultimos15' ? 'active' : ''}`}
            onClick={() => setRangoFechas('ultimos15')}
          >
            📅 Últimos 15 días
          </button>
          <button
            className={`preset-btn ${rangoPreset === 'ultimos30' ? 'active' : ''}`}
            onClick={() => setRangoFechas('ultimos30')}
          >
            📅 Últimos 30 días
          </button>
          <button
            className={`preset-btn ${rangoPreset === 'esteMes' ? 'active' : ''}`}
            onClick={() => setRangoFechas('esteMes')}
          >
            📅 Este mes
          </button>
          <button
            className={`preset-btn ${rangoPreset === 'mesPasado' ? 'active' : ''}`}
            onClick={() => setRangoFechas('mesPasado')}
          >
            📅 Mes pasado
          </button>
        </div>
        <div className="fechas-custom">
          <label>Desde:</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => {
              setFechaDesde(e.target.value);
              setRangoPreset('custom');
            }}
          />
          <label>Hasta:</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => {
              setFechaHasta(e.target.value);
              setRangoPreset('custom');
            }}
          />
        </div>
      </div>

      <div className="diag-filtros">
        <select
          className="diag-select"
          value={filtroTecnico}
          onChange={(e) => setFiltroTecnico(e.target.value)}
        >
          <option value="todos">👤 Todos los técnicos</option>
          {tecnicos.map((t) => (
            <option key={t.id_usuario} value={String(t.id_usuario)}>
              {`${t.nombre ?? ''} ${t.apellido ?? ''}`.trim()}
            </option>
          ))}
        </select>
      </div>

      {/* KPIs */}
      <div className="diag-kpi-grid">
        {[
          { label: 'Total Diagnósticos', value: kpisDiag.total, icon: '🔍', color: '#6366f1' },
          { label: 'Pendientes', value: kpisDiag.pendientes, icon: '⏳', color: '#f59e0b' },
          { label: 'En revisión', value: kpisDiag.enRevision, icon: '👁️', color: '#6366f1' },
          {
            label: 'Esp. aprobación',
            value: kpisDiag.esperandoAprobacion,
            icon: '📋',
            color: '#22d3ee',
          },
          {
            label: 'Tasa aprobación',
            value: `${kpisDiag.tasaAprobacion}%`,
            icon: '📈',
            color: '#10b981',
          },
        ].map((k) => (
          <div className="diag-kpi-card" key={k.label}>
            <div className="diag-kpi-label">
              {k.icon} {k.label}
            </div>
            <div className="diag-kpi-value" style={{ color: k.color }}>
              {k.value}
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="diag-charts-grid-2">
        <div className="diag-chart-card">
          <div className="diag-chart-title">
            <span className="diag-title-icon">
              <i className="fas fa-chart-bar"></i>
            </span>
            <span>Diagnósticos por Técnico</span>
          </div>
          {barDiagsTecnicos.length === 0 ? (
            <p className="diag-empty">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={barDiagsTecnicos}
                margin={{ top: 0, right: 10, left: -20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="nombre"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-20}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="aprobados" name="Aprobados" stackId="a" fill="#10b981" />
                <Bar
                  dataKey="esperandoAprobacion"
                  name="Esperando aprobación"
                  stackId="a"
                  fill="#22d3ee"
                />
                <Bar dataKey="pendientes" name="Pendientes" stackId="a" fill="#f59e0b" />
                <Bar
                  dataKey="rechazados"
                  name="Rechazados"
                  stackId="a"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="diag-chart-card">
          <div className="diag-chart-title">
            <span className="diag-title-icon">
              <i className="fas fa-chart-pie"></i>
            </span>
            <span>Estados de Diagnósticos</span>
          </div>
          {pieDiags.length === 0 ? (
            <p className="diag-empty">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <PieChart>
                <Pie
                  data={pieDiags}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieDiags.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* RANKING DE EFICIENCIA POR TÉCNICO */}
      <div className="diag-chart-card">
        <div className="diag-chart-title">
          <span className="diag-title-icon" style={{ background: '#f59e0b' }}>
            <Trophy size={14} />
          </span>
          <span> Ranking de eficiencia por técnico</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="diag-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Técnico</th>
                <th>Diagnósticos</th>
                <th> Promedio horas</th>
                <th> Más rápido</th>
                <th> Más lento</th>
              </tr>
            </thead>
            <tbody>
              {rankingEficiencia.map((tec, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td className="fw-bold">{tec.nombre}</td>
                  <td>{tec.total}</td>
                  <td
                    style={{
                      color: parseFloat(tec.promedio) > 48 ? '#f43f5e' : '#10b981',
                      fontWeight: 500,
                    }}
                  >
                    {formatearTiempo(tec.promedio)}
                  </td>
                  <td style={{ color: '#10b981' }}>{formatearTiempo(tec.rapido)}</td>
                  <td style={{ color: '#f43f5e' }}>{formatearTiempo(tec.lento)}</td>
                </tr>
              ))}
              {rankingEficiencia.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-3">
                    Sin datos de tiempos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TIEMPO PROMEDIO POR MARCA */}
      <div className="diag-chart-card">
        <div className="diag-chart-title">
          <span className="diag-title-icon" style={{ background: '#8b5cf6' }}>
            <i className="fas fa-trademark"></i>
          </span>
          <span>Tiempo promedio por marca</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="diag-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Marca</th>
                <th>Diagnósticos</th>
                <th> Promedio horas</th>
                <th> Más rápido</th>
                <th> Más lento</th>
              </tr>
            </thead>
            <tbody>
              {tiemposPorMarca.map((item, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td className="fw-bold">{item.marca}</td>
                  <td>{item.total}</td>
                  <td
                    style={{
                      color:
                        parseFloat(item.promedio) > 48
                          ? '#f43f5e'
                          : parseFloat(item.promedio) > 24
                            ? '#f59e0b'
                            : '#10b981',
                      fontWeight: 500,
                    }}
                  >
                    {formatearTiempo(item.promedio)}
                  </td>
                  <td style={{ color: '#10b981' }}>{formatearTiempo(item.rapido)}</td>
                  <td style={{ color: '#f43f5e' }}>{formatearTiempo(item.lento)}</td>
                </tr>
              ))}
              {tiemposPorMarca.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-3">
                    Sin datos de tiempos por marca
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TIEMPO PROMEDIO POR GRAVEDAD */}
      <div className="diag-charts-grid-2">
        <div className="diag-chart-card">
          <div className="diag-chart-title">
            <span className="diag-title-icon">
              <i className="fas fa-chart-bar"></i>
            </span>
            <span>⏱️ Tiempo promedio por gravedad</span>
          </div>
          {tiemposPorGravedad.length === 0 ? (
            <p className="diag-empty">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={tiemposPorGravedad}
                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="gravedad" tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Horas', angle: -90, position: 'insideLeft', fontSize: 11 }}
                  tickFormatter={(value) => {
                    if (value < 1) {
                      const minutos = Math.round(value * 60);
                      return `${minutos}m`;
                    }
                    if (value < 24) return `${value}h`;
                    return `${Math.floor(value / 24)}d`;
                  }}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const valor = payload[0].value;
                      let color = '#6366f1';

                      switch (label?.toUpperCase()) {
                        case 'ALTA':
                        case 'URGENTE':
                        case 'CRÍTICA':
                          color = '#dc2626';
                          break;
                        case 'MEDIA':
                        case 'MODERADA':
                        case 'MODERADO':
                          color = '#f59e0b';
                          break;
                        case 'BAJA':
                        case 'LEVE':
                          color = '#10b981';
                          break;
                        default:
                          color = '#6366f1';
                      }

                      return (
                        <div
                          style={{
                            background: '#1e293b',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            borderLeft: `3px solid ${color}`,
                            fontSize: '12px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          }}
                        >
                          <span style={{ color: '#94a3b8', fontSize: '10px' }}>{label}</span>
                          <span style={{ color: color, fontWeight: 'bold', marginLeft: '6px' }}>
                            {formatearTiempo(valor)}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="promedio" name="Horas promedio" radius={[6, 6, 0, 0]}>
                  {tiemposPorGravedad.map((entry, index) => {
                    let color = '#6366f1';

                    switch (entry.gravedad?.toUpperCase()) {
                      case 'ALTA':
                      case 'URGENTE':
                      case 'CRÍTICA':
                        color = '#dc2626';
                        break;
                      case 'MEDIA':
                      case 'MODERADA':
                      case 'MODERADO':
                        color = '#f59e0b';
                        break;
                      case 'BAJA':
                      case 'LEVE':
                        color = '#10b981';
                        break;
                      default:
                        color = '#6366f1';
                    }

                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ⚠️ ALERTAS - DIAGNÓSTICOS DEMORADOS */}
        {diagnosticosDemorados.length > 0 && (
          <div
            className="diag-chart-card"
            style={{ borderColor: '#f43f5e', backgroundColor: '#fef2f2' }}
          >
            <div className="diag-chart-title">
              <span className="diag-title-icon" style={{ background: '#f43f5e' }}>
                <AlertCircle size={14} />
              </span>
              <span>⚠️ Alertas - Diagnósticos demorados (&gt;72 horas)</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="diag-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Técnico</th>
                    <th>Gravedad</th>
                    <th>Duración</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {diagnosticosDemorados.slice(0, 10).map((d) => (
                    <tr key={d.id_diagnostico}>
                      <td>#{d.id_diagnostico}</td>
                      <td>
                        {d.usuario?.nombre} {d.usuario?.apellido}
                      </td>
                      <td>{d.gravedad || '—'}</td>
                      <td style={{ color: '#f43f5e', fontWeight: 'bold' }}>
                        {formatearTiempo(d.tiempoDuracion)}
                      </td>
                      <td>{d.estado || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* TABLA DETALLE - Con toggle de columnas y PAGINACIÓN */}
      <div className="diag-chart-card">
        <div
          className="diag-chart-title"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div>
            <span className="diag-title-icon">
              <i className="fas fa-table"></i>
            </span>
            <span>{modoTiempos ? ' Tiempos de Diagnóstico' : 'Detalle de Diagnósticos'}</span>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              className={`diag-btn-toggle ${modoTiempos ? 'active' : ''}`}
              onClick={() => setModoTiempos(!modoTiempos)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: `1px solid ${modoTiempos ? '#6366f1' : '#e2e8f0'}`,
                background: modoTiempos ? '#6366f1' : 'white',
                color: modoTiempos ? 'white' : '#6366f1',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
            >
              {modoTiempos ? <TableIcon size={14} /> : <Clock size={14} />}
              {modoTiempos ? 'Vista normal' : 'Ver tiempos'}
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="diag-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Técnico</th>
                {!modoTiempos ? (
                  <>
                    <th>Estado</th>
                    <th>Gravedad</th>
                    <th>Causa detectada</th>
                    <th>Fecha ingreso</th>
                  </>
                ) : (
                  <>
                    <th> Ingreso → Inicio</th>
                    <th> Duración diagnóstico</th>
                    <th> Tiempo total</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {datosPagina.length > 0 ? (
                datosPagina.map((d) => (
                  <tr key={d.id_diagnostico}>
                    <td>#{d.id_diagnostico}</td>
                    <td>{d.usuario ? `${d.usuario.nombre} ${d.usuario.apellido}` : 'N/A'}</td>
                    {!modoTiempos ? (
                      <>
                        <td>
                          <span
                            className="diag-estado-badge"
                            style={{
                              background: `${ESTADO_COLOR_DIAG[d.estado] ?? '#94a3b8'}20`,
                              color: ESTADO_COLOR_DIAG[d.estado] ?? '#64748b',
                            }}
                          >
                            {ESTADO_LABEL_DIAG[d.estado] ?? d.estado}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`diag-gravedad-badge diag-gravedad-${(d.gravedad ?? '').toLowerCase()}`}
                          >
                            {d.gravedad ?? '—'}
                          </span>
                        </td>
                        <td style={{ maxWidth: 200 }}>{d.causa_detectada ?? '—'}</td>
                        <td>{formatearFecha(d.ingreso?.fecha_ingreso || d.created_at)}</td>
                      </>
                    ) : (
                      <>
                        <td>
                          {d.tiempoInicio ? (
                            <span
                              style={{
                                color: parseFloat(d.tiempoInicio) > 48 ? '#f43f5e' : '#10b981',
                                fontWeight: 500,
                              }}
                            >
                              {formatearTiempo(d.tiempoInicio)}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                        <td>
                          {d.tiempoDuracion ? (
                            <span
                              style={{
                                color: parseFloat(d.tiempoDuracion) > 72 ? '#f43f5e' : '#10b981',
                                fontWeight: 500,
                              }}
                            >
                              {formatearTiempo(d.tiempoDuracion)}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                        <td>
                          {d.tiempoTotal ? (
                            <span style={{ fontWeight: 500 }}>
                              {formatearTiempo(d.tiempoTotal)}
                            </span>
                          ) : (
                            <span style={{ color: '#94a3b8' }}>—</span>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={!modoTiempos ? 6 : 4}>
                    <div className="diag-empty" style={{ textAlign: 'center', padding: '40px' }}>
                      No hay datos para mostrar
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ Paginación - Estilo igual que AdminDispositivo */}
        {totalPaginas > 1 && (
          <div className="diag-pagination">
            <div className="diag-pagination-info">
              Mostrando {inicio + 1} - {Math.min(fin, datosTabla.length)} de {datosTabla.length}{' '}
              diagnósticos
            </div>
            <div className="diag-pagination-controls">
              <button
                className="diag-pagination-btn"
                onClick={() => setPaginaActual(1)}
                disabled={paginaActual === 1}
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button
                className="diag-pagination-btn"
                onClick={() => setPaginaActual(paginaActual - 1)}
                disabled={paginaActual === 1}
              >
                <i className="fas fa-angle-left"></i>
              </button>

              <span className="diag-pagination-current">
                Página {paginaActual} de {totalPaginas}
              </span>

              <button
                className="diag-pagination-btn"
                onClick={() => setPaginaActual(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
              >
                <i className="fas fa-angle-right"></i>
              </button>
              <button
                className="diag-pagination-btn"
                onClick={() => setPaginaActual(totalPaginas)}
                disabled={paginaActual === totalPaginas}
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>

            <div className="diag-pagination-rows">
              <span>Mostrar</span>
              <select
                value={itemsPorPagina}
                onChange={(e) => {
                  setItemsPorPagina(Number(e.target.value));
                  setPaginaActual(1);
                }}
                className="diag-pagination-select"
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

        <div className="diag-tabla-footer">
          {datosTabla.length} diagnóstico{datosTabla.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default ReporteDiagnosticos;
