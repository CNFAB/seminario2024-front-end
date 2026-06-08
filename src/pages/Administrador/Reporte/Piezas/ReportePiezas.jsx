import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import './ReportePiezas.css';
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
  AreaChart,
  Area,
} from 'recharts';
import { inventarioService } from '../../../../services/inventarioService';
import reparacionMultipleService from '../../../../services/reparacionMultipleService';
import CustomTooltip from '../Componentes/CustomTooltip';
import BtnExportarPDF from '../Componentes/BtnExportarPDF';
import { exportarPDF } from '../Componentes/exportarPDF';

// ── Paleta ────────────────────────────────────────────────────────────────────
const PALETTE = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e', '#a78bfa', '#fb923c'];
const STOCK_BAJO = 5; // umbral de alerta

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  Number(n ?? 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ── Componente principal ──────────────────────────────────────────────────────
const ReportePiezas = () => {
  const [piezas, setPiezas] = useState([]);
  const [repsMultiples, setRepsMultiples] = useState([]);
  const [piezasMasUsadas, setPiezasMasUsadas] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportando, setExportando] = useState(false);
  const pdfRef = useRef(null);
  const [paginaSinStock, setPaginaSinStock] = useState(1);
  const [paginaStockBajo, setPaginaStockBajo] = useState(1);
  const [paginaSinUso, setPaginaSinUso] = useState(1);
  const [itemsPorPaginaAlertas, setItemsPorPaginaAlertas] = useState(8);

  // ✅ Estados para paginación
  const [paginaFacturacion, setPaginaFacturacion] = useState(1);
  const [itemsPorPaginaFacturacion, setItemsPorPaginaFacturacion] = useState(15);
  const [paginaInventario, setPaginaInventario] = useState(1);
  const [itemsPorPaginaInventario, setItemsPorPaginaInventario] = useState(15);

  // ── Carga de datos ────────────────────────────────────────────────────────
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);

        const [resPiezas, resReps] = await Promise.all([
          inventarioService.obtenerTodas(),
          reparacionMultipleService.obtenerTodas(),
        ]);

        const p = resPiezas?.data ?? resPiezas ?? [];
        const r = Array.isArray(resReps) ? resReps : (resReps?.data ?? resReps ?? []);

        setPiezas(Array.isArray(p) ? p : []);
        setRepsMultiples(Array.isArray(r) ? r : []);
        setPiezasMasUsadas([]);
      } catch (e) {
        console.error(e);
        setError('No se pudieron cargar los datos de piezas.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  // ── Categorías disponibles ────────────────────────────────────────────────
  const categorias = useMemo(() => {
    const set = new Set();
    piezas.forEach((p) => {
      if (p.categoria?.categoria) set.add(p.categoria.categoria);
    });
    return Array.from(set).sort();
  }, [piezas]);

  // ── Piezas filtradas ──────────────────────────────────────────────────────
  const piezasFiltradas = useMemo(() => {
    return piezas.filter((p) => {
      const okCat = filtroCategoria === 'todas' || p.categoria?.categoria === filtroCategoria;
      const okBus =
        filtroBusqueda === '' ||
        p.nombre_pieza?.toLowerCase().includes(filtroBusqueda.toLowerCase());
      return okCat && okBus;
    });
  }, [piezas, filtroCategoria, filtroBusqueda]);

  // ── KPIs generales ────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const totalPiezas = piezas.length;
    const conStock = piezas.filter((p) => (p.stock ?? 0) > 0).length;
    const sinStock = piezas.filter((p) => (p.stock ?? 0) === 0).length;
    const stockBajo = piezas.filter(
      (p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= STOCK_BAJO
    ).length;
    const valorInventario = piezas.reduce(
      (acc, p) => acc + Number(p.precio ?? 0) * Number(p.stock ?? 0),
      0
    );
    const totalCategorias = categorias.length;
    return { totalPiezas, conStock, sinStock, stockBajo, valorInventario, totalCategorias };
  }, [piezas, categorias]);

  // ── Stock por categoría (para gráfica) ───────────────────────────────────
  const stockPorCategoria = useMemo(() => {
    const map = {};
    piezas.forEach((p) => {
      const cat = p.categoria?.categoria ?? 'Sin categoría';
      if (!map[cat]) map[cat] = { categoria: cat, stock: 0, valor: 0, cantidad: 0 };
      map[cat].stock += p.stock ?? 0;
      map[cat].valor += (p.precio ?? 0) * (p.stock ?? 0);
      map[cat].cantidad += 1;
    });
    return Object.values(map).sort((a, b) => b.stock - a.stock);
  }, [piezas]);

  // ── Uso en reparaciones ───────────────────────────────────────────────────
  const usoEnReparaciones = useMemo(() => {
    const map = {};
    repsMultiples.forEach((r) => {
      const id = r.id_pieza;
      const nom = r.pieza?.nombre_pieza ?? `Pieza #${id}`;
      const total = Number(r.precio_total ?? 0);
      const pieza = Number(r.precio_pieza_momento ?? 0);
      if (!id) return;
      if (!map[id])
        map[id] = { id, nombre: nom, veces: 0, facturado: 0, costoPieza: 0, manoObra: 0 };
      map[id].veces++;
      map[id].facturado += total;
      map[id].costoPieza += pieza;
      map[id].manoObra += total - pieza;
    });
    return Object.values(map)
      .map((p) => ({ ...p, ganancia: p.facturado - p.costoPieza }))
      .sort((a, b) => b.veces - a.veces);
  }, [repsMultiples]);

  // ✅ Paginación para Detalle de Facturación
  const totalPaginasFacturacion = Math.ceil(usoEnReparaciones.length / itemsPorPaginaFacturacion);
  const inicioFacturacion = (paginaFacturacion - 1) * itemsPorPaginaFacturacion;
  const finFacturacion = inicioFacturacion + itemsPorPaginaFacturacion;
  const facturacionPagina = usoEnReparaciones.slice(inicioFacturacion, finFacturacion);

  // ✅ Paginación para Inventario Completo
  const totalPaginasInventario = Math.ceil(piezasFiltradas.length / itemsPorPaginaInventario);
  const inicioInventario = (paginaInventario - 1) * itemsPorPaginaInventario;
  const finInventario = inicioInventario + itemsPorPaginaInventario;
  const inventarioPagina = piezasFiltradas.slice(inicioInventario, finInventario);

  // ✅ Resetear páginas cuando cambian los filtros
  useEffect(() => {
    setPaginaFacturacion(1);
    setPaginaInventario(1);
  }, [filtroCategoria, filtroBusqueda]);

  // ── Top 10 más usadas ──────────────────────────────────────────────────────
  const top10Usadas = useMemo(
    () =>
      piezasMasUsadas.length > 0
        ? piezasMasUsadas.slice(0, 10).map((p) => ({
            nombre: (p.nombre_pieza ?? p.nombre ?? `Pieza #${p.id_pieza}`)
              .split(' ')
              .slice(0, 2)
              .join(' '),
            veces: p.total ?? p.cantidad ?? 0,
          }))
        : usoEnReparaciones.slice(0, 10).map((p) => ({
            nombre: p.nombre.split(' ').slice(0, 2).join(' '),
            veces: p.veces,
          })),
    [piezasMasUsadas, usoEnReparaciones]
  );

  // ── Comparativa precio stock vs precio cobrado ────────────────────────────
  const comparativaPrecios = useMemo(
    () =>
      usoEnReparaciones.slice(0, 8).map((u) => {
        const piezaInfo = piezas.find((p) => p.id_pieza === u.id);
        const precioActual = Number(piezaInfo?.precio ?? 0);
        const promCobrado = u.veces > 0 ? u.costoPieza / u.veces : 0;
        return {
          nombre: u.nombre.split(' ').slice(0, 2).join(' '),
          precioActual: Number(precioActual.toFixed(2)),
          promCobrado: Number(promCobrado.toFixed(2)),
          gananciaUnit: Number((u.manoObra / u.veces || 0).toFixed(2)),
        };
      }),
    [usoEnReparaciones, piezas]
  );

  // ── Alertas de stock ──────────────────────────────────────────────────────
  const alertasStock = useMemo(
    () => ({
      sinStock: piezas.filter((p) => (p.stock ?? 0) === 0),
      stockBajo: piezas.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= STOCK_BAJO),
      nunca: piezas.filter((p) => !usoEnReparaciones.find((u) => u.id === p.id_pieza)),
    }),
    [piezas, usoEnReparaciones]
  );

  // ── Pie por categoría ─────────────────────────────────────────────────────
  const pieCategorias = useMemo(
    () =>
      stockPorCategoria.slice(0, 6).map((c, i) => ({
        name: c.categoria,
        value: c.cantidad,
        color: PALETTE[i % PALETTE.length],
      })),
    [stockPorCategoria]
  );
  // ✅ Paginación para alertas
  const inicioSinStock = (paginaSinStock - 1) * itemsPorPaginaAlertas;
  const sinStockPagina = alertasStock.sinStock.slice(
    inicioSinStock,
    inicioSinStock + itemsPorPaginaAlertas
  );
  const totalPaginasSinStock = Math.ceil(alertasStock.sinStock.length / itemsPorPaginaAlertas);

  const inicioStockBajo = (paginaStockBajo - 1) * itemsPorPaginaAlertas;
  const stockBajoPagina = alertasStock.stockBajo.slice(
    inicioStockBajo,
    inicioStockBajo + itemsPorPaginaAlertas
  );
  const totalPaginasStockBajo = Math.ceil(alertasStock.stockBajo.length / itemsPorPaginaAlertas);

  const inicioSinUso = (paginaSinUso - 1) * itemsPorPaginaAlertas;
  const sinUsoPagina = alertasStock.nunca.slice(inicioSinUso, inicioSinUso + itemsPorPaginaAlertas);
  const totalPaginasSinUso = Math.ceil(alertasStock.nunca.length / itemsPorPaginaAlertas);

  // Resetear páginas cuando cambian los filtros
  useEffect(() => {
    setPaginaSinStock(1);
    setPaginaStockBajo(1);
    setPaginaSinUso(1);
  }, [filtroCategoria, filtroBusqueda]);

  // ── Exportar PDF ──────────────────────────────────────────────────────────
  const handleExportarPDF = async () => {
    setExportando(true);
    try {
      await exportarPDF(pdfRef, 'Reporte_Piezas', 'Reporte de Piezas e Inventario');
    } catch (err) {
      console.error(err);
      alert('No se pudo generar el PDF.\nnpm install html2canvas jspdf');
    } finally {
      setExportando(false);
    }
  };

  // ── Loading / Error ───────────────────────────────────────────────────────
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
        <span style={{ fontWeight: 600 }}>Cargando reporte de piezas...</span>
      </div>
    );
  if (error)
    return (
      <Alert variant="danger" style={{ borderRadius: 10 }}>
        <i className="fas fa-exclamation-triangle me-2"></i>
        {error}
      </Alert>
    );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="pz-wrap" ref={pdfRef}>
      {/* Header */}
      <div className="pz-header">
        <div className="pz-header-top">
          <div>
            <h2>Reporte de Piezas</h2>
            <p>
              {piezas.length} piezas · {categorias.length} categorías
            </p>
          </div>
          <BtnExportarPDF
            onClick={handleExportarPDF}
            exportando={exportando}
            disabled={piezas.length === 0}
          />
        </div>
      </div>

      {/* Filtros */}
      <div className="pz-filtros">
        <select
          className="pz-select"
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
        >
          <option value="todas">📦 Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <input
          className="pz-input"
          type="text"
          placeholder="🔍 Buscar pieza..."
          value={filtroBusqueda}
          onChange={(e) => setFiltroBusqueda(e.target.value)}
        />
      </div>

      {/* ── SECCIÓN 1: STOCK E INVENTARIO ── */}
      <div className="pz-seccion-titulo">
        <i className="fas fa-boxes"></i>
        Stock e Inventario
      </div>

      {/* KPIs */}
      <div className="pz-kpi-grid">
        {[
          {
            label: 'Total Piezas',
            value: kpis.totalPiezas,
            sub: 'registradas',
            icon: '🔩',
            color: '#6366f1',
          },
          {
            label: 'Con Stock',
            value: kpis.conStock,
            sub: 'disponibles',
            icon: '✅',
            color: '#10b981',
          },
          {
            label: 'Sin Stock',
            value: kpis.sinStock,
            sub: 'agotadas',
            icon: '❌',
            color: '#f43f5e',
          },
          {
            label: 'Stock Bajo',
            value: kpis.stockBajo,
            sub: `≤ ${STOCK_BAJO} unid.`,
            icon: '⚠️',
            color: '#f59e0b',
          },
          {
            label: 'Valor Inventario',
            value: `$${fmt(kpis.valorInventario)}`,
            sub: 'precio × stock',
            icon: '💰',
            color: '#10b981',
          },
          {
            label: 'Categorías',
            value: kpis.totalCategorias,
            sub: 'tipos de pieza',
            icon: '📂',
            color: '#a78bfa',
          },
        ].map((k) => (
          <div className="pz-kpi-card" key={k.label}>
            <div className="pz-kpi-label">
              {k.icon} {k.label}
            </div>
            <div className="pz-kpi-value" style={{ color: k.color }}>
              {k.value}
            </div>
            <div className="pz-kpi-sub">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Gráficas stock */}
      <div className="pz-charts-grid-2">
        <div className="pz-chart-card">
          <div className="pz-chart-title">
            <span className="pz-title-icon">
              <i className="fas fa-chart-bar"></i>
            </span>
            <span>Stock por Categoría</span>
          </div>
          {stockPorCategoria.length === 0 ? (
            <p className="pz-empty">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={stockPorCategoria}
                margin={{ top: 0, right: 10, left: -10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="categoria"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-10}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="stock" name="Unidades" radius={[6, 6, 0, 0]}>
                  {stockPorCategoria.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="pz-chart-card">
          <div className="pz-chart-title">
            <span className="pz-title-icon">
              <i className="fas fa-chart-pie"></i>
            </span>
            <span>Piezas por Categoría</span>
          </div>
          {pieCategorias.length === 0 ? (
            <p className="pz-empty">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieCategorias}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieCategorias.map((d, i) => (
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

      {/* ── SECCIÓN 2: USO EN REPARACIONES ── */}
      <div className="pz-seccion-titulo">
        <i className="fas fa-tools"></i>
        Uso en Reparaciones
      </div>

      {/* Top 10 Piezas más Usadas - Tarjetas */}
      <div className="pz-chart-card" style={{ marginBottom: 16 }}>
        <div className="pz-chart-title">
          <span className="pz-title-icon">
            <i className="fas fa-trophy"></i>
          </span>
          <span>Top 10 Piezas más Usadas</span>
        </div>
        {top10Usadas.length === 0 ? (
          <p className="pz-empty">Sin datos de uso en reparaciones</p>
        ) : (
          <div className="pz-ranking-grid">
            {top10Usadas.map((pieza, idx) => {
              const maxVeces = top10Usadas[0]?.veces || 1;
              const porcentaje = (pieza.veces / maxVeces) * 100;
              return (
                <div key={idx} className="pz-ranking-card">
                  <div className="pz-ranking-position">
                    <span
                      className={`pz-ranking-number ${idx === 0 ? 'pos-1' : idx === 1 ? 'pos-2' : idx === 2 ? 'pos-3' : 'pos-n'}`}
                    >
                      {idx + 1}
                    </span>
                  </div>
                  <div className="pz-ranking-info">
                    <div className="pz-ranking-nombre">{pieza.nombre}</div>
                    <div className="pz-ranking-stats">
                      <span className="pz-ranking-veces">
                        <i className="fas fa-hammer"></i> {pieza.veces}{' '}
                        {pieza.veces === 1 ? 'vez' : 'veces'}
                      </span>
                    </div>
                  </div>
                  <div className="pz-ranking-bar">
                    <div
                      className="pz-ranking-progress"
                      style={{
                        width: `${porcentaje}%`,
                        background:
                          idx === 0
                            ? '#f59e0b'
                            : idx === 1
                              ? '#94a3b8'
                              : idx === 2
                                ? '#cd7f32'
                                : '#6366f1',
                      }}
                    />
                  </div>
                  <div className="pz-ranking-porcentaje">{Math.round(porcentaje)}%</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── SECCIÓN 3: FACTURACIÓN Y MÁRGENES ── */}
      <div className="pz-seccion-titulo">
        <i className="fas fa-dollar-sign"></i>
        Facturación y Márgenes
      </div>

      {/* Comparativa precio stock vs cobrado */}
      <div className="pz-chart-card" style={{ marginBottom: 16 }}>
        <div className="pz-chart-title">
          <span className="pz-title-icon">
            <i className="fas fa-balance-scale"></i>
          </span>
          <span>Precio Actual vs Promedio Cobrado</span>
        </div>
        {comparativaPrecios.length === 0 ? (
          <p className="pz-empty">Sin datos de reparaciones</p>
        ) : (
          <>
            <div className="pz-leyenda-row">
              <span className="pz-leyenda-dot" style={{ background: '#6366f1' }}></span>
              <span>Precio actual en stock</span>
              <span
                className="pz-leyenda-dot"
                style={{ background: '#22d3ee', marginLeft: 16 }}
              ></span>
              <span>Promedio cobrado al cliente</span>
              <span
                className="pz-leyenda-dot"
                style={{ background: '#10b981', marginLeft: 16 }}
              ></span>
              <span>Ganancia mano de obra (unit.)</span>
            </div>
            <ResponsiveContainer width="100%" height={230}>
              <BarChart
                data={comparativaPrecios}
                margin={{ top: 0, right: 10, left: -10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="nombre"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-10}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="precioActual"
                  name="Precio actual"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="promCobrado"
                  name="Prom. cobrado"
                  fill="#22d3ee"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="gananciaUnit"
                  name="Ganancia unit."
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* Tabla de facturación CON PAGINACIÓN */}
      <div className="pz-chart-card" style={{ marginBottom: 16 }}>
        <div className="pz-chart-title">
          <span className="pz-title-icon">
            <i className="fas fa-list-ol"></i>
          </span>
          <span>Detalle de Facturación por Pieza</span>
          <span className="pz-badge-count">{usoEnReparaciones.length} piezas usadas</span>
        </div>
        {usoEnReparaciones.length === 0 ? (
          <p className="pz-empty">Sin datos</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="pz-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Pieza</th>
                    <th>Usos</th>
                    <th>Total facturado</th>
                    <th>Costo piezas</th>
                    <th>Mano de obra</th>
                    <th>% margen</th>
                  </tr>
                </thead>
                <tbody>
                  {facturacionPagina.map((u, i) => {
                    const margen =
                      u.facturado > 0 ? Math.round((u.manoObra / u.facturado) * 100) : 0;
                    const numGlobal = inicioFacturacion + i + 1;
                    return (
                      <tr key={i}>
                        <td style={{ color: '#94a3b8', fontSize: 12 }}>{numGlobal}</td>
                        <td style={{ fontWeight: 600 }}>{u.nombre}</td>
                        <td style={{ color: '#6366f1', fontWeight: 700 }}>
                          {u.veces} {u.veces === 1 ? 'uso' : 'usos'}
                        </td>
                        <td style={{ color: '#10b981', fontWeight: 700 }}>${fmt(u.facturado)}</td>
                        <td>${fmt(u.costoPieza)}</td>
                        <td style={{ color: '#f59e0b' }}>${fmt(u.manoObra)}</td>
                        <td>
                          <div className="pz-margen-wrap">
                            <div
                              className="pz-margen-bar"
                              style={{ width: `${Math.min(margen, 100)}%` }}
                            ></div>
                            <span className="pz-margen-pct">{margen}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación Facturación */}
            {totalPaginasFacturacion > 1 && (
              <div className="pz-pagination">
                <div className="pz-pagination-info">
                  Mostrando {inicioFacturacion + 1} -{' '}
                  {Math.min(finFacturacion, usoEnReparaciones.length)} de {usoEnReparaciones.length}{' '}
                  piezas
                </div>
                <div className="pz-pagination-controls">
                  <button
                    className="pz-pagination-btn"
                    onClick={() => setPaginaFacturacion(1)}
                    disabled={paginaFacturacion === 1}
                  >
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                  <button
                    className="pz-pagination-btn"
                    onClick={() => setPaginaFacturacion(paginaFacturacion - 1)}
                    disabled={paginaFacturacion === 1}
                  >
                    <i className="fas fa-angle-left"></i>
                  </button>
                  <span className="pz-pagination-current">
                    Página {paginaFacturacion} de {totalPaginasFacturacion}
                  </span>
                  <button
                    className="pz-pagination-btn"
                    onClick={() => setPaginaFacturacion(paginaFacturacion + 1)}
                    disabled={paginaFacturacion === totalPaginasFacturacion}
                  >
                    <i className="fas fa-angle-right"></i>
                  </button>
                  <button
                    className="pz-pagination-btn"
                    onClick={() => setPaginaFacturacion(totalPaginasFacturacion)}
                    disabled={paginaFacturacion === totalPaginasFacturacion}
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </div>
                <div className="pz-pagination-rows">
                  <span>Mostrar</span>
                  <select
                    value={itemsPorPaginaFacturacion}
                    onChange={(e) => {
                      setItemsPorPaginaFacturacion(Number(e.target.value));
                      setPaginaFacturacion(1);
                    }}
                    className="pz-pagination-select"
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
          </>
        )}
      </div>

      {/* ── SECCIÓN 4: ALERTAS ── */}
      <div className="pz-seccion-titulo">
        <i className="fas fa-exclamation-triangle"></i>
        Alertas de Inventario
      </div>

      <div className="pz-alertas-grid">
        {/* Sin stock */}
        <div className="pz-chart-card pz-alerta-card">
          <div className="pz-chart-title">
            <span
              className="pz-title-icon"
              style={{ background: 'linear-gradient(135deg,#f43f5e,#fb7185)' }}
            >
              <i className="fas fa-times-circle"></i>
            </span>
            <span>Sin Stock ({alertasStock.sinStock.length})</span>
          </div>
          {alertasStock.sinStock.length === 0 ? (
            <p className="pz-empty pz-ok"> Todas las piezas tienen stock</p>
          ) : (
            <>
              <div className="pz-alerta-lista">
                {sinStockPagina.map((p, i) => (
                  <div key={i} className="pz-alerta-item pz-alerta-rojo">
                    <span className="pz-alerta-nombre">{p.nombre_pieza}</span>
                    <span className="pz-alerta-cat">{p.categoria?.categoria ?? '—'}</span>
                    <span className="pz-alerta-badge rojo">0 unid.</span>
                  </div>
                ))}
              </div>
              {totalPaginasSinStock > 1 && (
                <div className="pz-alerta-pagination">
                  <button
                    className="pz-alerta-pagination-btn"
                    onClick={() => setPaginaSinStock(paginaSinStock - 1)}
                    disabled={paginaSinStock === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <span className="pz-alerta-pagination-info">
                    {paginaSinStock} / {totalPaginasSinStock}
                  </span>
                  <button
                    className="pz-alerta-pagination-btn"
                    onClick={() => setPaginaSinStock(paginaSinStock + 1)}
                    disabled={paginaSinStock === totalPaginasSinStock}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Stock bajo */}
        <div className="pz-chart-card pz-alerta-card">
          <div className="pz-chart-title">
            <span
              className="pz-title-icon"
              style={{ background: 'linear-gradient(135deg,#f59e0b,#fbbf24)' }}
            >
              <i className="fas fa-exclamation-circle"></i>
            </span>
            <span>Stock Bajo ({alertasStock.stockBajo.length})</span>
          </div>
          {alertasStock.stockBajo.length === 0 ? (
            <p className="pz-empty pz-ok">✅ Sin piezas en stock crítico</p>
          ) : (
            <>
              <div className="pz-alerta-lista">
                {stockBajoPagina.map((p, i) => (
                  <div key={i} className="pz-alerta-item pz-alerta-amarillo">
                    <span className="pz-alerta-nombre">{p.nombre_pieza}</span>
                    <span className="pz-alerta-cat">{p.categoria?.categoria ?? '—'}</span>
                    <span className="pz-alerta-badge amarillo">{p.stock} unid.</span>
                  </div>
                ))}
              </div>
              {totalPaginasStockBajo > 1 && (
                <div className="pz-alerta-pagination">
                  <button
                    className="pz-alerta-pagination-btn"
                    onClick={() => setPaginaStockBajo(paginaStockBajo - 1)}
                    disabled={paginaStockBajo === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <span className="pz-alerta-pagination-info">
                    {paginaStockBajo} / {totalPaginasStockBajo}
                  </span>
                  <button
                    className="pz-alerta-pagination-btn"
                    onClick={() => setPaginaStockBajo(paginaStockBajo + 1)}
                    disabled={paginaStockBajo === totalPaginasStockBajo}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Nunca usadas - Sin uso */}
        <div className="pz-chart-card pz-alerta-card">
          <div className="pz-chart-title">
            <span
              className="pz-title-icon"
              style={{ background: 'linear-gradient(135deg,#94a3b8,#cbd5e1)' }}
            >
              <i className="fas fa-archive"></i>
            </span>
            <span>Sin uso ({alertasStock.nunca.length})</span>
          </div>
          {alertasStock.nunca.length === 0 ? (
            <p className="pz-empty pz-ok">✅ Todas las piezas fueron usadas</p>
          ) : (
            <>
              <div className="pz-alerta-lista">
                {sinUsoPagina.map((p, i) => (
                  <div key={i} className="pz-alerta-item pz-alerta-gris">
                    <span className="pz-alerta-nombre">{p.nombre_pieza}</span>
                    <span className="pz-alerta-cat">{p.categoria?.categoria ?? '—'}</span>
                    <span className="pz-alerta-badge gris">${fmt(p.precio)}</span>
                  </div>
                ))}
              </div>
              {totalPaginasSinUso > 1 && (
                <div className="pz-alerta-pagination">
                  <button
                    className="pz-alerta-pagination-btn"
                    onClick={() => setPaginaSinUso(paginaSinUso - 1)}
                    disabled={paginaSinUso === 1}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  <span className="pz-alerta-pagination-info">
                    {paginaSinUso} / {totalPaginasSinUso}
                  </span>
                  <button
                    className="pz-alerta-pagination-btn"
                    onClick={() => setPaginaSinUso(paginaSinUso + 1)}
                    disabled={paginaSinUso === totalPaginasSinUso}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── TABLA GENERAL DE PIEZAS CON PAGINACIÓN ── */}
      <div className="pz-seccion-titulo">
        <i className="fas fa-table"></i>
        Inventario Completo
        {(filtroCategoria !== 'todas' || filtroBusqueda) && (
          <span className="pz-filtro-activo">filtrado · {piezasFiltradas.length} resultados</span>
        )}
      </div>

      <div className="pz-chart-card">
        <div style={{ overflowX: 'auto' }}>
          <table className="pz-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Pieza</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Valor total</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {inventarioPagina.map((p, i) => {
                const stock = p.stock ?? 0;
                const estadoClass =
                  stock === 0 ? 'rojo' : stock <= STOCK_BAJO ? 'amarillo' : 'verde';
                const estadoLabel =
                  stock === 0 ? 'Agotado' : stock <= STOCK_BAJO ? 'Stock bajo' : 'Disponible';
                const numGlobal = inicioInventario + i + 1;
                return (
                  <tr key={i}>
                    <td style={{ color: '#94a3b8', fontSize: 12 }}>{numGlobal}</td>
                    <td style={{ fontWeight: 600 }}>{p.nombre_pieza}</td>
                    <td style={{ color: '#64748b', fontSize: 12 }}>
                      {p.categoria?.categoria ?? '—'}
                    </td>
                    <td style={{ color: '#6366f1', fontWeight: 600 }}>${fmt(p.precio)}</td>
                    <td style={{ fontWeight: 700 }}>{stock}</td>
                    <td style={{ color: '#10b981' }}>${fmt((p.precio ?? 0) * stock)}</td>
                    <td>
                      <span className={`pz-estado-badge pz-estado-${estadoClass}`}>
                        {estadoLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {inventarioPagina.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}
                  >
                    No hay piezas que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación Inventario */}
        {totalPaginasInventario > 1 && (
          <div className="pz-pagination">
            <div className="pz-pagination-info">
              Mostrando {inicioInventario + 1} - {Math.min(finInventario, piezasFiltradas.length)}{' '}
              de {piezasFiltradas.length} piezas
            </div>
            <div className="pz-pagination-controls">
              <button
                className="pz-pagination-btn"
                onClick={() => setPaginaInventario(1)}
                disabled={paginaInventario === 1}
              >
                <i className="fas fa-angle-double-left"></i>
              </button>
              <button
                className="pz-pagination-btn"
                onClick={() => setPaginaInventario(paginaInventario - 1)}
                disabled={paginaInventario === 1}
              >
                <i className="fas fa-angle-left"></i>
              </button>
              <span className="pz-pagination-current">
                Página {paginaInventario} de {totalPaginasInventario}
              </span>
              <button
                className="pz-pagination-btn"
                onClick={() => setPaginaInventario(paginaInventario + 1)}
                disabled={paginaInventario === totalPaginasInventario}
              >
                <i className="fas fa-angle-right"></i>
              </button>
              <button
                className="pz-pagination-btn"
                onClick={() => setPaginaInventario(totalPaginasInventario)}
                disabled={paginaInventario === totalPaginasInventario}
              >
                <i className="fas fa-angle-double-right"></i>
              </button>
            </div>
            <div className="pz-pagination-rows">
              <span>Mostrar</span>
              <select
                value={itemsPorPaginaInventario}
                onChange={(e) => {
                  setItemsPorPaginaInventario(Number(e.target.value));
                  setPaginaInventario(1);
                }}
                className="pz-pagination-select"
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
      </div>
    </div>
  );
};

export default ReportePiezas;
