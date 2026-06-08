import React from "react";
import "./BtnExportarPDF.css";

/**
 * Botón reutilizable para exportar PDF
 * Props:
 *   - onClick: función que ejecuta la exportación
 *   - exportando: boolean — muestra spinner mientras genera
 *   - disabled: boolean — deshabilita si no hay datos
 */
const BtnExportarPDF = ({ onClick, exportando = false, disabled = false }) => {
  return (
    <button
      className={`btn-exportar-pdf ${exportando ? "exportando" : ""}`}
      onClick={onClick}
      disabled={disabled || exportando}
      title="Exportar reporte a PDF"
    >
      {exportando ? (
        <>
          <span className="pdf-spinner"></span>
          Generando...
        </>
      ) : (
        <>
          <i className="fas fa-file-pdf"></i>
          Exportar PDF
        </>
      )}
    </button>
  );
};

export default BtnExportarPDF;