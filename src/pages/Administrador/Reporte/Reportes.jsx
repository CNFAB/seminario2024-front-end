import React, { useState } from "react";
import ReporteRecepcion from "./Recepcionista/ReporteRecepcion";
import ReporteTecnicos from "./Tecnico/ReporteTecnico";
import ReportePiezas from "./Piezas/ReportePiezas";
import "./Reportes.css";

const TABS = [
  { key: "recepcion", label: "Recepcionistas", icon: "fas fa-user-tie" },
  { key: "tecnicos",  label: "Técnicos",       icon: "fas fa-tools"    },
  { key: "piezas",    label: "Piezas",           icon: "fas fa-puzzle-piece" }
];

const Reportes = () => {
  const [tabActiva, setTabActiva] = useState("recepcion");

  return (
    <div className="reportes-shell">
      {/* Tab bar */}
      <div className="reportes-tabbar">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`reportes-tab ${tabActiva === tab.key ? "active" : ""}`}
            onClick={() => setTabActiva(tab.key)}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="reportes-content">
        {tabActiva === "recepcion" && <ReporteRecepcion />}
        {tabActiva === "tecnicos"  && <ReporteTecnicos />}
        {tabActiva === "piezas"    && <ReportePiezas />}
      </div>
    </div>
  );
};

export default Reportes;