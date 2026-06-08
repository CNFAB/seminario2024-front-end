/**
 * exportarPDF.js — función reutilizable para todos los reportes
 *
 * Uso:
 *   import { exportarPDF } from "../Componentes/exportarPDF";
 *   await exportarPDF(ref, "Reporte_Recepcion", "Recepción");
 *
 * Parámetros:
 *   - ref:       React ref del elemento DOM a capturar
 *   - nombreArchivo: prefijo del archivo (sin fecha ni .pdf)
 *   - tituloEncabezado: texto que aparece en el encabezado de cada página
 */
export const exportarPDF = async (ref, nombreArchivo = "Reporte", tituloEncabezado = "Reporte") => {
  if (!ref?.current) return;

  const html2canvas = (await import("html2canvas")).default;
  const jsPDF       = (await import("jspdf")).default;

  const hoy    = new Date().toLocaleDateString("es-AR").replaceAll("/", "-");
  const canvas = await html2canvas(ref.current, {
    scale:        2,
    useCORS:      true,
    backgroundColor: "#f1f5f9",
    logging:      false,
    windowWidth:  ref.current.scrollWidth,
    windowHeight: ref.current.scrollHeight,
  });

  const pdf    = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW  = pdf.internal.pageSize.getWidth();   // 210mm
  const pageH  = pdf.internal.pageSize.getHeight();  // 297mm
  const margin = 10;
  const imgW   = pageW - margin * 2;

  // ── Encabezado reutilizable ──────────────────────────────────────────────
  const agregarEncabezado = (pag, total) => {
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageW, 14, "F");
    pdf.setTextColor(165, 180, 252);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Sistema de Reparaciones  —  ${tituloEncabezado}`, margin, 9);
    pdf.setTextColor(100, 116, 139);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Generado: ${hoy}`, pageW - margin, 9, { align: "right" });
    pdf.setFontSize(8);
    pdf.text(`Pág. ${pag} / ${total}`, pageW / 2, pageH - 5, { align: "center" });
  };

  // ── Partir en páginas A4 ─────────────────────────────────────────────────
  const contentTop = 16;
  const slotH      = pageH - contentTop - 10;
  const imgH       = (canvas.height * imgW) / canvas.width;
  const totalPags  = Math.ceil(imgH / slotH);

  for (let pag = 0; pag < totalPags; pag++) {
    if (pag > 0) pdf.addPage();
    agregarEncabezado(pag + 1, totalPags);

    const srcY  = (pag * slotH * canvas.width) / imgW;
    const srcH  = Math.min((slotH * canvas.width) / imgW, canvas.height - srcY);
    const destH = (srcH * imgW) / canvas.width;

    const slice = document.createElement("canvas");
    slice.width  = canvas.width;
    slice.height = srcH;
    slice.getContext("2d").drawImage(
      canvas, 0, srcY, canvas.width, srcH,
      0, 0, canvas.width, srcH
    );

    pdf.addImage(slice.toDataURL("image/png"), "PNG", margin, contentTop, imgW, destH);
  }

  pdf.save(`${nombreArchivo}_${hoy}.pdf`);
};