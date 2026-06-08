import React, { useEffect, useState } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
import { estadisticaService } from '../../../services/estadisticaService';
import { usuarioService } from '../../../services/UsuarioService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import "./Dashboard.css";

// ── Paleta ─────────────────────────────────────────────────────────────────
const ESTADO_COLOR = {
  PENDIENTE:       "#f59e0b",
  EN_REPARACION:   "#6366f1",
  TERMINADO:       "#10b981",
  TERMINADA:       "#10b981",
  CANCELADO:       "#f43f5e",
  ESPERANDO_PIEZA: "#22d3ee",
};
const ESTADO_LABEL = {
  PENDIENTE:       "Pendiente",
  EN_REPARACION:   "En reparación",
  TERMINADO:       "Terminada",
  TERMINADA:       "Terminada",
  CANCELADO:       "Cancelado",
  ESPERANDO_PIEZA: "Esperando pieza",
};

// ── Helpers ────────────────────────────────────────────────────────────────
const saludo = () => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
};

const fechaHoy = () => new Date().toLocaleDateString("es-AR", {
  weekday: "long", day: "numeric", month: "long", year: "numeric"
});

const iniciales = (nombre, apellido) =>
  ((nombre?.[0] ?? "") + (apellido?.[0] ?? "")).toUpperCase() || "?";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "#1e293b", border: "1px solid #334155",
      borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "#e2e8f0"
    }}>
      <div style={{ fontWeight: 700, marginBottom: 4, color: "#a5b4fc" }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color ?? "#e2e8f0" }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

// ── Componente principal ───────────────────────────────────────────────────
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    resumen: { total_piezas: 0, ingresos_mes: 0, reparaciones_hoy: 0, stock_bajo: 0 },
    ingresos_mensuales: [],
    top_tecnicos: [],
    top_recepcionistas: [],
    top_marcas: [],
    piezas_mas_usadas: [],
    reparaciones_por_estado: [],
  });
  const [cargaTrabajo, setCargaTrabajo] = useState([]);

  useEffect(() => { cargarDashboard(); }, []);

  const cargarDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const dashboard = await estadisticaService.obtenerDashboard();
      console.log("🔍 Dashboard recibido:", dashboard);
      
      const resumenData = dashboard?.resumen ?? {};
      const ingresosData = dashboard?.ingresos ?? {};
      const reparacionesEstado = dashboard?.reparaciones_por_estado ?? {};
      
      const reparacionesArray = Object.entries(reparacionesEstado).map(([estado, total]) => ({
        estado: estado,
        total: total
      }));
      
      // TOP TÉCNICOS
      let topTecnicosData = [];
      try {
        const topTecnicos = await estadisticaService.obtenerTopTecnicos();
        topTecnicosData = topTecnicos?.data ?? topTecnicos ?? [];
      } catch (e) {
        console.log("⚠️ Error cargando top técnicos:", e);
      }
      
      // TOP MARCAS
      let topMarcasData = [];
      try {
        const topMarcas = await estadisticaService.obtenerTopMarcas();
        topMarcasData = topMarcas?.data ?? topMarcas ?? [];
      } catch (e) {
        console.log("⚠️ Error cargando top marcas:", e);
      }
      
      // TOP RECEPCIONISTAS
      let topRecepcionistasData = [];
      try {
        const topRecepcionistas = await estadisticaService.obtenerTopRecepcionistas();
        topRecepcionistasData = topRecepcionistas?.data ?? topRecepcionistas ?? [];
      } catch (e) {
        console.log("⚠️ Error cargando top recepcionistas:", e);
      }
      
      // PIEZAS MÁS USADAS
      let piezasData = [];
      try {
        const piezas = await estadisticaService.obtenerPiezasMasUsadas();
        piezasData = piezas?.data ?? piezas ?? [];
      } catch (e) {
        console.log("⚠️ Error cargando piezas:", e);
      }
      
      // INGRESOS MENSUALES
      let ingresosMensuales = [];
      try {
        const ingresos = await estadisticaService.obtenerIngresosMensuales?.();
        ingresosMensuales = ingresos?.data?.ingresos_por_mes ?? ingresos?.ingresos_por_mes ?? [];
      } catch (e) {
        console.log("⚠️ No se pudo obtener ingresos mensuales");
      }
      
      setData({
        resumen: {
          total_piezas: resumenData.total_piezas ?? 0,
          ingresos_mes: ingresosData.mes_actual ?? 0,
          reparaciones_hoy: resumenData.reparaciones_hoy ?? 0,
          stock_bajo: resumenData.stock_bajo ?? 0,
        },
        ingresos_mensuales: ingresosMensuales,
        top_tecnicos: topTecnicosData,
        top_recepcionistas: topRecepcionistasData,
        piezas_mas_usadas: piezasData,
        top_marcas: topMarcasData,
        reparaciones_por_estado: reparacionesArray,
      });

      // Carga de trabajo
      try {
        const carga = await usuarioService.obtenerCargaTrabajoTecnicos();
        const lista = Array.isArray(carga) ? carga : carga?.data ?? [];
        setCargaTrabajo(lista);
      } catch { setCargaTrabajo([]); }

    } catch (err) {
      console.error("❌ Error en cargarDashboard:", err);
      setError("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="dash-loading">
      <Spinner animation="border" size="sm" style={{ color: "#6366f1" }} />
      <span>Cargando dashboard...</span>
    </div>
  );

  if (error) return (
    <Alert variant="danger" style={{ borderRadius: 10, margin: 0 }}>
      <i className="fas fa-exclamation-triangle me-2"></i>{error}
    </Alert>
  );

  const { resumen, ingresos_mensuales, top_tecnicos, top_recepcionistas, top_marcas, piezas_mas_usadas, reparaciones_por_estado } = data;
  const totalReps = reparaciones_por_estado.reduce((a, r) => a + (r.total ?? 0), 0);
  const maxPiezas = piezas_mas_usadas.length > 0
    ? Math.max(...piezas_mas_usadas.map(p => p.veces_usada ?? p.usos ?? p.total ?? 0))
    : 1;
  const maxCarga = cargaTrabajo.length > 0
    ? Math.max(...cargaTrabajo.map(t => t.carga_trabajo ?? 0), 1)
    : 1;

  return (
    <div className="dash-wrap">

      {/* Saludo */}
      <div className="dash-saludo">
        <div className="dash-saludo-titulo">{saludo()}, Administrador </div>
        <div className="dash-saludo-sub">
          <i className="fas fa-calendar-alt"></i>
          {fechaHoy().charAt(0).toUpperCase() + fechaHoy().slice(1)}
        </div>
      </div>

      {/* KPIs */}
      <div className="dash-kpi-grid">
        <div className="dash-kpi-card">
          <div className="dash-kpi-icon azul"><i className="fas fa-boxes"></i></div>
          <div>
            <div className="dash-kpi-valor">{resumen.total_piezas}</div>
            <div className="dash-kpi-label">Total piezas</div>
          </div>
        </div>
        <div className="dash-kpi-card">
          <div className="dash-kpi-icon verde"><i className="fas fa-dollar-sign"></i></div>
          <div>
            <div className="dash-kpi-valor">
              ${Number(resumen.ingresos_mes ?? 0).toLocaleString("es-AR")}
            </div>
            <div className="dash-kpi-label">Ingresos del mes</div>
          </div>
        </div>
        <div className="dash-kpi-card">
          <div className="dash-kpi-icon cyan"><i className="fas fa-wrench"></i></div>
          <div>
            <div className="dash-kpi-valor">{resumen.reparaciones_hoy}</div>
            <div className="dash-kpi-label">Reparaciones hoy</div>
          </div>
        </div>
        <div className="dash-kpi-card">
          <div className="dash-kpi-icon amarillo"><i className="fas fa-exclamation-circle"></i></div>
          <div>
            <div className="dash-kpi-valor">{resumen.stock_bajo}</div>
            <div className="dash-kpi-label">Stock bajo</div>
            {resumen.stock_bajo > 0 && (
              <div className="dash-kpi-trend alerta">
                <i className="fas fa-arrow-up" style={{ fontSize: 9 }}></i> Requiere atención
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gráfica ingresos + reparaciones por estado */}
      <div className="dash-grid-8-4">
        <div className="dash-chart-card">
          <div className="dash-chart-title">
            <div className="dash-chart-title-left">
              <span className="dash-title-icon"><i className="fas fa-chart-bar"></i></span>
              <span>Ingresos Mensuales</span>
            </div>
          </div>
          {ingresos_mensuales.length === 0 ? (
            <div className="dash-empty">Sin datos de ingresos mensuales</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ingresos_mensuales} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="ingresos" name="Ingresos" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-title">
            <div className="dash-chart-title-left">
              <span className="dash-title-icon"><i className="fas fa-chart-pie"></i></span>
              <span>Por Estado</span>
            </div>
          </div>
          {reparaciones_por_estado.length === 0 ? (
            <div className="dash-empty">Sin datos</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={reparaciones_por_estado}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    paddingAngle={3} dataKey="total"
                  >
                    {reparaciones_por_estado.map((r, i) => (
                      <Cell key={i} fill={ESTADO_COLOR[r.estado] ?? "#94a3b8"} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="dash-pie-lista">
                {reparaciones_por_estado.map((r, i) => (
                  <div key={i} className="dash-pie-item">
                    <div className="dash-pie-item-left">
                      <span className="dash-pie-dot" style={{ background: ESTADO_COLOR[r.estado] ?? "#94a3b8" }}></span>
                      {ESTADO_LABEL[r.estado] ?? r.estado}
                    </div>
                    <div className="dash-pie-item-right">
                      <span className="dash-pie-count">{r.total}</span>
                      <span className="dash-pie-pct">
                        {totalReps > 0 ? Math.round((r.total / totalReps) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top técnicos + Top recepcionistas */}
      <div className="dash-grid-2">
        <div className="dash-chart-card">
          <div className="dash-chart-title">
            <div className="dash-chart-title-left">
              <span className="dash-title-icon"><i className="fas fa-trophy"></i></span>
              <span>Top Técnicos</span>
            </div>
          </div>
          {top_tecnicos.length === 0 ? (
            <div className="dash-empty">Sin datos de técnicos</div>
          ) : (
            <div className="dash-tec-lista">
              {top_tecnicos.slice(0, 5).map((t, i) => {
                const posClass = i === 0 ? "p1" : i === 1 ? "p2" : i === 2 ? "p3" : "pn";
                const reps = t.reparaciones ?? t.total_reparaciones ?? t.total ?? 0;
                return (
                  <div key={i} className="dash-tec-item">
                    <span className={`dash-tec-pos ${posClass}`}>{i + 1}</span>
                    <div className="dash-tec-avatar">
                      {iniciales(t.nombre, t.apellido)}
                    </div>
                    <span className="dash-tec-nombre">
                      {`${t.nombre ?? ""} ${t.apellido ?? ""}`.trim() || `Técnico ${i + 1}`}
                    </span>
                    <span className="dash-tec-count">{reps}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="dash-chart-card">
          <div className="dash-chart-title">
            <div className="dash-chart-title-left">
              <span className="dash-title-icon"><i className="fas fa-headset"></i></span>
              <span>Top Recepcionistas</span>
            </div>
          </div>
          {top_recepcionistas.length === 0 ? (
            <div className="dash-empty">Sin datos de recepcionistas</div>
          ) : (
            <div className="dash-tec-lista">
              {top_recepcionistas.slice(0, 5).map((r, i) => {
                const posClass = i === 0 ? "p1" : i === 1 ? "p2" : i === 2 ? "p3" : "pn";
                return (
                  <div key={i} className="dash-tec-item">
                    <span className={`dash-tec-pos ${posClass}`}>{i + 1}</span>
                    <div className="dash-tec-avatar">
                      {iniciales(r.nombre, r.apellido)}
                    </div>
                    <span className="dash-tec-nombre">
                      {`${r.nombre ?? ""} ${r.apellido ?? ""}`.trim() || `Recepcionista ${i + 1}`}
                    </span>
                    <span className="dash-tec-count">{r.total_ingresos}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ✅ TOP MARCAS y PIEZAS MÁS USADAS - una al lado de la otra con el mismo estilo */}
      <div className="dash-grid-2">
        {/* Top Marcas más reparadas */}
        <div className="dash-chart-card">
          <div className="dash-chart-title">
            <div className="dash-chart-title-left">
              <span className="dash-title-icon"><i className="fas fa-chart-line"></i></span>
              <span>Top Marcas más reparadas</span>
            </div>
          </div>
          {top_marcas.length === 0 ? (
            <div className="dash-empty">Sin datos de marcas</div>
          ) : (
            <div className="dash-tec-lista">
              {top_marcas.slice(0, 5).map((m, i) => {
                const posClass = i === 0 ? "p1" : i === 1 ? "p2" : i === 2 ? "p3" : "pn";
                return (
                  <div key={i} className="dash-tec-item">
                    <span className={`dash-tec-pos ${posClass}`}>{i + 1}</span>
                    <div className="dash-tec-avatar" style={{ background: "#e2e8f0", color: "#1e293b" }}>
                      {m.marca?.charAt(0).toUpperCase() || "?"}
                    </div>
                    <span className="dash-tec-nombre">
                      {m.marca || `Marca ${i + 1}`}
                    </span>
                    <span className="dash-tec-count">{m.total_reparaciones}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Piezas Más Usadas - mismo formato de lista numerada */}
        <div className="dash-chart-card">
          <div className="dash-chart-title">
            <div className="dash-chart-title-left">
              <span className="dash-title-icon"><i className="fas fa-puzzle-piece"></i></span>
              <span>Piezas Más Usadas</span>
            </div>
          </div>
          {piezas_mas_usadas.length === 0 ? (
            <div className="dash-empty">Sin datos de piezas</div>
          ) : (
            <div className="dash-tec-lista">
              {piezas_mas_usadas.slice(0, 5).map((p, i) => {
                const posClass = i === 0 ? "p1" : i === 1 ? "p2" : i === 2 ? "p3" : "pn";
                const usos = p.veces_usada ?? p.usos ?? p.total ?? 0;
                const nombrePieza = p.nombre_pieza ?? p.nombre ?? `Pieza ${i + 1}`;
                return (
                  <div key={i} className="dash-tec-item">
                    <span className={`dash-tec-pos ${posClass}`}>{i + 1}</span>
                    <div className="dash-tec-avatar" style={{ background: "#e2e8f0", color: "#1e293b" }}>
                      {nombrePieza.charAt(0).toUpperCase() || "🔧"}
                    </div>
                    <span className="dash-tec-nombre">
                      {nombrePieza}
                    </span>
                    <span className="dash-tec-count">{usos}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Carga de trabajo actual */}
      {cargaTrabajo.length > 0 && (
        <div className="dash-chart-card">
          <div className="dash-chart-title">
            <div className="dash-chart-title-left">
              <span className="dash-title-icon"><i className="fas fa-tasks"></i></span>
              <span>Carga de Trabajo Actual</span>
            </div>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>reparaciones activas por técnico</span>
          </div>
          <div className="dash-carga-lista">
            {cargaTrabajo
              .sort((a, b) => (b.carga_trabajo ?? 0) - (a.carga_trabajo ?? 0))
              .map((t, i) => {
                const carga = t.carga_trabajo ?? 0;
                const pct = maxCarga > 0 ? Math.round((carga / maxCarga) * 100) : 0;
                const nivelCls = carga >= 5 ? "alta" : carga >= 3 ? "media" : "baja";
                return (
                  <div key={i} className="dash-carga-item">
                    <span className="dash-carga-nombre">
                      {`${t.nombre ?? ""} ${t.apellido ?? ""}`.trim() || `Técnico ${i + 1}`}
                    </span>
                    <div className="dash-carga-bar-wrap">
                      <div className={`dash-carga-bar ${nivelCls}`} style={{ width: `${pct}%` }}></div>
                      <span className="dash-carga-num">{carga}</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;