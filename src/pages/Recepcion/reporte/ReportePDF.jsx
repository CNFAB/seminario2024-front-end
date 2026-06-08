// components/ReportePDF.jsx
import React from "react";

/**
 * Componente que renderiza el reporte completo para ser capturado con html2canvas.
 * Se monta oculto (display:none) y el hook lo hace visible justo antes de la captura.
 *
 * Props:
 *  - datosCliente:     { nombre, apellido, correo, numero_celular }
 *  - datosDispositivo: { marcaNombre, modeloNombre, imei }
 *  - datosIngreso:     { sim, memoria_sd, revision_tecnica,
 *                        observacion, estado_del_ingreso, tecnicoNombre }
 */
const ReportePDF = React.forwardRef(
  ({ datosCliente = {}, datosDispositivo = {}, datosIngreso = {} }, ref) => {

    const fecha = new Date().toLocaleDateString("es-AR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });

    const boolLabel = (val) => {
      if (val === true || val === "true" || val === 1) return "✔ Sí";
      if (val === false || val === "false" || val === 0) return "✖ No";
      return "—";
    };

    return (
      <div
        ref={ref}
        style={{
          display: "none",
          width: "794px",
          backgroundColor: "#ffffff",
          fontFamily: "'Segoe UI', Arial, sans-serif",
          fontSize: "13px",
          color: "#1a1a2e",
        }}
      >
        {/* ── ENCABEZADO ── */}
        <div style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
          color: "#fff",
          padding: "28px 36px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}>
          <div>
            <div style={{ fontSize: "22px", fontWeight: "800", marginBottom: "4px" }}>
              📋 Comprobante de Ingreso
            </div>
            <div style={{ fontSize: "12px", opacity: 0.7 }}>
              Sistema de Gestión de Reparaciones
            </div>
          </div>
          <div style={{
            background: "rgba(255,255,255,0.15)",
            borderRadius: "8px",
            padding: "8px 14px",
            fontSize: "12px",
            textAlign: "right",
          }}>
            <div style={{ opacity: 0.8, marginBottom: "2px" }}>Fecha de emisión</div>
            <div style={{ fontWeight: "700" }}>{fecha}</div>
          </div>
        </div>

        {/* ── CUERPO ── */}
        <div style={{ padding: "28px 36px" }}>

          {/* CLIENTE */}
          <Seccion titulo="👤 Datos del Cliente">
            <FilaDoble
              left={<Campo label="Nombre completo" valor={`${datosCliente.nombre ?? ""} ${datosCliente.apellido ?? ""}`.trim() || "—"} />}
              right={<Campo label="Correo electrónico" valor={datosCliente.correo || "—"} />}
            />
            <FilaDoble
              left={<Campo label="Teléfono / Celular" valor={datosCliente.numero_celular || "—"} />}
              right={null}
            />
          </Seccion>

          <Separador />

          {/* DISPOSITIVO */}
          <Seccion titulo="📱 Datos del Dispositivo">
            <FilaDoble
              left={<Campo label="Marca" valor={datosDispositivo.marcaNombre || "—"} />}
              right={<Campo label="Modelo" valor={datosDispositivo.modeloNombre || "—"} />}
            />
            <FilaDoble
              left={<Campo label="IMEI" valor={datosDispositivo.imei || "No registrado"} />}
              right={null}
            />
          </Seccion>

          <Separador />

          {/* INGRESO */}
          <Seccion titulo="🔧 Datos del Ingreso">

            {/* Técnico — destacado */}
            <div style={{
              background: "linear-gradient(90deg, #e8f4fd, #d1ecf8)",
              border: "1px solid #90cdf4",
              borderRadius: "10px",
              padding: "12px 16px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}>
              <span style={{ fontSize: "22px" }}>👨‍🔧</span>
              <div>
                <div style={{ fontSize: "11px", color: "#4a90a4", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Técnico asignado
                </div>
                <div style={{ fontSize: "15px", fontWeight: "700", color: "#0f3460" }}>
                  {datosIngreso.tecnicoNombre || "—"}
                </div>
              </div>
            </div>

            <FilaDoble
              left={<Campo label="Tiene SIM" valor={boolLabel(datosIngreso.sim)} />}
              right={<Campo label="Memoria SD" valor={boolLabel(datosIngreso.memoria_sd)} />}
            />
            <FilaDoble
              left={<Campo label="Revisión técnica" valor={boolLabel(datosIngreso.revision_tecnica)} />}
              right={null}
            />

            {datosIngreso.observacion && (
              <div style={{ marginTop: "12px" }}>
                <Campo
                  label="Comentario del cliente"
                  valor={datosIngreso.observacion}
                  multilinea
                />
              </div>
            )}

            {datosIngreso.estado_del_ingreso && (
              <div style={{ marginTop: "12px" }}>
                <Campo
                  label="Observaciones técnicas"
                  valor={datosIngreso.estado_del_ingreso}
                  multilinea
                />
              </div>
            )}
          </Seccion>

          {/* PIE */}
          <div style={{
            marginTop: "32px",
            borderTop: "1px dashed #cbd5e0",
            paddingTop: "16px",
            textAlign: "center",
            fontSize: "11px",
            color: "#718096",
          }}>
            Documento generado automáticamente · {fecha}
          </div>
        </div>
      </div>
    );
  }
);

ReportePDF.displayName = "ReportePDF";
export default ReportePDF;

/* ── Componentes auxiliares de layout ── */

const Seccion = ({ titulo, children }) => (
  <div style={{ marginBottom: "4px" }}>
    <div style={{
      fontSize: "13px",
      fontWeight: "700",
      color: "#0f3460",
      borderLeft: "4px solid #0f3460",
      paddingLeft: "10px",
      marginBottom: "14px",
      textTransform: "uppercase",
      letterSpacing: "0.5px",
    }}>
      {titulo}
    </div>
    {children}
  </div>
);

const FilaDoble = ({ left, right }) => (
  <div style={{ display: "flex", gap: "16px", marginBottom: "10px" }}>
    <div style={{ flex: 1 }}>{left}</div>
    <div style={{ flex: 1 }}>{right}</div>
  </div>
);

const Campo = ({ label, valor, multilinea = false }) => (
  <div>
    <div style={{
      fontSize: "10px",
      fontWeight: "600",
      color: "#718096",
      textTransform: "uppercase",
      letterSpacing: "0.4px",
      marginBottom: "3px",
    }}>
      {label}
    </div>
    <div style={{
      background: "#f7fafc",
      border: "1px solid #e2e8f0",
      borderRadius: "6px",
      padding: multilinea ? "8px 10px" : "6px 10px",
      fontWeight: "500",
      color: "#1a202c",
      whiteSpace: multilinea ? "pre-wrap" : "normal",
      minHeight: multilinea ? "48px" : "auto",
    }}>
      {valor}
    </div>
  </div>
);

const Separador = () => (
  <div style={{ borderTop: "1px solid #e2e8f0", margin: "20px 0" }} />
);