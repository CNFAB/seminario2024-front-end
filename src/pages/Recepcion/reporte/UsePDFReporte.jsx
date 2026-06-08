// hooks/usePDFReporte.js
import { useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Hook para generar un PDF del reporte de ingreso.
 * Retorna: { pdfRef, generarPDF }
 *
 * Uso:
 *   const { pdfRef, generarPDF } = usePDFReporte();
 *   // Asignar pdfRef al div oculto que contiene <ReportePDF />
 *   // Llamar generarPDF() cuando quieras disparar la descarga
 */
export const usePDFReporte = () => {
  const pdfRef = useRef(null);

  const generarPDF = useCallback(async () => {
    const element = pdfRef.current;
    if (!element) {
      console.error("usePDFReporte: pdfRef no está asignado a ningún elemento");
      return;
    }

    try {
      // Hacer visible temporalmente para capturar
      element.style.position = "fixed";
      element.style.left = "-9999px";
      element.style.top = "0";
      element.style.display = "block";
      element.style.width = "794px"; // A4 en px a 96dpi

      await new Promise((r) => setTimeout(r, 100)); // esperar render

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      // Restaurar ocultamiento
      element.style.display = "none";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Primera página
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Páginas adicionales si el contenido es largo
      while (heightLeft > 0) {
        position -= pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fecha = new Date().toISOString().slice(0, 10);
      pdf.save(`reporte-ingreso-${fecha}.pdf`);
    } catch (err) {
      console.error("Error generando PDF:", err);
      // Asegurarse de ocultar si falla
      if (element) element.style.display = "none";
    }
  }, []);

  return { pdfRef, generarPDF };
};