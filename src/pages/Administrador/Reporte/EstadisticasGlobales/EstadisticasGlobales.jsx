// src/Admin/Reporte/EstadisticasGlobales/EstadisticasGlobales.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Activity,
  CheckCircle2,
  Clock,
  Target,
  Calendar,
  BarChart3,
  Plus,
  X,
} from 'lucide-react';
import reporteGlobalService from '../../../../services/reporteGlobalService';
import BtnExportarPDF from '../Componentes/BtnExportarPDF';
import { exportarPDF } from '../Componentes/exportarPDF';
import './EstadisticasGlobales.css';

// ── Paleta de colores profesionales ────────────────────────────────────────────
const PALETTE = ['#3B6D11', '#0ea5e9', '#f59e0b', '#10b981', '#f43f5e', '#a78bfa', '#fb923c'];
const CURVE_COLORS = [
  { line: '#2E7D32', area: 'rgba(46, 125, 50, 0.25)', name: 'Verde bosque' },
  { line: '#1565C0', area: 'rgba(21, 101, 192, 0.25)', name: 'Azul profundo' },
  { line: '#E65100', area: 'rgba(230, 81, 0, 0.25)', name: 'Naranja' },
  { line: '#6A1B9A', area: 'rgba(106, 27, 154, 0.25)', name: 'Púrpura' },
  { line: '#00695C', area: 'rgba(0, 105, 92, 0.25)', name: 'Verde azulado' },
  { line: '#AD1457', area: 'rgba(173, 20, 87, 0.25)', name: 'Rosa' },
];

// ── Función para calcular densidad KDE ────────────────────────────────────────
const calcularDensidad = (datos, puntos = 100) => {
  if (!datos || datos.length === 0) return [];

  const valoresFiltrados = datos.filter((v) => v !== null && v !== undefined && v > 0);
  if (valoresFiltrados.length === 0) return [];

  const min = Math.min(...valoresFiltrados);
  const max = Math.max(...valoresFiltrados);
  const bandwidth = (max - min) / 12;

  const resultados = [];

  for (let i = 0; i <= puntos; i++) {
    const x = min + (i / puntos) * (max - min);
    let densidad = 0;

    valoresFiltrados.forEach((valor) => {
      const u = (x - valor) / bandwidth;
      const kernel = Math.exp(-0.5 * u * u) / Math.sqrt(2 * Math.PI);
      densidad += kernel;
    });

    densidad = densidad / (valoresFiltrados.length * bandwidth);
    resultados.push({ value: x.toFixed(1), densidad });
  }

  return resultados;
};

// ── Custom Tooltip ─────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  const uniquePayload = [];
  const names = new Set();

  payload.forEach((entry) => {
    if (!names.has(entry.name)) {
      names.add(entry.name);
      uniquePayload.push(entry);
    }
  });

  return (
    <div className="eg-tooltip">
      <p className="eg-tooltip-label">{label}</p>
      {uniquePayload.map((entry, i) => (
        <p key={i} className="eg-tooltip-row" style={{ color: entry.color }}>
          <span className="eg-tooltip-dot" style={{ background: entry.color }} />
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Density Tooltip ────────────────────────────────────────────────────────────
const DensityTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="eg-density-tooltip">
      <p className="eg-density-tooltip-title">Valor: {label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="eg-density-tooltip-row">
          <span className="eg-density-tooltip-dot" style={{ background: entry.color }} />
          <span>{entry.name}:</span>
          <strong>{entry.value.toFixed(4)}</strong>
        </div>
      ))}
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, value, label, sub, accent, trend }) => (
  <div className={`eg-stat-card eg-stat-card--${accent}`}>
    <div className="eg-stat-icon">
      <Icon size={20} />
    </div>
    <div className="eg-stat-body">
      <div className="eg-stat-value">{value}</div>
      <div className="eg-stat-label">{label}</div>
      {sub !== undefined && (
        <div className="eg-stat-sub">
          {trend === 'up' ? (
            <TrendingUp size={12} />
          ) : trend === 'down' ? (
            <TrendingDown size={12} />
          ) : null}
          <span>{sub}</span>
        </div>
      )}
    </div>
  </div>
);

// ── Period Selector ───────────────────────────────────────────────────────────
const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const PeriodSelect = ({ label, value, onChange, anios, showMonth = true }) => (
  <div className="eg-period-select">
    <span className="eg-period-label">{label}</span>
    <div className="eg-period-controls">
      {showMonth && (
        <select
          className="eg-select"
          value={value.mes}
          onChange={(e) => onChange({ ...value, mes: parseInt(e.target.value) })}
        >
          {MESES.map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
      )}
      <select
        className="eg-select"
        value={showMonth ? value.anio : value}
        onChange={(e) =>
          onChange(
            showMonth ? { ...value, anio: parseInt(e.target.value) } : parseInt(e.target.value)
          )
        }
      >
        {anios.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </div>
  </div>
);

// ── Componente de curvas de densidad múltiples ─────────────────────────────────
const MultiDensityCurves = ({ datasets, height = 350 }) => {
  if (!datasets || datasets.length === 0) {
    return (
      <div className="eg-empty">
        <Activity size={32} />
        <p>Agregá períodos para ver la comparación de curvas</p>
      </div>
    );
  }

  const densidades = datasets.map((dataset, idx) => ({
    ...dataset,
    densidadData: calcularDensidad(dataset.data),
    lineColor: dataset.color || CURVE_COLORS[idx % CURVE_COLORS.length].line,
    areaColor: dataset.areaColor || CURVE_COLORS[idx % CURVE_COLORS.length].area,
  }));

  let minValue = Infinity;
  let maxValue = -Infinity;

  densidades.forEach((d) => {
    if (d.densidadData.length > 0) {
      const values = d.densidadData.map((p) => parseFloat(p.value));
      minValue = Math.min(minValue, Math.min(...values));
      maxValue = Math.max(maxValue, Math.max(...values));
    }
  });

  if (minValue === Infinity) minValue = 0;
  if (maxValue === -Infinity) maxValue = 10;

  let maxDensidad = 0;
  densidades.forEach((d) => {
    const max = Math.max(...d.densidadData.map((p) => p.densidad));
    if (max > maxDensidad) maxDensidad = max;
  });
  maxDensidad = maxDensidad * 1.15;

  const puntos = [];
  const nPuntos = 150;

  for (let i = 0; i <= nPuntos; i++) {
    const x = minValue + (i / nPuntos) * (maxValue - minValue);
    const punto = { value: x.toFixed(1) };

    densidades.forEach((d) => {
      if (d.densidadData.length === 0) return;
      let closestPoint = null;
      let minDiff = Infinity;
      d.densidadData.forEach((p) => {
        const diff = Math.abs(parseFloat(p.value) - x);
        if (diff < minDiff) {
          minDiff = diff;
          closestPoint = p;
        }
      });
      punto[d.name] = closestPoint ? closestPoint.densidad : 0;
    });
    puntos.push(punto);
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={puntos} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
        <defs>
          {densidades.map((d, idx) => (
            <linearGradient key={`grad-${idx}`} id={`gradient-${idx}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={d.lineColor} stopOpacity={0.35} />
              <stop offset="60%" stopColor={d.lineColor} stopOpacity={0.12} />
              <stop offset="100%" stopColor={d.lineColor} stopOpacity={0.02} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="4 4" stroke="#e2e8f0" vertical={false} />
        <XAxis
          dataKey="value"
          type="number"
          domain={[minValue, maxValue]}
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
          tickLine={false}
          label={{
            value: 'Cantidad de reparaciones por día',
            position: 'bottom',
            offset: 5,
            fontSize: 11,
            fill: '#64748b',
          }}
        />
        <YAxis
          domain={[0, maxDensidad]}
          tick={{ fill: '#64748b', fontSize: 11 }}
          axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
          tickLine={false}
          label={{
            value: 'Densidad',
            angle: -90,
            position: 'left',
            offset: 0,
            fontSize: 11,
            fill: '#64748b',
          }}
        />
        <Tooltip content={<DensityTooltip />} />
        {densidades.map((d, idx) => (
          <Area
            key={idx}
            type="monotone"
            dataKey={d.name}
            name={d.name}
            stroke={d.lineColor}
            strokeWidth={2.5}
            fill={`url(#gradient-${idx})`}
            fillOpacity={1}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0, fill: d.lineColor }}
            isAnimationActive={true}
            animationDuration={800}
          />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

// ── Componente principal ────────────────────────────────────────────────────────
const EstadisticasGlobales = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [datos, setDatos] = useState(null);
  const [anios, setAnios] = useState([]);
  const [exportando, setExportando] = useState(false);
  const reportRef = useRef(null);
  const [ingresosMensuales, setIngresosMensuales] = useState([]);
  const [reparacionesMensuales, setReparacionesMensuales] = useState([]);

  const [topMarcasData, setTopMarcasData] = useState(null);
  const [cargandoMarcas, setCargandoMarcas] = useState(false);
  const [anioMarcas, setAnioMarcas] = useState(new Date().getFullYear());
  const [tipoGrafico, setTipoGrafico] = useState('barras'); // 'barras' o 'curvas'

  const [mes1, setMes1] = useState({
    mes: new Date().getMonth() + 1,
    anio: new Date().getFullYear(),
  });
  const [mes2, setMes2] = useState({ mes: new Date().getMonth(), anio: new Date().getFullYear() });
  const [anio1, setAnio1] = useState(new Date().getFullYear() - 1);
  const [anio2, setAnio2] = useState(new Date().getFullYear());

  const [compMeses, setCompMeses] = useState(null);
  const [compAnios, setCompAnios] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [activeTab, setActiveTab] = useState('mensual');

  const [multiPeriods, setMultiPeriods] = useState([]);
  const [multiData, setMultiData] = useState([]);
  const [cargandoMulti, setCargandoMulti] = useState(false);
  // Agrega estos estados con los demás (alrededor de línea ~180)
  const [periodo1, setPeriodo1] = useState({ mes: 5, anio: 2026 });
  const [periodo2, setPeriodo2] = useState({ mes: 5, anio: 2026 });
  const [datosMes1, setDatosMes1] = useState({ terminadas: 0, ingresos: 0, canceladas: 0 });
  const [datosMes2, setDatosMes2] = useState({ terminadas: 0, ingresos: 0, canceladas: 0 });
  const [cargandoComparativa, setCargandoComparativa] = useState(false);
  const [periodoComparativa1, setPeriodoComparativa1] = useState({ mes: 1, anio: 2026 });
  const [periodoComparativa2, setPeriodoComparativa2] = useState({ mes: 5, anio: 2026 });
  const [datosComparativa1, setDatosComparativa1] = useState({
    terminadas: 0,
    ingresos: 0,
    canceladas: 0,
  });
  const [datosComparativa2, setDatosComparativa2] = useState({
    terminadas: 0,
    ingresos: 0,
    canceladas: 0,
  });

  // ========== FUNCIÓN PARA CARGAR COMPARATIVA DE BARRAS ==========
  const cargarComparativaBarras = async () => {
    setCargandoComparativa(true);
    try {
      const response = await reporteGlobalService.compararMesesResumen({
        mes1: periodoComparativa1.mes,
        anio1: periodoComparativa1.anio,
        mes2: periodoComparativa2.mes,
        anio2: periodoComparativa2.anio,
      });

      console.log(' Datos Comparativa Barras:', response);

      if (response.success) {
        setDatosComparativa1(response.data.mes1);
        setDatosComparativa2(response.data.mes2);
      }
    } catch (error) {
      console.error('Error cargando comparativa de barras:', error);
    } finally {
      setCargandoComparativa(false);
    }
  };
  useEffect(() => {
    cargarComparativaBarras();
  }, [periodoComparativa1, periodoComparativa2]);
  useEffect(() => {
    if (mes1 && mes2) {
      cargarComparativaBarras();
    }
  }, [mes1, mes2]);

  useEffect(() => {
    setCompMeses(null);
  }, [mes1, mes2]);

  useEffect(() => {
    setCompAnios(null);
  }, [anio1, anio2]);

  useEffect(() => {
    cargar();
    cargarIngresosMensuales();
    cargarReparacionesMensuales();
  }, []);

  useEffect(() => {
    if (multiPeriods.length > 0) {
      cargarMultiPeriods();
    } else {
      setMultiData([]);
    }
  }, [multiPeriods]);

  const cargar = async () => {
    setLoading(true);
    try {
      const r = await reporteGlobalService.obtenerEstadisticasGlobales();
      console.log('reparaciones', r);
      if (r.success) {
        setDatos(r.data);
        const a = r.data.anios_disponibles || [];
        setAnios(a.length ? a : [new Date().getFullYear()]);
        if (a.length >= 2) {
          setAnio1(a[a.length - 2]);
          setAnio2(a[a.length - 1]);
        } else if (a.length === 1) {
          setAnio1(a[0]);
          setAnio2(a[0]);
        }
      } else {
        setError(r.message || 'Error al cargar estadísticas');
      }
    } catch (e) {
      setError(e.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const cargarTopMarcas = async () => {
    setCargandoMarcas(true);
    try {
      const response = await reporteGlobalService.obtenerTopMarcasMensual(anioMarcas, 5);
      console.log('marcas', response);
      if (response.success) {
        setTopMarcasData(response.data);
      }
    } catch (error) {
      console.error('Error cargando top marcas:', error);
    } finally {
      setCargandoMarcas(false);
    }
  };
  useEffect(() => {
    cargarTopMarcas();
  }, [anioMarcas]);
  const diferenciaTerminadas = datosMes2.terminadas - datosMes1.terminadas;
  const diferenciaIngresos = datosMes2.ingresos - datosMes1.ingresos;
  const cargarIngresosMensuales = async () => {
    try {
      const response = await reporteGlobalService.obtenerIngresosMensuales();
      if (response.success) {
        setIngresosMensuales(response.data);
      }
    } catch (error) {
      console.error('Error cargando ingresos mensuales:', error);
    }
  };

  const cargarReparacionesMensuales = async () => {
    try {
      const response = await reporteGlobalService.obtenerReparacionesMensuales();
      if (response.success && response.data) {
        setReparacionesMensuales(response.data);
      }
    } catch (error) {
      console.error('Error cargando reparaciones mensuales:', error);
    }
  };

  // Datos combinados para gráfico de barras (ingresos + reparaciones)
  const datosComparativos = useMemo(() => {
    if (!ingresosMensuales.length && !reparacionesMensuales.length) return [];

    const mesesMap = new Map();

    // Agregar ingresos
    ingresosMensuales.forEach((item) => {
      mesesMap.set(item.mes_orden, {
        mes: item.mes,
        mes_orden: item.mes_orden,
        ingresos: item.ingresos,
        reparaciones: 0,
      });
    });

    // Agregar reparaciones
    reparacionesMensuales.forEach((item) => {
      if (mesesMap.has(item.mes_orden)) {
        mesesMap.get(item.mes_orden).reparaciones = item.total;
      } else {
        mesesMap.set(item.mes_orden, {
          mes: item.mes,
          mes_orden: item.mes_orden,
          ingresos: 0,
          reparaciones: item.total,
        });
      }
    });

    return Array.from(mesesMap.values()).sort((a, b) => a.mes_orden.localeCompare(b.mes_orden));
  }, [ingresosMensuales, reparacionesMensuales]);

  const cargarMultiPeriods = async () => {
    if (multiPeriods.length === 0) return;
    setCargandoMulti(true);
    const resultados = [];
    for (const period of multiPeriods) {
      try {
        let datosPeriodo = null;
        if (period.tipo === 'mes') {
          const r = await reporteGlobalService.compararMeses({
            mes1: period.mes,
            anio1: period.anio,
            mes2: period.mes,
            anio2: period.anio,
          });
          if (r.success && r.data.datos_mes1) {
            datosPeriodo = {
              total: r.data.datos_mes1.total,
              cantidades: r.data.datos_mes1.cantidades,
            };
          }
        } else {
          const r = await reporteGlobalService.compararAnios({
            anio1: period.anio,
            anio2: period.anio,
          });
          if (r.success && r.data.datos_anio1) {
            datosPeriodo = {
              total: r.data.datos_anio1.total,
              cantidades: r.data.datos_anio1.cantidades,
            };
          }
        }
        if (datosPeriodo) {
          resultados.push({ ...period, datos: datosPeriodo });
        }
      } catch (error) {
        console.error(`Error cargando ${period.nombre}:`, error);
      }
    }
    setMultiData(resultados);
    setCargandoMulti(false);
  };

  const handleCompararMeses = async () => {
    setCargando(true);
    try {
      const r = await reporteGlobalService.compararMeses({
        mes1: mes1.mes,
        anio1: mes1.anio,
        mes2: mes2.mes,
        anio2: mes2.anio,
      });
      if (r.success) setCompMeses(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const handleCompararAnios = async () => {
    setCargando(true);
    try {
      const r = await reporteGlobalService.compararAnios({ anio1, anio2 });
      if (r.success) setCompAnios(r.data);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const handleExportar = async () => {
    setExportando(true);
    await exportarPDF(reportRef, 'Reporte_Estadisticas_Globales', 'Estadísticas Globales');
    setExportando(false);
  };

  const agregarPeriodo = (period) => {
    if (multiPeriods.length >= 6) {
      alert('Máximo 6 períodos permitidos');
      return;
    }
    setMultiPeriods([...multiPeriods, period]);
  };

  const removerPeriodo = (id) => {
    setMultiPeriods(multiPeriods.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="eg-loading">
        <div className="eg-spinner" />
        <p>Cargando estadísticas globales...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="eg-error">
        <p>{error}</p>
        <button className="eg-btn eg-btn--ghost" onClick={cargar}>
          <RefreshCw size={14} /> Reintentar
        </button>
      </div>
    );
  }

  const pct = datos?.porcentaje_exito || 0;
  const totalProceso =
    (datos?.reparaciones_en_proceso || 0) + (datos?.reparaciones_pendientes || 0);

  return (
    <div className="eg-root">
      <div className="eg-header">
        <div className="eg-header-left">
          <div className="eg-header-icon">
            <Activity size={18} />
          </div>
          <div>
            <h1 className="eg-title">Estadísticas Globales</h1>
            <p className="eg-subtitle">Comparativas de reparaciones con curvas de densidad</p>
          </div>
        </div>
        <BtnExportarPDF onClick={handleExportar} exportando={exportando} />
      </div>

      <div ref={reportRef}>
        {/* Stat Cards */}
        <div className="eg-stats-grid">
          <StatCard
            icon={Activity}
            value={datos?.total_ingresos || 0}
            label="Total Ingresos"
            accent="blue"
          />
          <StatCard
            icon={CheckCircle2}
            value={datos?.reparaciones_completadas || 0}
            label="Completadas"
            sub={`${pct}% tasa de éxito`}
            accent="green"
            trend={pct >= 50 ? 'up' : 'down'}
          />
          <StatCard
            icon={Clock}
            value={totalProceso}
            label="En Proceso / Pendientes"
            sub={`${datos?.porcentaje_pendiente || 0}%`}
            accent="amber"
          />
          <StatCard
            icon={Target}
            value={`${pct}%`}
            label="Tasa de Éxito"
            accent={pct >= 50 ? 'green' : 'red'}
            trend={pct >= 50 ? 'up' : 'down'}
          />
        </div>

        {/* ── GRÁFICO DE INGRESOS VS REPARACIONES (BARRAS O CURVAS) ── */}
        {datosComparativos.length > 0 && (
          <div className="eg-chart-card eg-chart-card--full">
            <div className="eg-chart-header">
              <div className="eg-chart-title">
                <BarChart3 size={16} style={{ marginRight: 8 }} />
                Ingresos vs Reparaciones Mensuales
              </div>
              <div className="eg-chart-controls">
                <div className="eg-chart-toggle">
                  <button
                    className={`eg-toggle-btn ${tipoGrafico === 'barras' ? 'active' : ''}`}
                    onClick={() => setTipoGrafico('barras')}
                  >
                    <BarChart3 size={14} /> Barras
                  </button>
                  <button
                    className={`eg-toggle-btn ${tipoGrafico === 'curvas' ? 'active' : ''}`}
                    onClick={() => setTipoGrafico('curvas')}
                  >
                    <Activity size={14} /> Curvas
                  </button>
                </div>
                <div className="eg-legend">
                  <span className="eg-legend-item">
                    <span
                      style={{
                        background: '#6366f1',
                        width: 12,
                        height: 12,
                        borderRadius: '2px',
                        display: 'inline-block',
                      }}
                    />
                    Ingresos
                  </span>
                  <span className="eg-legend-item">
                    <span
                      style={{
                        background: '#10b981',
                        width: 12,
                        height: 12,
                        borderRadius: '2px',
                        display: 'inline-block',
                      }}
                    />
                    Reparaciones
                  </span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
              {tipoGrafico === 'barras' ? (
                <BarChart
                  data={datosComparativos}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  barGap={8}
                  barCategoryGap={20}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="mes"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    label={{
                      value: 'Cantidad',
                      angle: -90,
                      position: 'insideLeft',
                      fontSize: 11,
                      fill: '#64748b',
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="ingresos"
                    name="Ingresos"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                    barSize={30}
                  />
                  <Bar
                    dataKey="reparaciones"
                    name="Reparaciones"
                    fill="#10b981"
                    radius={[6, 6, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              ) : (
                <ComposedChart
                  data={datosComparativos}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <defs>
                    <linearGradient id="gradIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="gradReparaciones" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="mes"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    angle={-15}
                    textAnchor="end"
                    height={70}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    label={{
                      value: 'Cantidad',
                      angle: -90,
                      position: 'insideLeft',
                      fontSize: 11,
                      fill: '#64748b',
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="ingresos"
                    name="Ingresos"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fill="url(#gradIngresos)"
                    fillOpacity={1}
                    dot={{ r: 4, fill: '#6366f1', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="reparaciones"
                    name="Reparaciones"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#gradReparaciones)"
                    fillOpacity={1}
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        )}

        {/* Tabs */}
        <div className="eg-tabs">
          <button
            className={`eg-tab ${activeTab === 'mensual' ? 'eg-tab--active' : ''}`}
            onClick={() => setActiveTab('mensual')}
          >
            <Calendar size={14} style={{ marginRight: 6 }} /> Comparación Mensual
          </button>
          <button
            className={`eg-tab ${activeTab === 'anual' ? 'eg-tab--active' : ''}`}
            onClick={() => setActiveTab('anual')}
          >
            <BarChart3 size={14} style={{ marginRight: 6 }} /> Comparación Anual
          </button>
        </div>

        {/* Comparación Mensual */}
        {activeTab === 'mensual' && (
          <div className="eg-chart-card eg-chart-card--full" style={{ marginTop: '32px' }}>
            <div className="eg-chart-header">
              <div className="eg-chart-title">
                <BarChart3 size={16} style={{ marginRight: 8 }} />
                Comparativa de Rendimiento: {MESES[periodoComparativa1.mes - 1]}{' '}
                {periodoComparativa1.anio} vs {MESES[periodoComparativa2.mes - 1]}{' '}
                {periodoComparativa2.anio}
              </div>
              <div className="eg-chart-controls">
                <div className="eg-legend">
                  <span className="eg-legend-item">Ingresos</span>
                  <span className="eg-legend-item">
                    <span
                      style={{
                        background: '#F44336',
                        width: 12,
                        height: 12,
                        borderRadius: '2px',
                        display: 'inline-block',
                      }}
                    />
                    <span
                      style={{
                        background: '#4CAF50',
                        width: 12,
                        height: 12,
                        borderRadius: '2px',
                        display: 'inline-block',
                      }}
                    />
                    Terminadas
                  </span>
                  <span className="eg-legend-item">
                    <span
                      style={{
                        background: '#2196F3',
                        width: 12,
                        height: 12,
                        borderRadius: '2px',
                        display: 'inline-block',
                      }}
                    />
                    Canceladas
                  </span>
                </div>
              </div>
            </div>

            {/* Selectores de períodos */}
            <div
              style={{
                display: 'flex',
                gap: '20px',
                marginBottom: '24px',
                alignItems: 'flex-end',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: '12px',
                    color: '#64748b',
                    marginBottom: '4px',
                    display: 'block',
                  }}
                >
                  Período 1
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="eg-select"
                    value={periodoComparativa1.mes}
                    onChange={(e) =>
                      setPeriodoComparativa1({
                        ...periodoComparativa1,
                        mes: parseInt(e.target.value),
                      })
                    }
                  >
                    {MESES.map((m, i) => (
                      <option key={i} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    className="eg-select"
                    value={periodoComparativa1.anio}
                    onChange={(e) =>
                      setPeriodoComparativa1({
                        ...periodoComparativa1,
                        anio: parseInt(e.target.value),
                      })
                    }
                  >
                    {anios.map((a, idx) => (
                      <option key={`anio1-${idx}`} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#94a3b8',
                  padding: '0 16px',
                }}
              >
                VS
              </div>

              <div style={{ flex: 1 }}>
                <label
                  style={{
                    fontSize: '12px',
                    color: '#64748b',
                    marginBottom: '4px',
                    display: 'block',
                  }}
                >
                  Período 2
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <select
                    className="eg-select"
                    value={periodoComparativa2.mes}
                    onChange={(e) =>
                      setPeriodoComparativa2({
                        ...periodoComparativa2,
                        mes: parseInt(e.target.value),
                      })
                    }
                  >
                    {MESES.map((m, i) => (
                      <option key={i} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    className="eg-select"
                    value={periodoComparativa2.anio}
                    onChange={(e) =>
                      setPeriodoComparativa2({
                        ...periodoComparativa2,
                        anio: parseInt(e.target.value),
                      })
                    }
                  >
                    {anios.map((a, idx) => (
                      <option key={`anio2-${idx}`} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Gráficas de comparación */}
            {cargandoComparativa ? (
              <div className="text-center py-5">
                <div className="eg-spinner" style={{ width: 32, height: 32, margin: '0 auto' }} />
                <p style={{ marginTop: 12, color: '#64748b' }}>Cargando datos...</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                {/* Gráfica 1 */}
                <div>
                  <h4
                    style={{
                      textAlign: 'center',
                      marginBottom: 16,
                      fontSize: 14,
                      color: '#1e293b',
                    }}
                  >
                    {MESES[periodoComparativa1.mes - 1]} {periodoComparativa1.anio}
                  </h4>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={[
                        { nombre: 'Ingresos', cantidad: datosComparativa1.ingresos || 0 },
                        { nombre: 'Terminadas', cantidad: datosComparativa1.terminadas || 0 },
                        { nombre: 'Canceladas', cantidad: datosComparativa1.canceladas || 0 },
                      ]}
                      margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="nombre" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                        <Cell fill="#2196F3" />
                        <Cell fill="#4CAF50" />
                        <Cell fill="#F44336" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      marginTop: 12,
                      padding: '8px',
                      background: '#f8fafc',
                      borderRadius: 8,
                    }}
                  >
                    <div className="text-center">
                      <small className="text-muted"> Ingresos</small>
                      <h6 className="text-primary mb-0">{datosComparativa1.ingresos || 0}</h6>
                    </div>
                    <div className="text-center">
                      <small className="text-muted"> Terminadas</small>
                      <h6 className="text-success mb-0">{datosComparativa1.terminadas || 0}</h6>
                    </div>
                    <div className="text-center">
                      <small className="text-muted"> Canceladas</small>
                      <h6 className="text-danger mb-0">{datosComparativa1.canceladas || 0}</h6>
                    </div>
                  </div>
                </div>

                {/* Gráfica 2 */}
                <div>
                  <h4
                    style={{
                      textAlign: 'center',
                      marginBottom: 16,
                      fontSize: 14,
                      color: '#1e293b',
                    }}
                  >
                    {MESES[periodoComparativa2.mes - 1]} {periodoComparativa2.anio}
                  </h4>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={[
                        { nombre: 'Ingresos', cantidad: datosComparativa2.ingresos || 0 },
                        { nombre: 'Terminadas', cantidad: datosComparativa2.terminadas || 0 },
                        { nombre: 'Canceladas', cantidad: datosComparativa2.canceladas || 0 },
                      ]}
                      margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="nombre" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                        <Cell fill="#2196F3" />
                        <Cell fill="#4CAF50" />
                        <Cell fill="#F44336" />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-around',
                      marginTop: 12,
                      padding: '8px',
                      background: '#f8fafc',
                      borderRadius: 8,
                    }}
                  >
                    <div className="text-center">
                      <small className="text-muted"> Terminadas</small>
                      <h6 className="text-success mb-0">{datosComparativa2.terminadas || 0}</h6>
                    </div>
                    <div className="text-center">
                      <small className="text-muted"> Ingresos</small>
                      <h6 className="text-primary mb-0">{datosComparativa2.ingresos || 0}</h6>
                    </div>
                    <div className="text-center">
                      <small className="text-muted"> Canceladas</small>
                      <h6 className="text-danger mb-0">{datosComparativa2.canceladas || 0}</h6>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen de diferencias */}
            {!cargandoComparativa && (
              <div
                style={{
                  marginTop: 24,
                  padding: 16,
                  background: '#f1f5f9',
                  borderRadius: 12,
                  display: 'flex',
                  justifyContent: 'space-around',
                  flexWrap: 'wrap',
                  gap: 16,
                }}
              >
                <div className="text-center">
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    Diferencia Terminadas
                  </span>
                  <h5
                    className={
                      datosComparativa2.terminadas - datosComparativa1.terminadas >= 0
                        ? 'text-success mb-0'
                        : 'text-danger mb-0'
                    }
                  >
                    {datosComparativa2.terminadas - datosComparativa1.terminadas >= 0 ? '+' : ''}
                    {datosComparativa2.terminadas - datosComparativa1.terminadas}
                    <small className="text-muted ms-1">
                      (
                      {datosComparativa1.terminadas > 0
                        ? (
                            ((datosComparativa2.terminadas - datosComparativa1.terminadas) /
                              datosComparativa1.terminadas) *
                            100
                          ).toFixed(1)
                        : 0}
                      %)
                    </small>
                  </h5>
                </div>
                <div className="text-center">
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    Diferencia Ingresos
                  </span>
                  <h5
                    className={
                      datosComparativa2.ingresos - datosComparativa1.ingresos >= 0
                        ? 'text-success mb-0'
                        : 'text-danger mb-0'
                    }
                  >
                    {datosComparativa2.ingresos - datosComparativa1.ingresos >= 0 ? '+' : ''}
                    {datosComparativa2.ingresos - datosComparativa1.ingresos}
                    <small className="text-muted ms-1">
                      (
                      {datosComparativa1.ingresos > 0
                        ? (
                            ((datosComparativa2.ingresos - datosComparativa1.ingresos) /
                              datosComparativa1.ingresos) *
                            100
                          ).toFixed(1)
                        : 0}
                      %)
                    </small>
                  </h5>
                </div>
                <div className="text-center">
                  <span className="text-muted" style={{ fontSize: 12 }}>
                    Tendencia
                  </span>
                  <h5 className="mb-0">
                    {datosComparativa2.terminadas - datosComparativa1.terminadas > 0 &&
                    datosComparativa2.ingresos - datosComparativa1.ingresos > 0
                      ? ' Positiva'
                      : datosComparativa2.terminadas - datosComparativa1.terminadas < 0 &&
                          datosComparativa2.ingresos - datosComparativa1.ingresos < 0
                        ? ' Negativa'
                        : ' Mixta'}
                  </h5>
                </div>
              </div>
            )}
          </div>
        )}
        {/* Comparación Anual */}

        {/* Comparación Anual - DOS GRÁFICAS LADO A LADO */}
        {activeTab === 'anual' && (
          <div className="eg-panel">
            <div className="eg-controls">
              <PeriodSelect
                label="Año 1"
                value={anio1}
                onChange={setAnio1}
                anios={anios}
                showMonth={false}
              />
              <div className="eg-vs">vs</div>
              <PeriodSelect
                label="Año 2"
                value={anio2}
                onChange={setAnio2}
                anios={anios}
                showMonth={false}
              />
              <button
                className="eg-btn eg-btn--primary"
                onClick={handleCompararAnios}
                disabled={cargando}
              >
                {cargando ? (
                  <span className="eg-spinner eg-spinner--sm" />
                ) : (
                  <>
                    <RefreshCw size={14} /> Comparar
                  </>
                )}
              </button>
            </div>

            {compAnios ? (
              <div className="eg-charts-section">
                {/* Leyenda general */}
                <div className="eg-chart-header" style={{ marginBottom: '24px' }}>
                  <div className="eg-chart-title">
                    <Activity size={16} style={{ marginRight: 8 }} />
                    Comparativa Anual: {compAnios.datos_anio1?.nombre} vs{' '}
                    {compAnios.datos_anio2?.nombre}
                  </div>
                  <div className="eg-legend">
                    <span className="eg-legend-item">
                      <span
                        style={{
                          background: '#4CAF50',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          display: 'inline-block',
                        }}
                      />
                      Terminadas
                    </span>
                    <span className="eg-legend-item">
                      <span
                        style={{
                          background: '#2196F3',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          display: 'inline-block',
                        }}
                      />
                      Ingresos
                    </span>
                    <span className="eg-legend-item">
                      <span
                        style={{
                          background: '#F44336',
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          display: 'inline-block',
                        }}
                      />
                      Canceladas
                    </span>
                  </div>
                </div>

                {/* Dos gráficas lado a lado */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  {/* GRÁFICA 1: Año 1 */}
                  <div className="eg-chart-card">
                    <h3
                      style={{
                        textAlign: 'center',
                        marginBottom: 16,
                        fontSize: '18px',
                        color: '#4CAF50',
                      }}
                    >
                      Año {compAnios.datos_anio1?.nombre}
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart
                        data={
                          compAnios.datos_anio1?.nombres_meses?.map((mes, idx) => ({
                            mes: mes,
                            terminadas: compAnios.datos_anio1?.terminadas_por_mes?.[idx] || 0,
                            ingresos: compAnios.datos_anio1?.ingresos_por_mes?.[idx] || 0,
                            canceladas: compAnios.datos_anio1?.canceladas_por_mes?.[idx] || 0,
                          })) || []
                        }
                        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient id="gradTerm1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="gradIng1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2196F3" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#2196F3" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="gradCan1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F44336" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#F44336" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="mes"
                          tick={{ fill: '#64748b', fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          interval={0}
                        />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="terminadas"
                          name="Terminadas"
                          stroke="#4CAF50"
                          strokeWidth={2.5}
                          fill="url(#gradTerm1)"
                          fillOpacity={1}
                          dot={{ r: 3, fill: '#4CAF50', strokeWidth: 0 }}
                          activeDot={{ r: 5 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="ingresos"
                          name="Ingresos"
                          stroke="#2196F3"
                          strokeWidth={2.5}
                          fill="url(#gradIng1)"
                          fillOpacity={1}
                          dot={{ r: 3, fill: '#2196F3', strokeWidth: 0 }}
                          activeDot={{ r: 5 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="canceladas"
                          name="Canceladas"
                          stroke="#EF9A9A"
                          strokeWidth={2.5}
                          fill="url(#gradCan1)"
                          fillOpacity={1}
                          dot={{ r: 3, fill: '#EF9A9A', strokeWidth: 0 }}
                          activeDot={{ r: 5 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>

                    {/* Resumen numérico del año 1 */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        marginTop: 16,
                        padding: '12px',
                        background: '#f8fafc',
                        borderRadius: 8,
                      }}
                    >
                      <div className="text-center">
                        <small className="text-muted"> Terminadas</small>
                        <div className="text-success fw-bold">
                          {compAnios.datos_anio1?.total_terminadas || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <small className="text-muted"> Ingresos</small>
                        <div className="text-primary fw-bold">
                          {compAnios.datos_anio1?.total_ingresos || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <small className="text-muted"> Canceladas</small>
                        <div className="text-danger fw-bold">
                          {compAnios.datos_anio1?.total_canceladas || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* GRÁFICA 2: Año 2 */}
                  <div className="eg-chart-card">
                    <h3
                      style={{
                        textAlign: 'center',
                        marginBottom: 16,
                        fontSize: '18px',
                        color: '#2196F3',
                      }}
                    >
                      Año {compAnios.datos_anio2?.nombre}
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <ComposedChart
                        data={
                          compAnios.datos_anio2?.nombres_meses?.map((mes, idx) => ({
                            mes: mes,
                            terminadas: compAnios.datos_anio2?.terminadas_por_mes?.[idx] || 0,
                            ingresos: compAnios.datos_anio2?.ingresos_por_mes?.[idx] || 0,
                            canceladas: compAnios.datos_anio2?.canceladas_por_mes?.[idx] || 0,
                          })) || []
                        }
                        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                      >
                        <defs>
                          <linearGradient id="gradTerm2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#81C784" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#81C784" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="gradIng2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#64B5F6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#64B5F6" stopOpacity={0.05} />
                          </linearGradient>
                          <linearGradient id="gradCan2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#EF9A9A" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#EF9A9A" stopOpacity={0.05} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis
                          dataKey="mes"
                          tick={{ fill: '#64748b', fontSize: 10 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                          interval={0}
                        />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} allowDecimals={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="terminadas"
                          name="Terminadas"
                          stroke="#81C784"
                          strokeWidth={2.5}
                          fill="url(#gradTerm2)"
                          fillOpacity={1}
                          dot={{ r: 3, fill: '#81C784', strokeWidth: 0 }}
                          activeDot={{ r: 5 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="ingresos"
                          name="Ingresos"
                          stroke="#64B5F6"
                          strokeWidth={2.5}
                          fill="url(#gradIng2)"
                          fillOpacity={1}
                          dot={{ r: 3, fill: '#64B5F6', strokeWidth: 0 }}
                          activeDot={{ r: 5 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="canceladas"
                          name="Canceladas"
                          stroke="#EF9A9A"
                          strokeWidth={2.5}
                          fill="url(#gradCan2)"
                          fillOpacity={1}
                          dot={{ r: 3, fill: '#EF9A9A', strokeWidth: 0 }}
                          activeDot={{ r: 5 }}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>

                    {/* Resumen numérico del año 2 */}
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        marginTop: 16,
                        padding: '12px',
                        background: '#f8fafc',
                        borderRadius: 8,
                      }}
                    >
                      <div className="text-center">
                        <small className="text-muted"> Terminadas</small>
                        <div className="text-success fw-bold">
                          {compAnios.datos_anio2?.total_terminadas || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <small className="text-muted"> Ingresos</small>
                        <div className="text-primary fw-bold">
                          {compAnios.datos_anio2?.total_ingresos || 0}
                        </div>
                      </div>
                      <div className="text-center">
                        <small className="text-muted"> Canceladas</small>
                        <div className="text-danger fw-bold">
                          {compAnios.datos_anio2?.total_canceladas || 0}
                        </div>
                      </div>
                      {/*<div className="text-center">
                        <small className="text-muted"> Total</small>
                        <div className="fw-bold">{compAnios.datos_anio2?.total || 0}</div>
                      </div>*/}
                    </div>
                  </div>
                </div>

                {/* Resumen de diferencias entre años */}
                <div
                  style={{
                    marginTop: 24,
                    padding: 16,
                    background: '#f1f5f9',
                    borderRadius: 12,
                    display: 'flex',
                    justifyContent: 'space-around',
                    flexWrap: 'wrap',
                    gap: 16,
                  }}
                >
                  <div className="text-center">
                    <span className="text-muted" style={{ fontSize: 12 }}>
                      Diferencia Terminadas
                    </span>
                    <h5
                      className={
                        (compAnios.datos_anio2?.total_terminadas || 0) -
                          (compAnios.datos_anio1?.total_terminadas || 0) >=
                        0
                          ? 'text-success mb-0'
                          : 'text-danger mb-0'
                      }
                    >
                      {(compAnios.datos_anio2?.total_terminadas || 0) -
                        (compAnios.datos_anio1?.total_terminadas || 0) >=
                      0
                        ? '+'
                        : ''}
                      {(compAnios.datos_anio2?.total_terminadas || 0) -
                        (compAnios.datos_anio1?.total_terminadas || 0)}
                    </h5>
                  </div>
                  <div className="text-center">
                    <span className="text-muted" style={{ fontSize: 12 }}>
                      Diferencia Ingresos
                    </span>
                    <h5
                      className={
                        (compAnios.datos_anio2?.total_ingresos || 0) -
                          (compAnios.datos_anio1?.total_ingresos || 0) >=
                        0
                          ? 'text-success mb-0'
                          : 'text-danger mb-0'
                      }
                    >
                      {(compAnios.datos_anio2?.total_ingresos || 0) -
                        (compAnios.datos_anio1?.total_ingresos || 0) >=
                      0
                        ? '+'
                        : ''}
                      {(compAnios.datos_anio2?.total_ingresos || 0) -
                        (compAnios.datos_anio1?.total_ingresos || 0)}
                    </h5>
                  </div>
                  <div className="text-center">
                    <span className="text-muted" style={{ fontSize: 12 }}>
                      Diferencia Canceladas
                    </span>
                    <h5
                      className={
                        (compAnios.datos_anio2?.total_canceladas || 0) -
                          (compAnios.datos_anio1?.total_canceladas || 0) <=
                        0
                          ? 'text-success mb-0'
                          : 'text-danger mb-0'
                      }
                    >
                      {(compAnios.datos_anio2?.total_canceladas || 0) -
                        (compAnios.datos_anio1?.total_canceladas || 0) <=
                      0
                        ? '▼'
                        : '▲'}
                      {Math.abs(
                        (compAnios.datos_anio2?.total_canceladas || 0) -
                          (compAnios.datos_anio1?.total_canceladas || 0)
                      )}
                    </h5>
                  </div>
                </div>
              </div>
            ) : (
              <div className="eg-empty">
                <Activity size={32} />
                <p>
                  Seleccioná dos años y hacé clic en <strong>Comparar</strong>
                </p>
              </div>
            )}
          </div>
        )}
        {/* Sección: Top Marcas Reparadas */}
        <div className="eg-chart-card eg-chart-card--full" style={{ marginTop: '32px' }}>
          <div className="eg-chart-header">
            <div className="eg-chart-title">
              <Activity size={16} style={{ marginRight: 8 }} />
              Top Marcas Más Reparadas
            </div>
            <div className="eg-chart-controls">
              <select
                className="eg-select"
                value={anioMarcas}
                onChange={(e) => setAnioMarcas(parseInt(e.target.value))}
                style={{ width: '100px' }}
              >
                {anios.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {cargandoMarcas ? (
            <div className="text-center py-5">
              <div className="eg-spinner" style={{ margin: '0 auto' }} />
              <p>Cargando datos de marcas...</p>
            </div>
          ) : topMarcasData ? (
            <>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart
                  data={
                    topMarcasData.meses?.map((mes, idx) => {
                      const punto = { mes };
                      topMarcasData.marcas?.forEach((marca) => {
                        punto[marca.marca] = marca.data[idx] || 0;
                      });
                      return punto;
                    }) || []
                  }
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <defs>
                    {topMarcasData.marcas?.map((marca, i) => (
                      <linearGradient key={i} id={`gradMarca${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor={PALETTE[i % PALETTE.length]}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={PALETTE[i % PALETTE.length]}
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {topMarcasData.marcas?.map((marca, i) => (
                    <Area
                      key={i}
                      type="monotone"
                      dataKey={marca.marca}
                      name={marca.marca}
                      stroke={PALETTE[i % PALETTE.length]}
                      strokeWidth={2.5}
                      fill={`url(#gradMarca${i})`}
                      fillOpacity={1}
                      dot={{ r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  ))}
                </ComposedChart>
              </ResponsiveContainer>
              <p className="eg-chart-note">
                Evolución mensual de las marcas con más reparaciones en {topMarcasData.anio}
              </p>
            </>
          ) : (
            <div className="eg-empty">
              <Activity size={32} />
              <p>No hay datos de marcas disponibles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstadisticasGlobales;
