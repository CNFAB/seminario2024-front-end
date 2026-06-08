import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Spinner, Alert, Badge } from 'react-bootstrap';
import { CheckCircle, XCircle, Sun, Sunset } from 'lucide-react';
import './ReporteRecepcion.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { ingresoService } from '../../../../services/ingresoService';
import CustomTooltip from '../Componentes/CustomTooltip';
import BtnExportarPDF from '../Componentes/BtnExportarPDF';
import { exportarPDF } from '../Componentes/exportarPDF';

// ── Paleta ───────────────────────────────────────────────────────────────────
const PALETTE = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e', '#a78bfa', '#fb923c'];

// ── Helpers ───────────────────────────────────────────────────────────────────
const mesLabel = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
};

const diaLabel = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
};

const formatearFecha = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

// ── Componente principal ──────────────────────────────────────────────────────
const ReporteRecepcion = () => {
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroMes, setFiltroMes] = useState('todos');
  const [filtroRecep, setFiltroRecep] = useState('todos');
  const [exportando, setExportando] = useState(false);
  const pdfRef = useRef(null);

  // ✅ NUEVOS estados para rango de fechas
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [rangoPreset, setRangoPreset] = useState('ultimos7');
  const [verDetalle, setVerDetalle] = useState(false);
  // ── Estado para selector de horario ─────────────────────────────────────────
  const [tipoHorario, setTipoHorario] = useState('manana'); // "manana" o "tarde"

  // ── Presets de fechas ──────────────────────────────────────────────────────
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

  // ── Exportar PDF ──────────────────────────────────────────────────────────
  const handleExportarPDF = async () => {
    setExportando(true);
    try {
      await exportarPDF(pdfRef, 'Reporte_Recepcion', 'Reporte de Recepción');
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      alert('No se pudo generar el PDF.\nnpm install html2canvas jspdf');
    } finally {
      setExportando(false);
    }
  };

  // ── Carga de datos ────────────────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const res = await ingresoService.obtenerTodos();
        const data = res?.data?.data ?? res?.data ?? res ?? [];
        setIngresos(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError('No se pudieron cargar los ingresos. Verificá la conexión con la API.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // ── Inicializar rango por defecto ─────────────────────────────────────────
  useEffect(() => {
    if (ingresos.length > 0 && !fechaDesde) {
      setRangoFechas('ultimos7');
    }
  }, [ingresos]);

  // ── Meses disponibles ─────────────────────────────────────────────────────
  const mesesDisponibles = useMemo(() => {
    const set = new Set();
    ingresos.forEach((i) => {
      if (i.fecha_ingreso) set.add(mesLabel(i.fecha_ingreso));
    });
    return Array.from(set).reverse();
  }, [ingresos]);

  // ── Recepcionistas disponibles ────────────────────────────────────────────
  const recepcionistas = useMemo(() => {
    const map = {};
    ingresos.forEach((i) => {
      const id = i.usuario?.id_usuario ?? i.id_usuario;
      const nom = i.usuario
        ? `${i.usuario.nombre ?? ''} ${i.usuario.apellido ?? ''}`.trim()
        : `Usuario ${id}`;
      if (id) map[id] = nom;
    });
    return map;
  }, [ingresos]);

  // ── Filtrado COMPLETO (con rango de fechas) ───────────────────────────────
  const ingresosFiltrados = useMemo(() => {
    return ingresos.filter((i) => {
      const fechaIngreso = new Date(i.fecha_ingreso);

      if (fechaDesde && fechaHasta) {
        const desde = new Date(fechaDesde + 'T00:00:00');
        const hasta = new Date(fechaHasta + 'T23:59:59');
        if (fechaIngreso < desde || fechaIngreso > hasta) return false;
      }

      const okMes = filtroMes === 'todos' || mesLabel(i.fecha_ingreso) === filtroMes;
      const idRec = String(i.usuario?.id_usuario ?? i.id_usuario ?? '');
      const okRecep = filtroRecep === 'todos' || idRec === filtroRecep;

      return okMes && okRecep;
    });
  }, [ingresos, filtroMes, filtroRecep, fechaDesde, fechaHasta]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = ingresosFiltrados.length;
    const conSim = ingresosFiltrados.filter((i) => i.sim).length;
    const conSD = ingresosFiltrados.filter((i) => i.memoria_sd).length;
    const conRev = ingresosFiltrados.filter((i) => i.revision_tecnica).length;
    const conFoto = ingresosFiltrados.filter((i) => i.foto_frontal).length;
    return { total, conSim, conSD, conRev, conFoto };
  }, [ingresosFiltrados]);

  // ── Ranking recepcionistas ────────────────────────────────────────────────
  const rankingRecep = useMemo(() => {
    const map = {};
    ingresosFiltrados.forEach((i) => {
      const id = String(i.usuario?.id_usuario ?? i.id_usuario ?? '?');
      const nom = i.usuario
        ? `${i.usuario.nombre ?? ''} ${i.usuario.apellido ?? ''}`.trim()
        : `Usuario ${id}`;
      if (!map[id]) map[id] = { nombre: nom, total: 0, conSim: 0, conSD: 0, conRevision: 0 };
      map[id].total++;
      if (i.sim) map[id].conSim++;
      if (i.memoria_sd) map[id].conSD++;
      if (i.revision_tecnica) map[id].conRevision++;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [ingresosFiltrados]);

  // ── Ingresos por día (orden cronológico) ──────────────────────────────────
  const ingPorDia = useMemo(() => {
    const diasMap = {};

    ingresosFiltrados.forEach((ingreso) => {
      if (!ingreso.fecha_ingreso) return;

      const fecha = new Date(ingreso.fecha_ingreso);
      const año = fecha.getFullYear();
      const mes = fecha.getMonth() + 1;
      const dia = fecha.getDate();

      const claveOrdenable = `${año}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      const label = `${dia}/${mes}`;

      if (!diasMap[claveOrdenable]) {
        diasMap[claveOrdenable] = { dia: label, total: 0, orden: fecha.getTime() };
      }
      diasMap[claveOrdenable].total++;
    });

    return Object.values(diasMap).sort((a, b) => a.orden - b.orden);
  }, [ingresosFiltrados]);
  // ── Promedio de ingresos por día ────────────────────────────────────────────
  const promedioPorDia = useMemo(() => {
    if (ingPorDia.length === 0) return 0;
    const total = ingPorDia.reduce((sum, dia) => sum + dia.total, 0);
    return (total / ingPorDia.length).toFixed(1);
  }, [ingPorDia]);

  // ── Día con más ingresos ────────────────────────────────────────────────────
  const diaConMasIngresos = useMemo(() => {
    if (ingPorDia.length === 0) return null;
    const max = Math.max(...ingPorDia.map((d) => d.total));
    const diaMax = ingPorDia.find((d) => d.total === max);
    return diaMax ? { dia: diaMax.dia, cantidad: max } : null;
  }, [ingPorDia]);

  // ── Top dispositivos más ingresados ───────────────────────────────────────
  const topDispositivos = useMemo(() => {
    const map = {};
    ingresosFiltrados.forEach((i) => {
      const marca = i.dispositivo?.modelo?.marca?.marca || 'Desconocida';
      const modelo = i.dispositivo?.modelo?.nombre_modelo || 'Desconocido';
      const nombre = `${marca} ${modelo}`.trim();
      map[nombre] = (map[nombre] || 0) + 1;
    });
    return Object.entries(map)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [ingresosFiltrados]);

  // ── Comparativa mes actual vs anterior ────────────────────────────────────
  const comparativaMensual = useMemo(() => {
    const ahora = new Date();
    const mesActual = ahora.getMonth();
    const añoActual = ahora.getFullYear();
    const mesAnterior = mesActual === 0 ? 11 : mesActual - 1;
    const añoAnterior = mesActual === 0 ? añoActual - 1 : añoActual;

    const ingresosMesActual = ingresos.filter((i) => {
      const fecha = new Date(i.fecha_ingreso);
      return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
    }).length;

    const ingresosMesAnterior = ingresos.filter((i) => {
      const fecha = new Date(i.fecha_ingreso);
      return fecha.getMonth() === mesAnterior && fecha.getFullYear() === añoAnterior;
    }).length;

    const variacion =
      ingresosMesAnterior === 0
        ? 100
        : Math.round(((ingresosMesActual - ingresosMesAnterior) / ingresosMesAnterior) * 100);

    return { actual: ingresosMesActual, anterior: ingresosMesAnterior, variacion };
  }, [ingresos]);
  // ── Ingresos por hora específica (Mañana o Tarde) ───────────────────────────
  const ingresosPorHora = useMemo(() => {
    // Definir horas según selección
    let horas = [];
    let rangoHoras = '';

    if (tipoHorario === 'manana') {
      horas = [8, 9, 10, 11, 12, 13];
      rangoHoras = 'mañana';
    } else {
      horas = [14, 15, 16, 17, 18, 19, 20, 21];
      rangoHoras = 'tarde';
    }

    // Inicializar contador para cada hora
    const contador = {};
    horas.forEach((h) => {
      contador[h] = 0;
    });

    // Contar ingresos por hora
    ingresosFiltrados.forEach((ingreso) => {
      if (!ingreso.fecha_ingreso) return;
      const fecha = new Date(ingreso.fecha_ingreso);
      const hora = fecha.getHours();

      if (horas.includes(hora)) {
        contador[hora]++;
      }
    });

    // Convertir a array para el gráfico
    return Object.entries(contador)
      .map(([hora, cantidad]) => ({
        hora: `${hora}:00`,
        cantidad,
        horaNum: parseInt(hora),
      }))
      .sort((a, b) => a.horaNum - b.horaNum);
  }, [ingresosFiltrados, tipoHorario]);

  // ── Promedio por hora en el rango seleccionado ──────────────────────────────
  const promedioPorHora = useMemo(() => {
    const total = ingresosPorHora.reduce((sum, h) => sum + h.cantidad, 0);
    const horasConDatos = ingresosPorHora.filter((h) => h.cantidad > 0).length;
    return horasConDatos > 0 ? (total / horasConDatos).toFixed(1) : 0;
  }, [ingresosPorHora]);

  // ── Revisión ──────────────────────────────────────────────
  const pieAccesorios = useMemo(() => {
    const conRevision = kpis.conRev;
    const sinRevision = kpis.total - conRevision;

    return [
      { name: 'Con Revisión Técnica', value: conRevision, color: '#10b981' },
      { name: 'Sin Revisión Técnica', value: sinRevision, color: '#f59e0b' },
    ].filter((d) => d.value > 0);
  }, [kpis]);

  // ── Render: loading / error ───────────────────────────────────────────────
  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 300,
          gap: 12,
          color: '#6366f1',
        }}
      >
        <Spinner animation="border" size="sm" />
        <span style={{ fontWeight: 600 }}>Cargando reporte...</span>
      </div>
    );

  if (error)
    return (
      <Alert variant="danger" style={{ borderRadius: 10 }}>
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </Alert>
    );

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <div className="reporte-wrap" ref={pdfRef}>
      {/* Header */}
      <div className="reporte-header">
        <div className="reporte-header-top">
          <div>
            <h2>📊 Reporte de Recepción</h2>
            <p>
              {ingresosFiltrados.length} ingresos analizados
              {fechaDesde &&
                fechaHasta &&
                ` · ${formatearFecha(fechaDesde)} → ${formatearFecha(fechaHasta)}`}
              {filtroRecep !== 'todos' && ` · ${recepcionistas[filtroRecep] ?? 'Recepcionista'}`}
            </p>
          </div>
          <BtnExportarPDF
            onClick={handleExportarPDF}
            exportando={exportando}
            disabled={ingresosFiltrados.length === 0}
          />
        </div>
      </div>

      {/* 📅 Selector de rango de fechas DINÁMICO */}
      {/* 📅 Selector de rango de fechas DINÁMICO */}
      <div className="reporte-filtros">
        {/* Primera fila: presets */}
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

        {/* Segunda fila: fechas personalizadas */}
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

        {/* Tercera fila: otros filtros */}
        <div className="filtros-separator"></div>

        <div className="filtros-row">
          <select
            className="reporte-select"
            value={filtroRecep}
            onChange={(e) => setFiltroRecep(e.target.value)}
          >
            <option value="todos">👤 Todos los recepcionistas</option>
            {Object.entries(recepcionistas).map(([id, nom]) => (
              <option key={id} value={id}>
                {nom}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 📈 Resumen ejecutivo (NUEVO) */}
      {/* 📈 Resumen ejecutivo */}
      <div className="resumen-ejecutivo">
        <div className="resumen-card">
          <span className="resumen-icon">📈</span>
          <div>
            <strong>Variación mensual</strong>
            <span
              className={`variacion ${comparativaMensual.variacion >= 0 ? 'positiva' : 'negativa'}`}
            >
              {comparativaMensual.variacion >= 0 ? '+' : ''}
              {comparativaMensual.variacion}%
            </span>
            <small>
              {comparativaMensual.anterior} → {comparativaMensual.actual} ingresos
            </small>
          </div>
        </div>

        <div className="resumen-card">
          <span className="resumen-icon">📱</span>
          <div>
            <strong>Dispositivo más común</strong>
            <span>{topDispositivos[0]?.nombre || '—'}</span>
            <small>{topDispositivos[0]?.cantidad || 0} unidades</small>
          </div>
        </div>

        {/* ✅ Promedio por día */}
        <div className="resumen-card">
          <span className="resumen-icon">📊</span>
          <div>
            <strong>Promedio diario</strong>
            <span>{promedioPorDia}</span>
            <small>ingresos/día</small>
          </div>
        </div>

        {/* ✅ Día récord */}
        <div className="resumen-card">
          <span className="resumen-icon">🔥</span>
          <div>
            <strong>Día récord</strong>
            <span>{diaConMasIngresos ? diaConMasIngresos.dia : '—'}</span>
            <small>
              {diaConMasIngresos ? `${diaConMasIngresos.cantidad} ingresos` : 'sin datos'}
            </small>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        {[
          {
            label: 'Total Ingresos',
            value: kpis.total,
            sub: 'dispositivos registrados',
            icon: '📱',
          },
          {
            label: 'Con SIM',
            value: kpis.conSim,
            sub: `${kpis.total ? Math.round((kpis.conSim / kpis.total) * 100) : 0}% del total`,
            icon: '📶',
          },
          {
            label: 'Con Memoria SD',
            value: kpis.conSD,
            sub: `${kpis.total ? Math.round((kpis.conSD / kpis.total) * 100) : 0}% del total`,
            icon: '💾',
          },
          {
            label: 'Con Revisión',
            value: kpis.conRev,
            sub: `${kpis.total ? Math.round((kpis.conRev / kpis.total) * 100) : 0}% del total`,
            icon: '🔧',
          },
          {
            label: 'Con Foto',
            value: kpis.conFoto,
            sub: `${kpis.total ? Math.round((kpis.conFoto / kpis.total) * 100) : 0}% del total`,
            icon: '📷',
          },
        ].map((k) => (
          <div className="kpi-card" key={k.label}>
            <div className="kpi-label">
              {k.icon} {k.label}
            </div>
            <div className="kpi-value">{k.value}</div>
            <div className="kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Gráficas fila 1 */}
      <div className="charts-grid-2">
        {/* Ranking barras */}
        <div className="chart-card">
          <div className="chart-card-title">
            <span className="title-icon">
              <i className="fas fa-trophy"></i>
            </span>
            <span>Ranking Recepcionistas</span>
          </div>
          {rankingRecep.length === 0 ? (
            <p className="chart-empty">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={rankingRecep} margin={{ top: 0, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="nombre"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  allowDecimals={false}
                  domain={[0, 'dataMax']}
                  tickCount={Math.max(...rankingRecep.map((r) => r.total), 1) + 1}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total" name="Ingresos" radius={[6, 6, 0, 0]}>
                  {rankingRecep.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top dispositivos (NUEVO) */}
        {/* Top dispositivos (NUEVO) - Versión DONA */}
        <div className="chart-card">
          <div className="chart-card-title">
            <span className="title-icon">
              <i className="fas fa-mobile-alt"></i>
            </span>
            <span>Top 5 Dispositivos</span>
          </div>
          {topDispositivos.length === 0 ? (
            <p className="chart-empty">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={topDispositivos}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="cantidad"
                  nameKey="nombre"
                  // label={({ nombre, percent }) => `${nombre}: ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                >
                  {topDispositivos.map((entry, index) => (
                    <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ fontSize: 11 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Gráfica evolución diaria */}
      <div className="chart-card">
        <div className="chart-card-title">
          <span className="title-icon">
            <i className="fas fa-calendar-alt"></i>
          </span>
          <span>Evolución de Ingresos por Día</span>
        </div>
        {ingPorDia.length === 0 ? (
          <p className="chart-empty">Sin datos para el período seleccionado</p>
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ingPorDia} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="total"
                name="Ingresos"
                stroke="#6366f1"
                strokeWidth={2}
                fill="url(#gradIngresos)"
                dot={{ r: 3, fill: '#6366f1' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Gráfica de ingresos por hora específica */}
      <div className="chart-card">
        <div className="chart-card-title">
          <span className="title-icon">
            <i className="fas fa-chart-bar"></i>
          </span>
          <span>📊 Ingresos por Hora</span>
          <div className="horario-selector">
            <button
              className={`horario-btn ${tipoHorario === 'manana' ? 'active' : ''}`}
              onClick={() => setTipoHorario('manana')}
            >
              <Sun size={16} style={{ marginRight: '4px' }} />
              Mañana (8-13)
            </button>
            <button
              className={`horario-btn ${tipoHorario === 'tarde' ? 'active' : ''}`}
              onClick={() => setTipoHorario('tarde')}
            >
              <Sunset size={16} style={{ marginRight: '4px' }} />
              Tarde (12-21)
            </button>
          </div>
        </div>

        <div className="promedio-horario">
          <span className="promedio-label">📈 Promedio por hora:</span>
          <span className="promedio-valor">{promedioPorHora} ingresos/hora</span>
          <span className="promedio-rango">
            en el período{' '}
            {fechaDesde && fechaHasta
              ? `${formatearFecha(fechaDesde)} → ${formatearFecha(fechaHasta)}`
              : 'seleccionado'}
          </span>
        </div>

        {ingresosPorHora.every((h) => h.cantidad === 0) ? (
          <p className="chart-empty">
            Sin ingresos en el horario{' '}
            {tipoHorario === 'manana' ? 'de la mañana (7-12)' : 'de la tarde (13-20)'}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ingresosPorHora} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="hora"
                tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                label={{
                  value: 'Hora del día',
                  position: 'bottom',
                  offset: 0,
                  fontSize: 11,
                  fill: '#94a3b8',
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#64748b' }}
                allowDecimals={false}
                domain={[0, 'dataMax']}
                axisLine={{ stroke: '#cbd5e1' }}
                tickLine={false}
                label={{
                  value: 'Cantidad de ingresos',
                  angle: -90,
                  position: 'left',
                  offset: 0,
                  fontSize: 11,
                  fill: '#94a3b8',
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="cantidad"
                name="Ingresos"
                fill="#6366f1"
                radius={[6, 6, 0, 0]}
                barSize={45}
                label={{
                  position: 'top',
                  fontSize: 12,
                  fill: '#6366f1',
                  fontWeight: 600,
                  formatter: (value) => (value > 0 ? value : ''),
                }}
              >
                {ingresosPorHora.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={
                      entry.cantidad === Math.max(...ingresosPorHora.map((h) => h.cantidad)) &&
                      entry.cantidad > 0
                        ? '#f59e0b'
                        : '#6366f1'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Pie accesorios */}
      <div className="charts-grid-2">
        <div className="chart-card">
          <div className="chart-card-title">
            <span className="title-icon">
              <i className="fas fa-chart-pie"></i>
            </span>
            <span> Revisión</span>
          </div>
          {pieAccesorios.length === 0 ? (
            <p className="chart-empty">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieAccesorios}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieAccesorios.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Tabla ranking detallado */}
        <div className="chart-card">
          <div className="chart-card-title">
            <span className="title-icon">
              <i className="fas fa-list-ol"></i>
            </span>
            <span>Detalle por Recepcionista</span>
          </div>
          {rankingRecep.length === 0 ? (
            <p className="chart-empty">Sin datos</p>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: 250, overflowY: 'auto' }}>
              <table className="ranking-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Recepcionista</th>
                    <th>Total</th>
                    <th>Con SIM</th>
                    <th>Con SD</th>
                    <th>Con Revisión</th>
                    <th>Participación</th>
                  </tr>
                </thead>
                <tbody>
                  {rankingRecep.map((r, i) => {
                    const pct = kpis.total ? Math.round((r.total / kpis.total) * 100) : 0;
                    const posClass =
                      i === 0 ? 'pos-1' : i === 1 ? 'pos-2' : i === 2 ? 'pos-3' : 'pos-n';
                    return (
                      <tr key={i}>
                        <td>
                          <span className={`badge-rank ${posClass}`}>{i + 1}</span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{r.nombre}</td>
                        <td className="col-total">{r.total}</td>
                        <td>{r.conSim}</td>
                        <td>{r.conSD}</td>
                        <td>{r.conRevision}</td>
                        <td>
                          <div className="participation-wrap">
                            <div className="bar-pill" style={{ width: `${pct}%` }}></div>
                            <span className="participation-pct">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 📋 Tabla de ingresos DETALLADA (NUEVO) */}
      <div className="chart-card" style={{ marginTop: 16 }}>
        <div className="chart-card-title">
          <span className="title-icon">
            <i className="fas fa-list"></i>
          </span>
          <span> Ingresos registrados</span>
          <Badge bg="primary" style={{ marginLeft: 10 }}>
            {ingresosFiltrados.length} registros
          </Badge>
          <button className="toggle-detalle-btn" onClick={() => setVerDetalle(!verDetalle)}>
            {verDetalle ? 'Ocultar detalle' : 'Ver detalle'}
          </button>
        </div>

        {verDetalle &&
          (ingresosFiltrados.length === 0 ? (
            <p className="chart-empty">Sin ingresos en el período seleccionado</p>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: 400, overflowY: 'auto' }}>
              <table className="detalle-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Dispositivo</th>
                    <th>Recepcionista asignado</th>
                    <th>SIM</th>
                    <th>SD</th>
                    <th>Revisión</th>
                  </tr>
                </thead>
                <tbody>
                  {ingresosFiltrados.slice(0, 100).map((ing, idx) => (
                    <tr key={idx}>
                      <td>{formatearFecha(ing.fecha_ingreso)}</td>
                      <td>
                        {ing.dispositivo?.cliente?.nombre} {ing.dispositivo?.cliente?.apellido}
                      </td>
                      <td>
                        {ing.dispositivo?.modelo?.marca?.marca}{' '}
                        {ing.dispositivo?.modelo?.nombre_modelo}
                      </td>
                      <td>
                        {ing.usuario?.nombre} {ing.usuario?.apellido}
                      </td>
                      {ing.sim ? (
                        <CheckCircle size={18} className="text-success" />
                      ) : (
                        <XCircle size={18} className="text-danger" />
                      )}
                      <td className="text-center">
                        {ing.memoria_sd ? (
                          <CheckCircle size={18} className="text-success" />
                        ) : (
                          <XCircle size={18} className="text-danger" />
                        )}
                      </td>
                      <td className="text-center">
                        {ing.revision_tecnica ? (
                          <CheckCircle size={18} className="text-success" />
                        ) : (
                          <XCircle size={18} className="text-danger" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {ingresosFiltrados.length > 100 && (
                <p className="text-muted text-center mt-2">
                  Mostrando 100 de {ingresosFiltrados.length} ingresos
                </p>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ReporteRecepcion;
