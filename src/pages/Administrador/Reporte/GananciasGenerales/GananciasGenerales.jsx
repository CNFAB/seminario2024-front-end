// src/pages/Administrador/Reporte/Ganancias/GananciasGenerales.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';
import reparacionService from '../../../../services/ReparacionService';
import { usuarioService } from '../../../../services/UsuarioService';
import BtnExportarPDF from '../Componentes/BtnExportarPDF';
import { exportarPDF } from '../Componentes/exportarPDF';
import './GananciasGenerales.css';

// ── Helpers ───────────────────────────────────────────────────────────────────
const limpiarNumero = (v) => {
  if (v === null || v === undefined) return 0;
  if (typeof v === 'number') return isNaN(v) ? 0 : v;
  const limpio = String(v)
    .replace(/[^0-9.,-]/g, '')
    .replace(',', '.');
  const n = parseFloat(limpio);
  return isNaN(n) ? 0 : n;
};

const fmt = (n) =>
  Number(n ?? 0).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtShort = (n) => {
  const v = Number(n ?? 0);
  if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `$${(v / 1_000).toFixed(0)}k`;
  return `$${v.toFixed(0)}`;
};

const iniciales = (nombre) =>
  nombre
    .split(' ')
    .map((w) => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');

const margenColor = (m) =>
  m >= 50 ? 'var(--g-green)' : m >= 30 ? 'var(--g-amber)' : 'var(--g-red)';

// ── Tooltip personalizado ─────────────────────────────────────────────────────
const GTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="g-tooltip">
      <div className="g-tooltip-label">{label}</div>
      {payload.map((p) => (
        <div className="g-tooltip-row" key={p.dataKey}>
          <span className="g-tooltip-dot" style={{ background: p.color }} />
          <span>{p.name}</span>
          <span className="g-tooltip-val">
            {p.dataKey === 'margen' ? `${p.value}%` : `$${fmt(p.value)}`}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Paginación ────────────────────────────────────────────────────────────────
const Paginacion = ({ pagina, total, onChange }) => {
  if (total <= 1) return null;
  return (
    <div className="g-pagination">
      <span className="g-pagination-info">
        Página {pagina} de {total}
      </span>
      <button className="g-pagination-btn" onClick={() => onChange(1)} disabled={pagina === 1}>
        <i className="fas fa-angle-double-left" />
      </button>
      <button
        className="g-pagination-btn"
        onClick={() => onChange(pagina - 1)}
        disabled={pagina === 1}
      >
        <i className="fas fa-angle-left" />
      </button>
      <button
        className="g-pagination-btn"
        onClick={() => onChange(pagina + 1)}
        disabled={pagina === total}
      >
        <i className="fas fa-angle-right" />
      </button>
      <button
        className="g-pagination-btn"
        onClick={() => onChange(total)}
        disabled={pagina === total}
      >
        <i className="fas fa-angle-double-right" />
      </button>
    </div>
  );
};

// ── Presets de fecha ──────────────────────────────────────────────────────────
const PRESETS = [
  { key: 'ultimos7', label: '7 días' },
  { key: 'ultimos15', label: '15 días' },
  { key: 'ultimos30', label: '30 días' },
  { key: 'esteMes', label: 'Este mes' },
  { key: 'mesPasado', label: 'Mes pasado' },
  { key: 'ultimos3meses', label: '3 meses' },
  { key: 'ultimos6meses', label: '6 meses' },
  { key: 'anioActual', label: 'Este año' },
];

const calcRango = (preset) => {
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
    case 'ultimos3meses':
      desde.setMonth(hoy.getMonth() - 3);
      break;
    case 'ultimos6meses':
      desde.setMonth(hoy.getMonth() - 6);
      break;
    case 'anioActual':
      desde = new Date(hoy.getFullYear(), 0, 1);
      break;
    default:
      return null;
  }
  return {
    desde: desde.toISOString().split('T')[0],
    hasta: hasta.toISOString().split('T')[0],
  };
};

// ── Componente principal ──────────────────────────────────────────────────────
const GananciasGenerales = () => {
  const [reparaciones, setReparaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState('ultimos30');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [exportando, setExportando] = useState(false);
  const [chartView, setChartView] = useState('area'); // 'area' | 'bar'
  const [itemsPorPagina, setItemsPorPagina] = useState(10);
  const [pagTecnicos, setPagTecnicos] = useState(1);
  const [pagPiezas, setPagPiezas] = useState(1);
  const [pagMarcas, setPagMarcas] = useState(1);
  const pdfRef = useRef(null);

  // ── Carga ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const resRep = await reparacionService.obtenerTodas();
        const reps = resRep?.data?.data ?? resRep?.data ?? resRep ?? [];
        setReparaciones(Array.isArray(reps) ? reps : []);
        const rango = calcRango('ultimos30');
        if (rango) {
          setFechaDesde(rango.desde);
          setFechaHasta(rango.hasta);
        }
      } catch (e) {
        console.error(e);
        setError('No se pudieron cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const aplicarPreset = (preset) => {
    setPeriodo(preset);
    const rango = calcRango(preset);
    if (rango) {
      setFechaDesde(rango.desde);
      setFechaHasta(rango.hasta);
    }
  };

  // ── Filtrado ───────────────────────────────────────────────────────────────
  const repFiltradas = useMemo(() => {
    if (!fechaDesde || !fechaHasta) return reparaciones;
    const desde = new Date(fechaDesde + 'T00:00:00');
    const hasta = new Date(fechaHasta + 'T23:59:59');
    return reparaciones.filter((r) => {
      const f = new Date(r.created_at ?? r.fecha_creacion ?? r.fecha);
      return f >= desde && f <= hasta;
    });
  }, [reparaciones, fechaDesde, fechaHasta]);

  // ── Multiples ─────────────────────────────────────────────────────────────
  const multiples = useMemo(() => {
    const acc = [];
    repFiltradas.forEach((rep) => {
      (rep.reparaciones_multiples ?? rep.reparacionesMultiples ?? []).forEach((item) => {
        acc.push({
          ...item,
          id_reparacion: rep.id_reparacion || rep.id,
          tecnico: rep.usuario || rep.tecnico,
          fecha: rep.created_at || rep.fecha_creacion || rep.fecha,
          precio_total: limpiarNumero(item.precio_total),
          precio_pieza_momento: limpiarNumero(item.precio_pieza_momento),
        });
      });
    });
    return acc;
  }, [repFiltradas]);

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    let ingresos = 0,
      costos = 0;
    multiples.forEach((m) => {
      ingresos += m.precio_total;
      costos += m.precio_pieza_momento;
    });
    const ganancia = ingresos - costos;
    const margen = ingresos > 0 ? Math.round((ganancia / ingresos) * 100) : 0;
    return { ingresos, costos, ganancia, margen, trabajos: multiples.length };
  }, [multiples]);

  // ── Evolución mensual ─────────────────────────────────────────────────────
  const evolucion = useMemo(() => {
    const map = new Map();
    multiples.forEach((m) => {
      const f = new Date(m.fecha);
      const key = `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}`;
      const label = f.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
      if (!map.has(key)) map.set(key, { key, mes: label, ingresos: 0, costos: 0 });
      const d = map.get(key);
      d.ingresos += m.precio_total;
      d.costos += m.precio_pieza_momento;
    });
    return Array.from(map.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((d) => ({
        ...d,
        ganancia: d.ingresos - d.costos,
        margen: d.ingresos > 0 ? Math.round(((d.ingresos - d.costos) / d.ingresos) * 100) : 0,
      }));
  }, [multiples]);

  // ── Por técnico ───────────────────────────────────────────────────────────
  const porTecnico = useMemo(() => {
    const map = new Map();
    multiples.forEach((m) => {
      const t = m.tecnico;
      const id = t?.id_usuario ?? '?';
      const nombre = t ? `${t.nombre ?? ''} ${t.apellido ?? ''}`.trim() : 'Sin asignar';
      if (!map.has(id)) map.set(id, { id, nombre, ingresos: 0, costos: 0, trabajos: 0 });
      const d = map.get(id);
      d.ingresos += m.precio_total;
      d.costos += m.precio_pieza_momento;
      d.trabajos++;
    });
    return Array.from(map.values())
      .map((d) => ({
        ...d,
        ganancia: d.ingresos - d.costos,
        margen: d.ingresos > 0 ? Math.round(((d.ingresos - d.costos) / d.ingresos) * 100) : 0,
      }))
      .sort((a, b) => b.ganancia - a.ganancia);
  }, [multiples]);

  // ── Por pieza ─────────────────────────────────────────────────────────────
  const porPieza = useMemo(() => {
    const map = new Map();
    multiples.forEach((m) => {
      const p = m.pieza;
      const id = p?.id_pieza ?? '?';
      const nombre = p?.nombre_pieza ?? `Pieza #${id}`;
      if (!map.has(id)) map.set(id, { id, nombre, ingresos: 0, costos: 0, veces: 0 });
      const d = map.get(id);
      d.ingresos += m.precio_total;
      d.costos += m.precio_pieza_momento;
      d.veces++;
    });
    return Array.from(map.values())
      .map((d) => ({
        ...d,
        ganancia: d.ingresos - d.costos,
        margen: d.ingresos > 0 ? Math.round(((d.ingresos - d.costos) / d.ingresos) * 100) : 0,
      }))
      .sort((a, b) => b.ganancia - a.ganancia)
      .slice(0, 50);
  }, [multiples]);

  // ── Por marca ─────────────────────────────────────────────────────────────
  const porMarca = useMemo(() => {
    const map = new Map();
    multiples.forEach((m) => {
      const rep = repFiltradas.find((r) => r.id_reparacion === m.id_reparacion);
      const disp = rep?.ingreso?.dispositivo || rep?.diagnostico?.ingreso?.dispositivo;
      const marca = disp?.modelo?.marca?.marca || 'Sin marca';
      if (!map.has(marca)) map.set(marca, { marca, ingresos: 0, costos: 0, trabajos: 0 });
      const d = map.get(marca);
      d.ingresos += m.precio_total;
      d.costos += m.precio_pieza_momento;
      d.trabajos++;
    });
    return Array.from(map.values())
      .filter((m) => m.marca !== 'Sin marca')
      .map((d) => ({
        ...d,
        ganancia: d.ingresos - d.costos,
        margen: d.ingresos > 0 ? Math.round(((d.ingresos - d.costos) / d.ingresos) * 100) : 0,
      }))
      .sort((a, b) => b.ganancia - a.ganancia);
  }, [multiples, repFiltradas]);

  // ── Paginados ─────────────────────────────────────────────────────────────
  const slice = (arr, pag) => arr.slice((pag - 1) * itemsPorPagina, pag * itemsPorPagina);
  const pages = (arr) => Math.ceil(arr.length / itemsPorPagina);

  useEffect(() => {
    setPagTecnicos(1);
    setPagPiezas(1);
    setPagMarcas(1);
  }, [fechaDesde, fechaHasta, itemsPorPagina]);

  const handleExportar = async () => {
    setExportando(true);
    try {
      await exportarPDF(pdfRef, 'Ganancias_Generales', 'Reporte de Ganancias');
    } catch (e) {
      console.error(e);
    } finally {
      setExportando(false);
    }
  };

  // ── Render: loading / error ────────────────────────────────────────────────
  if (loading)
    return (
      <div className="g-loading">
        <div className="g-loading-spinner" />
        Cargando datos financieros...
      </div>
    );
  if (error) return <div style={{ padding: 24, color: 'var(--g-red)' }}>{error}</div>;

  const fechaLabel =
    fechaDesde && fechaHasta
      ? `${new Date(fechaDesde).toLocaleDateString('es-AR')} → ${new Date(fechaHasta).toLocaleDateString('es-AR')}`
      : '';

  return (
    <div className="g-wrap" ref={pdfRef}>
      {/* ── Header ── */}
      <div className="g-header">
        <div className="g-header-left">
          <h2>Ganancias Generales</h2>
          <p>{fechaLabel || 'Seleccioná un período para ver los datos'}</p>
        </div>
        <button className="g-export-btn" onClick={handleExportar} disabled={exportando}>
          <i className={`fas ${exportando ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`} />
          {exportando ? 'Exportando...' : 'Exportar PDF'}
        </button>
      </div>

      {/* ── Filtros ── */}
      <div className="g-filtros">
        <span className="g-filtros-label">Período</span>
        <div className="g-presets">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              className={`g-preset-btn ${periodo === p.key ? 'active' : ''}`}
              onClick={() => aplicarPreset(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="g-date-range">
          <span>Desde</span>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => {
              setFechaDesde(e.target.value);
              setPeriodo('custom');
            }}
          />
          <span>Hasta</span>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => {
              setFechaHasta(e.target.value);
              setPeriodo('custom');
            }}
          />
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="g-kpi-grid">
        <div className="g-kpi-card ingresos">
          <div className="g-kpi-icon">
            <i className="fas fa-arrow-trend-up" />
          </div>
          <div className="g-kpi-value">${fmt(kpis.ingresos)}</div>
          <div className="g-kpi-label">Ingresos Totales</div>
          <div className="g-kpi-sub">
            {kpis.trabajos} trabajo{kpis.trabajos !== 1 ? 's' : ''}
          </div>
        </div>
        <div className="g-kpi-card costos">
          <div className="g-kpi-icon">
            <i className="fas fa-box" />
          </div>
          <div className="g-kpi-value">${fmt(kpis.costos)}</div>
          <div className="g-kpi-label">Costo de Piezas</div>
          <div className="g-kpi-sub">
            {kpis.ingresos > 0 ? Math.round((kpis.costos / kpis.ingresos) * 100) : 0}% de los
            ingresos
          </div>
        </div>
        <div className="g-kpi-card ganancia">
          <div className="g-kpi-icon">
            <i className="fas fa-sack-dollar" />
          </div>
          <div
            className="g-kpi-value"
            style={{ color: kpis.ganancia >= 0 ? 'var(--g-green)' : 'var(--g-red)' }}
          >
            ${fmt(kpis.ganancia)}
          </div>
          <div className="g-kpi-label">Ganancia Neta</div>
          <div className="g-kpi-sub">
            ${fmt(kpis.ganancia / (kpis.trabajos || 1))} promedio/trabajo
          </div>
        </div>
        <div className="g-kpi-card margen">
          <div className="g-kpi-icon">
            <i className="fas fa-percent" />
          </div>
          <div className="g-kpi-value" style={{ color: margenColor(kpis.margen) }}>
            {kpis.margen}%
          </div>
          <div className="g-kpi-label">Margen de Ganancia por mano de obra</div>
          <div className="g-kpi-sub">
            {kpis.margen >= 50 ? 'Excelente' : kpis.margen >= 30 ? 'Bueno' : 'Mejorable'}
          </div>
        </div>
      </div>

      {/* ── Evolución mensual ── */}
      {evolucion.length > 0 && (
        <div className="g-card">
          <div className="g-card-header">
            <div className="g-card-title">
              <div className="g-card-icon">
                <i className="fas fa-chart-area" />
              </div>
              <div>
                <h3>Evolución mensual</h3>
                <p>Ingresos, costos y ganancia neta por mes</p>
              </div>
            </div>
            <div className="g-chart-tabs">
              <button
                className={`g-chart-tab ${chartView === 'area' ? 'active' : ''}`}
                onClick={() => setChartView('area')}
              >
                Área
              </button>
              <button
                className={`g-chart-tab ${chartView === 'bar' ? 'active' : ''}`}
                onClick={() => setChartView('bar')}
              >
                Barras
              </button>
            </div>
          </div>

          <div className="g-chart-container">
            <ResponsiveContainer width="100%" height={280}>
              {chartView === 'area' ? (
                <AreaChart data={evolucion} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gCostos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gGanancia" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ed" />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 11, fill: '#a09d98' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#a09d98' }}
                    tickFormatter={fmtShort}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                  />
                  <Tooltip content={<GTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    name="Ingresos"
                    stroke="#2563eb"
                    strokeWidth={2}
                    fill="url(#gIngresos)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="costos"
                    name="Costo piezas"
                    stroke="#dc2626"
                    strokeWidth={2}
                    fill="url(#gCostos)"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="ganancia"
                    name="Ganancia"
                    stroke="#16a34a"
                    strokeWidth={2.5}
                    fill="url(#gGanancia)"
                    dot={{ r: 3, fill: '#16a34a' }}
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={evolucion}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  barGap={2}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ed" vertical={false} />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 11, fill: '#a09d98' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#a09d98' }}
                    tickFormatter={fmtShort}
                    axisLine={false}
                    tickLine={false}
                    width={56}
                  />
                  <Tooltip content={<GTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
                  <Bar
                    dataKey="ingresos"
                    name="Ingresos"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="costos"
                    name="Costo piezas"
                    fill="#dc2626"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    dataKey="ganancia"
                    name="Ganancia"
                    fill="#16a34a"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Técnicos y Marcas en 2 columnas ── */}
      <div className="g-charts-2col">
        {/* Margen por técnico — barras horizontales */}
        <div className="g-card" style={{ marginBottom: 0 }}>
          <div className="g-card-header">
            <div className="g-card-title">
              <div className="g-card-icon">
                <i className="fas fa-users" />
              </div>
              <div>
                <h3>Rendimiento por técnico</h3>
                <p>Margen de ganancia individual</p>
              </div>
            </div>
          </div>
          {porTecnico.length === 0 ? (
            <div className="g-empty">
              <div className="g-empty-icon">👤</div>
              <p>Sin datos</p>
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(180, porTecnico.slice(0, 6).length * 46)}
            >
              <BarChart
                layout="vertical"
                data={porTecnico.slice(0, 6)}
                margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ed" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#a09d98' }}
                  tickFormatter={fmtShort}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  tick={{ fontSize: 11, fill: '#6b6860' }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip content={<GTooltip />} />
                <Bar dataKey="ganancia" name="Ganancia" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {porTecnico.slice(0, 6).map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        ['#2563eb', '#16a34a', '#7c3aed', '#d97706', '#dc2626', '#0891b2'][idx % 6]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top marcas — barras horizontales */}
        <div className="g-card" style={{ marginBottom: 0 }}>
          <div className="g-card-header">
            <div className="g-card-title">
              <div className="g-card-icon">
                <i className="fas fa-mobile-alt" />
              </div>
              <div>
                <h3>Ganancia por marca</h3>
                <p>Top marcas más rentables</p>
              </div>
            </div>
          </div>
          {porMarca.length === 0 ? (
            <div className="g-empty">
              <div className="g-empty-icon">📱</div>
              <p>Sin datos</p>
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={Math.max(180, porMarca.slice(0, 6).length * 46)}
            >
              <BarChart
                layout="vertical"
                data={porMarca.slice(0, 6)}
                margin={{ top: 0, right: 40, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f0ed" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fontSize: 10, fill: '#a09d98' }}
                  tickFormatter={fmtShort}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="marca"
                  tick={{ fontSize: 11, fill: '#6b6860' }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip content={<GTooltip />} />
                <Bar dataKey="ganancia" name="Ganancia" radius={[0, 4, 4, 0]} maxBarSize={20}>
                  {porMarca.slice(0, 6).map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        ['#0891b2', '#7c3aed', '#d97706', '#16a34a', '#2563eb', '#dc2626'][idx % 6]
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Tabla técnicos ── */}
      <div className="g-card">
        <div className="g-card-header">
          <div className="g-card-title">
            <div className="g-card-icon">
              <i className="fas fa-trophy" />
            </div>
            <div>
              <h3>Detalle por técnico</h3>
              <p>
                {porTecnico.length} técnico{porTecnico.length !== 1 ? 's' : ''} en el período
              </p>
            </div>
          </div>
          <div className="g-per-page">
            Mostrar
            <select
              value={itemsPorPagina}
              onChange={(e) => setItemsPorPagina(Number(e.target.value))}
            >
              {[5, 10, 20].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            por página
          </div>
        </div>
        {porTecnico.length === 0 ? (
          <div className="g-empty">
            <div className="g-empty-icon">👥</div>
            <p>Sin datos para el período</p>
          </div>
        ) : (
          <>
            <div className="g-table-wrap">
              <table className="g-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Técnico</th>
                    <th>Trabajos</th>
                    <th>Ingresos</th>
                    <th>Costo piezas</th>
                    <th>Ganancia</th>
                    <th>Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {slice(porTecnico, pagTecnicos).map((t, i) => {
                    const rank = (pagTecnicos - 1) * itemsPorPagina + i;
                    return (
                      <tr key={t.id}>
                        <td>
                          <span
                            className={`g-rank ${rank === 0 ? 'r1' : rank === 1 ? 'r2' : rank === 2 ? 'r3' : ''}`}
                          >
                            {rank + 1}
                          </span>
                        </td>
                        <td>
                          <div className="g-name-cell">
                            <div className="g-avatar">{iniciales(t.nombre)}</div>
                            <div>
                              <div className="g-name-text">{t.nombre}</div>
                              <div className="g-name-sub">{t.trabajos} trabajos</div>
                            </div>
                          </div>
                        </td>
                        <td className="g-val muted">{t.trabajos}</td>
                        <td className="g-val blue">${fmt(t.ingresos)}</td>
                        <td className="g-val red">${fmt(t.costos)}</td>
                        <td className="g-val green">${fmt(t.ganancia)}</td>
                        <td>
                          <div className="g-margen">
                            <div className="g-margen-track">
                              <div
                                className="g-margen-fill"
                                style={{
                                  width: `${Math.min(t.margen, 100)}%`,
                                  background: margenColor(t.margen),
                                }}
                              />
                            </div>
                            <span className="g-margen-pct">{t.margen}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Paginacion pagina={pagTecnicos} total={pages(porTecnico)} onChange={setPagTecnicos} />
          </>
        )}
      </div>

      {/* ── Tabla piezas ── */}
      <div className="g-card">
        <div className="g-card-header">
          <div className="g-card-title">
            <div className="g-card-icon">
              <i className="fas fa-microchip" />
            </div>
            <div>
              <h3>Top piezas por ganancia</h3>
              <p>{porPieza.length} piezas utilizadas en el período</p>
            </div>
          </div>
        </div>
        {porPieza.length === 0 ? (
          <div className="g-empty">
            <div className="g-empty-icon">🔧</div>
            <p>Sin datos</p>
          </div>
        ) : (
          <>
            <div className="g-table-wrap">
              <table className="g-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Pieza</th>
                    <th>Usos</th>
                    <th>Ingresos</th>
                    <th>Costo</th>
                    <th>Ganancia</th>
                    <th>Margen</th>
                  </tr>
                </thead>
                <tbody>
                  {slice(porPieza, pagPiezas).map((p, i) => (
                    <tr key={p.id}>
                      <td>
                        <span className="g-rank">{(pagPiezas - 1) * itemsPorPagina + i + 1}</span>
                      </td>
                      <td>
                        <span className="g-name-text">{p.nombre}</span>
                      </td>
                      <td className="g-val muted">{p.veces}×</td>
                      <td className="g-val blue">${fmt(p.ingresos)}</td>
                      <td className="g-val red">${fmt(p.costos)}</td>
                      <td className="g-val green">${fmt(p.ganancia)}</td>
                      <td>
                        <div className="g-margen">
                          <div className="g-margen-track">
                            <div
                              className="g-margen-fill"
                              style={{
                                width: `${Math.min(p.margen, 100)}%`,
                                background: margenColor(p.margen),
                              }}
                            />
                          </div>
                          <span className="g-margen-pct">{p.margen}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginacion pagina={pagPiezas} total={pages(porPieza)} onChange={setPagPiezas} />
          </>
        )}
      </div>

      {/* ── Tabla marcas ── */}
      {porMarca.length > 0 && (
        <div className="g-card">
          <div className="g-card-header">
            <div className="g-card-title">
              <div className="g-card-icon">
                <i className="fas fa-trademark" />
              </div>
              <div>
                <h3>Rentabilidad por marca</h3>
                <p>{porMarca.length} marcas en el período</p>
              </div>
            </div>
          </div>
          <div className="g-table-wrap">
            <table className="g-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Marca</th>
                  <th>Trabajos</th>
                  <th>Ingresos</th>
                  <th>Costo</th>
                  <th>Ganancia</th>
                  <th>Margen</th>
                </tr>
              </thead>
              <tbody>
                {slice(porMarca, pagMarcas).map((m, i) => (
                  <tr key={m.marca}>
                    <td>
                      <span className="g-rank">{(pagMarcas - 1) * itemsPorPagina + i + 1}</span>
                    </td>
                    <td>
                      <span className="g-name-text">{m.marca}</span>
                    </td>
                    <td className="g-val muted">{m.trabajos}</td>
                    <td className="g-val blue">${fmt(m.ingresos)}</td>
                    <td className="g-val red">${fmt(m.costos)}</td>
                    <td className="g-val green">${fmt(m.ganancia)}</td>
                    <td>
                      <div className="g-margen">
                        <div className="g-margen-track">
                          <div
                            className="g-margen-fill"
                            style={{
                              width: `${Math.min(m.margen, 100)}%`,
                              background: margenColor(m.margen),
                            }}
                          />
                        </div>
                        <span className="g-margen-pct">{m.margen}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Paginacion pagina={pagMarcas} total={pages(porMarca)} onChange={setPagMarcas} />
        </div>
      )}

      {/* ── Resumen ejecutivo ── */}
      <div className="g-card">
        <div className="g-card-header">
          <div className="g-card-title">
            <div className="g-card-icon">
              <i className="fas fa-chart-pie" />
            </div>
            <div>
              <h3>Resumen del período</h3>
            </div>
          </div>
        </div>
        <div className="g-resumen-grid">
          <div className="g-resumen-item">
            <div className="g-resumen-label">💰 Ingreso promedio / trabajo</div>
            <div className="g-resumen-value">${fmt(kpis.ingresos / (kpis.trabajos || 1))}</div>
          </div>
          <div className="g-resumen-item">
            <div className="g-resumen-label">📦 Costo promedio / trabajo</div>
            <div className="g-resumen-value">${fmt(kpis.costos / (kpis.trabajos || 1))}</div>
          </div>
          <div className="g-resumen-item">
            <div className="g-resumen-label">💪 Ganancia promedio / trabajo</div>
            <div className="g-resumen-value">${fmt(kpis.ganancia / (kpis.trabajos || 1))}</div>
          </div>
          <div className="g-resumen-item">
            <div className="g-resumen-label">📊 Total trabajos realizados</div>
            <div className="g-resumen-value">{kpis.trabajos}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GananciasGenerales;
