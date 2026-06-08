import React, { useState, useEffect } from "react";
import { Spinner } from "react-bootstrap";
import { diagnosticoService } from "../../../services/diagnosticoService";
import reparacionService      from "../../../services/ReparacionService";
import "./ModalHistorialDispositivo.css";

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmtFecha = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });
};

const DIAG_BADGE = {
  ESPERANDO_DIAGNOSTICO: { label: "Esperando diagnóstico", cls: "amber"  },
  EN_REVISION:           { label: "En revisión",           cls: "blue"   },
  ESPERANDO_APROBACION:  { label: "Esperando aprobación",  cls: "blue"   },
  APROBADO:              { label: "Aprobado",               cls: "green"  },
  RECHAZADO:             { label: "Rechazado",              cls: "red"    },
  NO_REPARADO:           { label: "No reparado",            cls: "gray"   },
  LISTO_PARA_RETIRAR:    { label: "Listo para retirar",     cls: "purple" },
};

const REP_BADGE = {
  PENDIENTE:      { label: "Pendiente",       cls: "amber"  },
  EN_REPARACION:  { label: "En reparación",   cls: "blue"   },
  TERMINADO:      { label: "Terminada",        cls: "green"  },
  ESPERANDO_PIEZA:{ label: "Esperando pieza", cls: "amber"  },
  CANCELADO:      { label: "Cancelado",        cls: "red"    },
};

const Badge = ({ texto, cls }) => (
  <span className={`mh-badge mh-badge-${cls}`}>{texto}</span>
);

// ── Componente principal ──────────────────────────────────────────────────────
const ModalHistorialDispositivo = ({ dispositivo, onClose }) => {
  const [historial, setHistorial] = useState([]); // array de { ingreso, diagnostico, reparacion }
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!dispositivo) return;
    cargarHistorial();
  }, [dispositivo]);

  const cargarHistorial = async () => {
    setLoading(true);
    try {
      const ingresos = dispositivo.ingresos ?? [];

      const resultados = await Promise.all(
        ingresos.map(async (ing) => {
          let diagnostico  = null;
          let reparacion   = null;

          // Buscar diagnóstico de este ingreso
          try {
            const resDiag = await diagnosticoService.obtenerPorIngreso(ing.id_ingreso);
            const lista   = resDiag?.data?.data ?? resDiag?.data ?? resDiag ?? [];
            diagnostico   = Array.isArray(lista) ? lista[0] : lista;
          } catch { /* sin diagnóstico */ }

          // Buscar reparación de este ingreso
          try {
            const resRep = await reparacionService.obtenerTodas({ id_ingreso: ing.id_ingreso });
            const lista  = resRep?.data?.data ?? resRep?.data ?? [];
            reparacion   = Array.isArray(lista) ? lista[0] : lista;
          } catch { /* sin reparación */ }

          return { ingreso: ing, diagnostico, reparacion };
        })
      );

      // Ordenar por fecha más reciente primero
      resultados.sort((a, b) =>
        new Date(b.ingreso.fecha_ingreso) - new Date(a.ingreso.fecha_ingreso)
      );

      setHistorial(resultados);
    } catch (e) {
      console.error("Error cargando historial:", e);
    } finally {
      setLoading(false);
    }
  };

  if (!dispositivo) return null;

  const nombreModelo = `${dispositivo.modelo?.marca?.marca ?? ""} ${dispositivo.modelo?.nombre_modelo ?? ""}`.trim();
  const nombreCliente = `${dispositivo.cliente?.nombre ?? ""} ${dispositivo.cliente?.apellido ?? ""}`.trim();

  return (
    <div className="mh-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="mh-modal">

        {/* Header */}
        <div className="mh-header">
          <div className="mh-title">
            <div className="mh-title-icon"><i className="fas fa-mobile-alt"></i></div>
            <div>
              <div className="mh-title-text">{nombreModelo || "Dispositivo"}</div>
              <div className="mh-title-sub">{nombreCliente}</div>
            </div>
          </div>
          <button className="mh-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Info rápida */}
        <div className="mh-info-grid">
          <div className="mh-info-item">
            <div className="mh-info-label">Modelo</div>
            <div className="mh-info-value">{nombreModelo || "—"}</div>
          </div>
          <div className="mh-info-item">
            <div className="mh-info-label">IMEI / Código</div>
            <div className="mh-info-value mh-mono">
              {dispositivo.imei ?? dispositivo.codigo_interno ?? "No registrado"}
            </div>
          </div>
          <div className="mh-info-item">
            <div className="mh-info-label">Cliente</div>
            <div className="mh-info-value">
              {nombreCliente || "—"}
              {dispositivo.cliente?.numero_celular && (
                <span className="mh-info-tel"> · {dispositivo.cliente.numero_celular}</span>
              )}
            </div>
          </div>
          <div className="mh-info-item">
            <div className="mh-info-label">Total ingresos</div>
            <div className="mh-info-value" style={{ color: "#6366f1" }}>
              {dispositivo.ingresos?.length ?? 0} {dispositivo.ingresos?.length === 1 ? "vez" : "veces"}            </div>
          </div>
        </div>

        {/* Body */}
        <div className="mh-body">
          {loading ? (
            <div className="mh-loading">
              <Spinner animation="border" size="sm" style={{ color: "#6366f1" }} />
              <span>Cargando historial...</span>
            </div>
          ) : historial.length === 0 ? (
            <div className="mh-vacio">
              <i className="fas fa-clipboard"></i>
              Sin historial de ingresos
            </div>
          ) : (
            <>
              <div className="mh-seccion">Historial de ingresos</div>
              {historial.map(({ ingreso, diagnostico, reparacion }, idx) => (
                <IngresoCard
                  key={ingreso.id_ingreso}
                  ingreso={ingreso}
                  diagnostico={diagnostico}
                  reparacion={reparacion}
                  numero={historial.length - idx}
                  esUltimo={idx === 0}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Tarjeta de cada ingreso ───────────────────────────────────────────────────
const IngresoCard = ({ ingreso, diagnostico, reparacion, numero, esUltimo }) => {
  const recepNombre = `${ingreso.usuario?.nombre ?? ""} ${ingreso.usuario?.apellido ?? ""}`.trim() || "—";
  const diagTecnico = diagnostico
    ? `${diagnostico.usuario?.nombre ?? ""} ${diagnostico.usuario?.apellido ?? ""}`.trim()
    : null;
  const repTecnico  = reparacion
    ? `${reparacion.tecnico?.nombre ?? reparacion.usuario?.nombre ?? ""} ${reparacion.tecnico?.apellido ?? reparacion.usuario?.apellido ?? ""}`.trim()
    : null;

  const diagBadge = diagnostico ? (DIAG_BADGE[diagnostico.estado] ?? { label: diagnostico.estado, cls: "gray" }) : null;

  // Estado general de la reparación desde reparacionesMultiples
  const repsMultiples = reparacion?.reparacionesMultiples ?? [];
  const estadoRep = repsMultiples.length > 0
    ? repsMultiples[0].estado
    : reparacion?.estado_general ?? null;
  const repBadge = estadoRep ? (REP_BADGE[estadoRep] ?? { label: estadoRep, cls: "gray" }) : null;

  return (
    <div className="mh-ing-card">
      <div className="mh-ing-header">
        <div className="mh-ing-num">
          <span className={`mh-ing-circle ${esUltimo ? "activo" : ""}`}>{numero}</span>
          {esUltimo && <span className="mh-ing-latest">Más reciente</span>}
        </div>
        <div className="mh-ing-fecha">{fmtFecha(ingreso.fecha_ingreso)}</div>
      </div>

      <div className="mh-ing-body">

        {/* Recepcionista */}
        <div className="mh-actor-row">
          <div className="mh-actor-left">
            <div className="mh-actor-dot recep"></div>
            <div className="mh-actor-line"></div>
          </div>
          <div className="mh-actor-content">
            <div className="mh-actor-title">
              {recepNombre}
              <Badge texto="Recepcionista" cls="gray" />
            </div>
            {ingreso.comentario_cliente && (
              <div className="mh-actor-sub">"{ingreso.comentario_cliente}"</div>
            )}
          </div>
        </div>

        {/* Diagnóstico */}
        {diagnostico ? (
          <div className="mh-actor-row">
            <div className="mh-actor-left">
              <div className="mh-actor-dot diag"></div>
              {reparacion && <div className="mh-actor-line"></div>}
            </div>
            <div className="mh-actor-content">
              <div className="mh-actor-title">
                {diagTecnico || "Técnico"}
                <Badge texto="Diagnóstico" cls="blue" />
                {diagBadge && <Badge texto={diagBadge.label} cls={diagBadge.cls} />}
              </div>
              {diagnostico.causa_detectada && diagnostico.causa_detectada !== "Por determinar" && (
                <div className="mh-actor-detail">
                  <strong>Causa:</strong> {diagnostico.causa_detectada}
                </div>
              )}
              {diagnostico.solucion && diagnostico.solucion !== "Por determinar" && (
                <div className="mh-actor-detail">
                  <strong>Solución:</strong> {diagnostico.solucion}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="mh-actor-row">
            <div className="mh-actor-left">
              <div className="mh-actor-dot gray"></div>
            </div>
            <div className="mh-actor-content">
              <div className="mh-actor-none">Sin diagnóstico registrado</div>
            </div>
          </div>
        )}

        {/* Reparación */}
        {reparacion && (
          <div className="mh-actor-row">
            <div className="mh-actor-left">
              <div className="mh-actor-dot rep"></div>
            </div>
            <div className="mh-actor-content">
              <div className="mh-actor-title">
                {repTecnico || "Técnico"}
                <Badge texto="Reparación" cls="purple" />
                {repBadge && <Badge texto={repBadge.label} cls={repBadge.cls} />}
              </div>
              {repsMultiples.length > 0 && (
                <div className="mh-actor-detail">
                  {repsMultiples.map((rm, i) => (
                    <span key={i} className="mh-pieza-chip">
                      {rm.pieza?.nombre_pieza ?? `Pieza #${rm.id_pieza}`}
                      {rm.precio_total && ` · $${Number(rm.precio_total).toLocaleString("es-AR")}`}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ModalHistorialDispositivo;