// ============================================================
//  INSTRUCCIONES DE INTEGRACIÓN — Reception.jsx
// ============================================================
//
//  1. IMPORTAR los nuevos archivos al tope del archivo:
//
//     import ReportePDF        from "../../components/ReportePDF";
//     import { usePDFReporte } from "../../hooks/usePDFReporte";
//
// ─────────────────────────────────────────────────────────────
//  2. DENTRO del componente Reception, agregar el hook y
//     el estado para acumular los datos de los 3 formularios:
//
//     const { pdfRef, generarPDF } = usePDFReporte();
//
//     const [datosCliente,     setDatosCliente]     = useState(null);
//     const [datosDispositivo, setDatosDispositivo] = useState(null);
//     const [datosIngreso,     setDatosIngreso]     = useState(null);
//
// ─────────────────────────────────────────────────────────────
//  3. En el resetear() agregar la limpieza:
//
//     const resetear = () => {
//       setPaso("buscar");
//       setClienteEncontrado(null);
//       setDispositivoElegido(null);
//       setDatosCliente(null);       // ← agregar
//       setDatosDispositivo(null);   // ← agregar
//       setDatosIngreso(null);       // ← agregar
//     };
//
// ─────────────────────────────────────────────────────────────
//  4. Pasar callbacks a los formularios para recibir sus datos:
//
//     <FormularioCliente
//       onComplete={(cliente) => {
//         if (cliente) {
//           setClienteEncontrado(cliente);
//           setDatosCliente(cliente);   // ← agregar
//         }
//         setPaso("dispositivo");
//       }}
//     />
//
//     <FormularioDispositivo
//       onComplete={(dispData) => {           // ← el callback ahora recibe datos
//         if (dispData) setDatosDispositivo(dispData);  // ← guardar
//         setPaso("ingreso");
//       }}
//     />
//
//     <FormularioIngresoD
//       onComplete={(ingresoData) => {        // ← el callback ahora recibe datos
//         if (ingresoData) setDatosIngreso(ingresoData);  // ← guardar
//         // Generar PDF automáticamente al completar el último paso
//         setTimeout(() => generarPDF(), 300);
//         resetear();
//       }}
//       user={user}
//       dispositivoId={dispositivoElegido?.id_dispositivo}
//     />
//
// ─────────────────────────────────────────────────────────────
//  5. Agregar el componente ReportePDF (INVISIBLE) justo antes
//     del cierre de </div> del rec-shell:
//
//     <ReportePDF
//       ref={pdfRef}
//       datosCliente={datosCliente ?? {}}
//       datosDispositivo={datosDispositivo ?? {}}
//       datosIngreso={datosIngreso ?? {}}
//     />
//
// ============================================================



// ============================================================
//  INSTRUCCIONES DE INTEGRACIÓN — FormularioDispositivo.jsx
// ============================================================
//
//  El onComplete ya existe. Solo hay que enriquecerlo para que
//  pase los datos de marca/modelo seleccionados al padre.
//
//  Buscar el bloque donde se llama onComplete() en onSubmit:
//
//  ANTES:
//     if (onComplete) {
//       setTimeout(() => { onComplete(); }, 1000);
//     }
//
//  DESPUÉS:
//     if (onComplete) {
//       // Encontrar los nombres de marca y modelo por ID
//       const marcaObj  = marcas.find(m => String(m.id_marca)  === String(data.id_marca));
//       const modeloObj = modelos.find(m => String(m.id_modelo) === String(data.id_modelo));
//
//       setTimeout(() => {
//         onComplete({
//           marcaNombre:  marcaObj?.marca        ?? data.id_marca,
//           modeloNombre: modeloObj?.nombre_modelo ?? data.id_modelo,
//           imei:         data.imei || null,
//         });
//       }, 1000);
//     }
//
// ============================================================



// ============================================================
//  INSTRUCCIONES DE INTEGRACIÓN — FormularioIngresoD.jsx
// ============================================================
//
//  El onComplete ya existe. Enriquecerlo para pasar los datos
//  del ingreso (incluyendo el NOMBRE del técnico) al padre.
//
//  Buscar el bloque de éxito en onSubmit:
//
//  ANTES:
//     setMessage("✅ Ingreso y diagnóstico registrados correctamente");
//     setMessageType("success");
//     reset();
//     ...
//     if (onComplete) onComplete();
//
//  DESPUÉS:
//     setMessage("✅ Ingreso y diagnóstico registrados correctamente");
//     setMessageType("success");
//     reset();
//     setFotoFrontal(null);
//     setFotoTrasera(null);
//     setFotoFrontalPreview(null);
//     setFotoTraseraPreview(null);
//
//     if (onComplete) {
//       // Obtener nombre completo del técnico seleccionado
//       const tecnico = tecnicos.find(t => t.id_usuario === tecnicoSeleccionado);
//       const tecnicoNombre = tecnico
//         ? `${tecnico.nombre} ${tecnico.apellido}`
//         : "No asignado";
//
//       onComplete({
//         sim:               data.sim,
//         memoria_sd:        data.memoria_sd,
//         revision_tecnica:  data.revision_tecnica,
//         observacion:       data.observacion       || "",
//         estado_del_ingreso: data.estado_del_ingreso || "",
//         tecnicoNombre,
//       });
//     }
//
// ============================================================