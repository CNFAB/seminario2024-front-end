// src/pages/Administrador/Reporte/Tecnico/ReporteReparaciones.jsx
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Spinner, Alert } from 'react-bootstrap';
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from 'recharts';
import { usuarioService } from '../../../../services/UsuarioService';
import reparacionService from '../../../../services/ReparacionService';
import CustomTooltip from '../Componentes/CustomTooltip';
import BtnExportarPDF from '../Componentes/BtnExportarPDF';
import { exportarPDF } from '../Componentes/exportarPDF';
import { Clock, Table as TableIcon, Trophy, AlertCircle, TrendingUp, Zap } from 'lucide-react';
import './ReporteTecnicos.css';

const ESTADO_COLOR = {
  PENDIENTE: '#f59e0b',
  EN_REPARACION: '#6366f1',
  TERMINADO: '#10b981',
  CANCELADO: '#f43f5e',
  ESPERANDO_PIEZA: '#22d3ee',
  ESPERANDO_APROBACION: '#a78bfa',
  LISTO_PARA_RETIRAR: '#10b981',
};

const ESTADO_LABEL = {
  PENDIENTE: 'Pendiente',
  EN_REPARACION: 'En reparación',
  TERMINADO: 'Terminado',
  CANCELADO: 'Cancelado',
  ESPERANDO_PIEZA: 'Esperando pieza',
  ESPERANDO_APROBACION: 'Esperando aprobación',
  LISTO_PARA_RETIRAR: 'Listo para retirar',
};
const ESTADOS_CON_INGRESO = ['TERMINADO', 'LISTO_PARA_RETIRAR', 'PAGADO'];
const formatearFecha = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatearTiempo = (horas) => {
  if (!horas && horas !== 0) return '—';

  const horasNum = parseFloat(horas);
  if (isNaN(horasNum)) return '—';

  if (horasNum === 0) return '< 1 min';

  if (horasNum < 1) {
    const minutos = Math.round(horasNum * 60);
    if (minutos === 0) return '< 1 min';
    return `${minutos} min`;
  }

  if (horasNum < 24) {
    const horasEnteras = Math.floor(horasNum);
    const minutosRestantes = Math.round((horasNum - horasEnteras) * 60);

    if (minutosRestantes === 0) {
      return `${horasEnteras} h`;
    }
    return `${horasEnteras} h ${minutosRestantes} min`;
  }

  const dias = Math.floor(horasNum / 24);
  const horasRestantes = horasNum % 24;
  const horasEnteras = Math.floor(horasRestantes);
  const minutosRestantes = Math.round((horasRestantes - horasEnteras) * 60);

  let resultado = `${dias} d`;
  if (horasEnteras > 0) {
    resultado += ` ${horasEnteras} h`;
  }
  if (minutosRestantes > 0) {
    resultado += ` ${minutosRestantes} min`;
  }
  return resultado;
};

const normalizarEstado = (r) => (r.estado_general ?? r.estado ?? '').toUpperCase().trim();

const obtenerNombreDispositivo = (rep) => {
  const dispositivo = rep.ingreso?.dispositivo || rep.diagnostico?.ingreso?.dispositivo || null;
  if (!dispositivo?.modelo?.nombre_modelo) return 'N/A';
  return `${dispositivo.modelo.marca?.marca ?? ''} ${dispositivo.modelo.nombre_modelo}`.trim();
};
const obtenerMarca = (rep) => {
  const dispositivo = rep.ingreso?.dispositivo || rep.diagnostico?.ingreso?.dispositivo || null;
  if (!dispositivo?.modelo?.marca?.marca) return 'Sin marca';
  return dispositivo.modelo.marca.marca;
};

const ReporteReparaciones = () => {
  const [reparaciones, setReparaciones] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTermDispositivo, setSearchTermDispositivo] = useState('');
  const [filtroTecnico, setFiltroTecnico] = useState('todos');
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [rangoPreset, setRangoPreset] = useState('ultimos30');
  const [exportando, setExportando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroDispositivo, setFiltroDispositivo] = useState('todos');
  const [modoTiempos, setModoTiempos] = useState(false);
  const [modoComparacion, setModoComparacion] = useState('tiempo');

  // ✅ Estados para paginación de la lista de reparaciones
  const [paginaReparaciones, setPaginaReparaciones] = useState(1);
  const [itemsPorPaginaReparaciones, setItemsPorPaginaReparaciones] = useState(15);

  // Estado para el tooltip de piezas
  const [tooltipCostoMarca, setTooltipCostoMarca] = useState({
    show: false,
    data: null,
    x: 0,
    y: 0,
  });

  const [tooltipPiezas, setTooltipPiezas] = useState({
    show: false,
    categorias: [],
    x: 0,
    y: 0,
  });

  const pdfRef = useRef();
  const toLocalISO = (d) => {
    const año = d.getFullYear();
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const dia = String(d.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  };

  const todoRef = useRef(false);

  const setRangoFechas = (preset) => {
    setRangoPreset(preset);
    if (preset === 'todo') {
      todoRef.current = true;
      setFechaDesde('');
      setFechaHasta('');
      return;
    }
    todoRef.current = false;
    const hoy = new Date();
    let desde = new Date();
    let hasta = new Date(hoy);

    switch (preset) {
      case 'ultimos7':
        desde.setDate(hoy.getDate() - 7);
        break;
      case 'ultimos15':
        desde.setDate(hoy.getDate() - 15);
        break;
      case 'ultimos30':
        desde.setDate(hoy.getDate() - 30);
        break;
      case 'esteMes':
        desde = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        break;
      case 'mesPasado':
        desde = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
        hasta = new Date(hoy.getFullYear(), hoy.getMonth(), 0);
        break;
      default:
        return;
    }
    setFechaDesde(toLocalISO(desde));
    setFechaHasta(toLocalISO(hasta));
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true);
        const [resRep, resTec] = await Promise.all([
          reparacionService.obtenerTodas(),
          usuarioService.obtenerTecnicos(),
        ]);
        const reps = resRep?.data?.data ?? resRep?.data ?? resRep ?? [];
        const tecs = Array.isArray(resTec) ? resTec : (resTec?.data ?? []);
        setReparaciones(Array.isArray(reps) ? reps : []);
        setTecnicos(Array.isArray(tecs) ? tecs : []);
      } catch (e) {
        console.error(e);
        setError('No se pudieron cargar los datos.');
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  useEffect(() => {
    if (reparaciones.length > 0 && !fechaDesde && !todoRef.current) {
      setRangoFechas('ultimos30');
    }
  }, [reparaciones]);

  // Normalizar reparaciones
  const reparacionesNorm = useMemo(
    () => reparaciones.map((r) => ({ ...r, _estado: normalizarEstado(r) })),
    [reparaciones]
  );

  // Filtrar por fechas, técnico, estado y dispositivo
  // Filtrar por fechas, técnico, estado y dispositivo
  const repsFiltradas = useMemo(() => {
    let filtradas = reparacionesNorm;

    if (filtroTecnico !== 'todos') {
      filtradas = filtradas.filter((r) => {
        const id = String(r.usuario?.id_usuario ?? r.id_usuario ?? r.tecnico?.id_usuario ?? '');
        return id === filtroTecnico;
      });
    }

    if (fechaDesde && fechaHasta) {
      const desde = new Date(fechaDesde + 'T00:00:00');
      const hasta = new Date(fechaHasta + 'T23:59:59');
      filtradas = filtradas.filter((r) => {
        const fecha = new Date(r.created_at ?? r.fecha_creacion ?? r.fecha);
        return fecha >= desde && fecha <= hasta;
      });
    }

    if (filtroEstado !== 'todos') {
      filtradas = filtradas.filter((rep) => rep._estado === filtroEstado);
    }

    // ✅ NUEVO: Buscador por dispositivo (marca o modelo)
    if (searchTermDispositivo.trim()) {
      const term = searchTermDispositivo.toLowerCase().trim();
      filtradas = filtradas.filter((rep) => {
        const nombreDispositivo = obtenerNombreDispositivo(rep).toLowerCase();
        const marca = obtenerMarca(rep).toLowerCase();
        return nombreDispositivo.includes(term) || marca.includes(term);
      });
    }

    return filtradas;
  }, [
    reparacionesNorm,
    filtroTecnico,
    fechaDesde,
    fechaHasta,
    filtroEstado,
    searchTermDispositivo,
  ]);
  // ==================== PAGINACIÓN PARA LISTA DE REPARACIONES ====================
  const totalPaginasReparaciones = Math.ceil(repsFiltradas.length / itemsPorPaginaReparaciones);
  const inicioReparaciones = (paginaReparaciones - 1) * itemsPorPaginaReparaciones;
  const finReparaciones = inicioReparaciones + itemsPorPaginaReparaciones;
  const reparacionesPagina = repsFiltradas.slice(inicioReparaciones, finReparaciones);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaReparaciones(1);
  }, [filtroTecnico, fechaDesde, fechaHasta, filtroEstado, filtroDispositivo]);

  // ==================== MÉTRICAS DE TIEMPOS ====================

  const reparacionesConTiempos = useMemo(() => {
    return repsFiltradas.map((rep) => {
      const multiples = rep.reparaciones_multiples ?? rep.reparacionesMultiples ?? [];
      let tiempoTotalHoras = 0;
      let trabajosConTiempo = 0;

      multiples.forEach((rm) => {
        if (rm.fecha_ini_reparacion && rm.fecha_fin_reparacion) {
          const inicio = new Date(rm.fecha_ini_reparacion);
          const fin = new Date(rm.fecha_fin_reparacion);
          const horas = (fin - inicio) / (1000 * 60 * 60);
          tiempoTotalHoras += horas;
          trabajosConTiempo++;
        }
      });

      return {
        ...rep,
        tiempoTotal:
          trabajosConTiempo > 0 ? (tiempoTotalHoras / trabajosConTiempo).toFixed(1) : null,
        trabajosConTiempo,
        multiplesConTiempo: multiples.filter(
          (rm) => rm.fecha_ini_reparacion && rm.fecha_fin_reparacion
        ),
      };
    });
  }, [repsFiltradas]);

  const tiemposPorMarca = useMemo(() => {
    const map = new Map();

    reparacionesConTiempos.forEach((rep) => {
      const multiples = rep.reparaciones_multiples ?? rep.reparacionesMultiples ?? [];
      const marca = obtenerMarca(rep);

      multiples.forEach((rm) => {
        if (!rm.fecha_ini_reparacion || !rm.fecha_fin_reparacion) return;

        const horas =
          (new Date(rm.fecha_fin_reparacion) - new Date(rm.fecha_ini_reparacion)) /
          (1000 * 60 * 60);

        if (!map.has(marca)) {
          map.set(marca, { total: 0, sumaHoras: 0, tiempos: [], costos: [] });
        }

        const data = map.get(marca);
        data.total++;
        data.sumaHoras += horas;
        data.tiempos.push(horas);
        if (rm.precio_total) data.costos.push(parseFloat(rm.precio_total));
      });
    });

    return Array.from(map.entries())
      .filter(([marca]) => marca !== 'Sin marca')
      .map(([marca, data]) => ({
        marca,
        promedioTiempo: (data.sumaHoras / data.total).toFixed(1),
        total: data.total,
        rapido: Math.min(...data.tiempos).toFixed(1),
        lento: Math.max(...data.tiempos).toFixed(1),
        promedioCosto:
          data.costos.length > 0
            ? (data.costos.reduce((a, b) => a + b, 0) / data.costos.length).toFixed(0)
            : 0,
      }))
      .sort((a, b) => a.promedioTiempo - b.promedioTiempo);
  }, [reparacionesConTiempos]);

  const rankingEficienciaTecnicos = useMemo(() => {
    const map = new Map();

    reparacionesConTiempos.forEach((rep) => {
      const multiples = rep.reparaciones_multiples ?? rep.reparacionesMultiples ?? [];
      const idTecnico = String(
        rep.usuario?.id_usuario ?? rep.id_usuario ?? rep.tecnico?.id_usuario ?? ''
      );

      if (!idTecnico) return;

      const nombreTecnico = rep.usuario
        ? `${rep.usuario.nombre ?? ''} ${rep.usuario.apellido ?? ''}`.trim()
        : rep.tecnico
          ? `${rep.tecnico.nombre ?? ''} ${rep.tecnico.apellido ?? ''}`.trim()
          : `Técnico ${idTecnico}`;

      multiples.forEach((rm) => {
        if (!rm.fecha_ini_reparacion || !rm.fecha_fin_reparacion) return;

        const estado = rm.estado?.toUpperCase() ?? '';
        if (!ESTADOS_CON_INGRESO.includes(estado)) return;

        const horas =
          (new Date(rm.fecha_fin_reparacion) - new Date(rm.fecha_ini_reparacion)) /
          (1000 * 60 * 60);

        if (!map.has(idTecnico)) {
          map.set(idTecnico, {
            nombre: nombreTecnico,
            total: 0,
            sumaHoras: 0,
            tiempos: [],
            costoTotal: 0,
          });
        }

        const data = map.get(idTecnico);
        data.total++;
        data.sumaHoras += horas;
        data.tiempos.push(horas);
        if (rm.precio_total) data.costoTotal += parseFloat(rm.precio_total);
      });
    });

    return Array.from(map.values())
      .filter((t) => t.total > 0)
      .map((t) => ({
        nombre: t.nombre,
        total: t.total,
        promedio: (t.sumaHoras / t.total).toFixed(1),
        rapido: Math.min(...t.tiempos).toFixed(1),
        lento: Math.max(...t.tiempos).toFixed(1),
        costoPromedio: (t.costoTotal / t.total).toFixed(0),
        costoTotal: t.costoTotal,
      }))
      .sort((a, b) => a.promedio - b.promedio);
  }, [reparacionesConTiempos]);

  const reparacionesDemoradas = useMemo(() => {
    const demoradas = [];

    reparacionesConTiempos.forEach((rep) => {
      const multiples = rep.reparaciones_multiples ?? rep.reparacionesMultiples ?? [];

      multiples.forEach((rm) => {
        if (!rm.fecha_ini_reparacion || !rm.fecha_fin_reparacion) return;

        const horas =
          (new Date(rm.fecha_fin_reparacion) - new Date(rm.fecha_ini_reparacion)) /
          (1000 * 60 * 60);
        const estado = rm.estado?.toUpperCase() ?? '';

        if (horas > 48 && estado !== 'TERMINADO') {
          demoradas.push({
            id: rep.id_reparacion || rep.id,
            tecnico: rep.usuario
              ? `${rep.usuario.nombre ?? ''} ${rep.usuario.apellido ?? ''}`.trim()
              : 'No asignado',
            dispositivo: obtenerNombreDispositivo(rep),
            horas: horas.toFixed(1),
            estado: ESTADO_LABEL[estado] || estado,
            pieza: rm.pieza?.nombre_pieza || rm.nombre_pieza || 'N/A',
            costo: rm.precio_total || 0,
          });
        }
      });
    });

    return demoradas;
  }, [reparacionesConTiempos]);

  const tiemposPorEstado = useMemo(() => {
    const map = new Map();

    reparacionesConTiempos.forEach((rep) => {
      const multiples = rep.reparaciones_multiples ?? rep.reparacionesMultiples ?? [];

      multiples.forEach((rm) => {
        if (!rm.fecha_ini_reparacion || !rm.fecha_fin_reparacion) return;

        const estado = rm.estado?.toUpperCase() || 'DESCONOCIDO';
        const horas =
          (new Date(rm.fecha_fin_reparacion) - new Date(rm.fecha_ini_reparacion)) /
          (1000 * 60 * 60);

        if (!map.has(estado)) {
          map.set(estado, { total: 0, sumaHoras: 0 });
        }

        const data = map.get(estado);
        data.total++;
        data.sumaHoras += horas;
      });
    });

    return Array.from(map.entries())
      .map(([estado, data]) => ({
        estado: ESTADO_LABEL[estado] || estado,
        promedio: (data.sumaHoras / data.total).toFixed(1),
        total: data.total,
      }))
      .sort((a, b) => a.promedio - b.promedio);
  }, [reparacionesConTiempos]);

  const mostrarTooltipCosto = (e, item, tipo) => {
    const detalle = tipo === 'min' ? item.minDetalle : item.maxDetalle;
    if (!detalle) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const tooltipHeight = 200;

    let y = rect.bottom + 8;
    let position = 'bottom';

    if (y + tooltipHeight > viewportHeight) {
      y = rect.top - tooltipHeight - 8;
      position = 'top';
    }

    let x = rect.left + rect.width / 2 - 140;

    if (x < 8) x = 8;
    if (x + 280 > window.innerWidth) x = window.innerWidth - 288;

    setTooltipCostoMarca({
      show: true,
      data: {
        tipo: tipo === 'min' ? '💰 Más económico' : '💎 Más caro',
        valor: tipo === 'min' ? item.minCosto : item.maxCosto,
        ...detalle,
        position,
      },
      x: x,
      y: y,
    });
  };

  const ocultarTooltipCosto = () => {
    setTooltipCostoMarca({ show: false, data: null, x: 0, y: 0 });
  };

  const costosPorMarca = useMemo(() => {
    const map = new Map();

    reparacionesConTiempos.forEach((rep) => {
      const multiples = rep.reparaciones_multiples ?? rep.reparacionesMultiples ?? [];
      const marca = obtenerMarca(rep);

      multiples.forEach((rm) => {
        if (!rm.precio_total) return;

        const estado = rm.estado?.toUpperCase() ?? '';
        if (!ESTADOS_CON_INGRESO.includes(estado)) return;

        const costo = parseFloat(rm.precio_total);

        if (!map.has(marca)) {
          map.set(marca, {
            total: 0,
            sumaCostos: 0,
            costos: [],
            detallesMin: [],
            detallesMax: [],
          });
        }

        const data = map.get(marca);
        data.total++;
        data.sumaCostos += costo;
        data.costos.push(costo);

        const detalle = {
          costo: costo,
          dispositivo: obtenerNombreDispositivo(rep),
          pieza: rm.pieza?.nombre_pieza || rm.nombre_pieza || 'N/A',
          tecnico: rep.usuario
            ? `${rep.usuario.nombre ?? ''} ${rep.usuario.apellido ?? ''}`.trim()
            : 'No asignado',
          fecha: rep.created_at || rep.fecha_creacion,
          estado: rm.estado,
        };

        data.detallesMin.push(detalle);
        data.detallesMax.push(detalle);
      });
    });

    return Array.from(map.entries())
      .filter(([marca]) => marca !== 'Sin marca')
      .map(([marca, data]) => {
        const minCostoObj = data.detallesMin.reduce(
          (min, curr) => (curr.costo < min.costo ? curr : min),
          data.detallesMin[0]
        );
        const maxCostoObj = data.detallesMax.reduce(
          (max, curr) => (curr.costo > max.costo ? curr : max),
          data.detallesMax[0]
        );

        return {
          marca,
          promedioCosto: (data.sumaCostos / data.total).toFixed(0),
          total: data.total,
          minCosto: Math.min(...data.costos).toFixed(0),
          maxCosto: Math.max(...data.costos).toFixed(0),
          minDetalle: minCostoObj,
          maxDetalle: maxCostoObj,
        };
      })
      .sort((a, b) => b.promedioCosto - a.promedioCosto);
  }, [reparacionesConTiempos]);

  const metricasTecnicos = useMemo(() => {
    const map = new Map();

    tecnicos.forEach((tecnico) => {
      const id = String(tecnico.id_usuario || tecnico.id);
      if (!id) return;
      const nombre =
        tecnico.nombre && tecnico.apellido
          ? `${tecnico.nombre} ${tecnico.apellido}`.trim()
          : tecnico.nombre || tecnico.correo?.split('@')[0] || `Técnico ${id}`;
      map.set(id, {
        id: id,
        nombre: nombre,
        totalReparaciones: 0,
        totalMultiples: 0,
        terminadas: 0,
        enCurso: 0,
        pendientes: 0,
        esperandoPieza: 0,
        canceladas: 0,
        totalHoras: 0,
        trabajosConTiempo: 0,
        ingresosGenerados: 0,
      });
    });

    repsFiltradas.forEach((rep) => {
      const idTecnico = String(
        rep.usuario?.id_usuario ?? rep.id_usuario ?? rep.tecnico?.id_usuario ?? ''
      );
      if (!idTecnico || idTecnico === '?') return;

      if (!map.has(idTecnico)) {
        const nombreTecnico = rep.usuario
          ? `${rep.usuario.nombre ?? ''} ${rep.usuario.apellido ?? ''}`.trim()
          : rep.tecnico
            ? `${rep.tecnico.nombre ?? ''} ${rep.tecnico.apellido ?? ''}`.trim()
            : `Técnico ${idTecnico}`;
        map.set(idTecnico, {
          id: idTecnico,
          nombre: nombreTecnico,
          totalReparaciones: 0,
          totalMultiples: 0,
          terminadas: 0,
          enCurso: 0,
          pendientes: 0,
          esperandoPieza: 0,
          canceladas: 0,
          totalHoras: 0,
          trabajosConTiempo: 0,
          ingresosGenerados: 0,
        });
      }

      const tec = map.get(idTecnico);
      tec.totalReparaciones++;

      const multiples = rep.reparaciones_multiples ?? rep.reparacionesMultiples ?? [];
      multiples.forEach((rm) => {
        tec.totalMultiples++;
        const estado = rm.estado?.toUpperCase() ?? '';
        if (estado === 'TERMINADO') {
          tec.terminadas++;
          if (rm.precio_total) tec.ingresosGenerados += parseFloat(rm.precio_total);
          if (rm.fecha_ini_reparacion && rm.fecha_fin_reparacion) {
            const inicio = new Date(rm.fecha_ini_reparacion);
            const fin = new Date(rm.fecha_fin_reparacion);
            const horas = (fin - inicio) / (1000 * 60 * 60);
            tec.totalHoras += horas;
            tec.trabajosConTiempo++;
          }
        } else if (estado === 'EN_REPARACION') tec.enCurso++;
        else if (estado === 'PENDIENTE') tec.pendientes++;
        else if (estado === 'ESPERANDO_PIEZA') tec.esperandoPieza++;
        else if (estado === 'CANCELADO') tec.canceladas++;
      });
    });

    return Array.from(map.values()).map((tec) => ({
      ...tec,
      tasaExito:
        tec.totalMultiples > 0 ? Math.round((tec.terminadas / tec.totalMultiples) * 100) : 0,
      tiempoPromedio:
        tec.trabajosConTiempo > 0 ? (tec.totalHoras / tec.trabajosConTiempo).toFixed(1) : 0,
      cargaActiva: tec.enCurso + tec.esperandoPieza + tec.pendientes,
      eficiencia: tec.tiempoPromedio > 0 ? (100 / tec.tiempoPromedio).toFixed(1) : 0,
    }));
  }, [repsFiltradas, tecnicos]);

  const kpis = useMemo(() => {
    const totalTecnicos = metricasTecnicos.length;
    const tecnicosActivos = metricasTecnicos.filter((t) => t.cargaActiva > 0).length;
    const mayorCarga = metricasTecnicos.reduce((max, t) => Math.max(max, t.cargaActiva), 0);
    const eficienciaPromedio =
      metricasTecnicos.reduce((sum, t) => sum + parseFloat(t.eficiencia || 0), 0) /
      (totalTecnicos || 1);
    const totalIngresos = metricasTecnicos.reduce((sum, t) => sum + t.ingresosGenerados, 0);
    const totalTerminadas = metricasTecnicos.reduce((sum, t) => sum + t.terminadas, 0);
    const tiempoPromedioGeneral =
      rankingEficienciaTecnicos.reduce((sum, t) => sum + parseFloat(t.promedio), 0) /
      (rankingEficienciaTecnicos.length || 1);

    return {
      totalTecnicos,
      tecnicosActivos,
      mayorCarga,
      eficienciaPromedio: eficienciaPromedio.toFixed(1),
      totalIngresos,
      totalTerminadas,
      tiempoPromedioGeneral: tiempoPromedioGeneral.toFixed(1),
    };
  }, [metricasTecnicos, rankingEficienciaTecnicos]);

  const dispositivosUnicos = useMemo(() => {
    const dispositivosSet = new Set();
    reparacionesNorm.forEach((rep) => {
      const nombre = obtenerNombreDispositivo(rep);
      if (nombre !== 'N/A') dispositivosSet.add(nombre);
    });
    return Array.from(dispositivosSet).sort();
  }, [reparacionesNorm]);

  const barData = useMemo(() => {
    return [...metricasTecnicos]
      .sort((a, b) => b.terminadas - a.terminadas)
      .slice(0, 10)
      .map((t) => ({
        nombre: t.nombre.split(' ')[0],
        nombreFull: t.nombre,
        terminadas: t.terminadas,
        enCurso: t.enCurso,
        pendientes: t.pendientes,
        esperandoPieza: t.esperandoPieza,
      }));
  }, [metricasTecnicos]);

  const pieEstados = useMemo(() => {
    const totales = { terminadas: 0, enCurso: 0, pendientes: 0, esperandoPieza: 0, canceladas: 0 };
    metricasTecnicos.forEach((t) => {
      totales.terminadas += t.terminadas;
      totales.enCurso += t.enCurso;
      totales.pendientes += t.pendientes;
      totales.esperandoPieza += t.esperandoPieza;
      totales.canceladas += t.canceladas;
    });
    return [
      { name: 'Terminadas', value: totales.terminadas, color: '#10b981' },
      { name: 'En curso', value: totales.enCurso, color: '#6366f1' },
      { name: 'Pendientes', value: totales.pendientes, color: '#f59e0b' },
      { name: 'Esperando pieza', value: totales.esperandoPieza, color: '#22d3ee' },
      { name: 'Canceladas', value: totales.canceladas, color: '#f43f5e' },
    ].filter((d) => d.value > 0);
  }, [metricasTecnicos]);

  const mostrarTooltipPiezas = (e, reparacion) => {
    const multiples = reparacion.reparaciones_multiples ?? reparacion.reparacionesMultiples ?? [];
    const categorias = [
      ...new Set(
        multiples.map((rm) => rm.pieza?.categoria?.categoria || rm.categoria || 'Sin categoría')
      ),
    ];
    if (categorias.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPiezas({ show: true, categorias, x: rect.right + 8, y: rect.top + rect.height / 2 });
  };

  const ocultarTooltipPiezas = () => {
    setTooltipPiezas({ show: false, categorias: [], x: 0, y: 0 });
  };

  const handleExportarPDF = async () => {
    setExportando(true);
    try {
      await exportarPDF(
        pdfRef,
        'Reporte_Tecnicos_Reparaciones',
        'Reporte de Rendimiento de Técnicos'
      );
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      alert('No se pudo generar el PDF.');
    } finally {
      setExportando(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando datos de técnicos...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div className="tec-wrap" ref={pdfRef}>
      {/* Header */}
      <div className="tec-header">
        <div className="tec-header-top">
          <div>
            <h2>👨‍🔧 Rendimiento de Técnicos - Reparaciones</h2>
            <p>
              {metricasTecnicos.length} técnicos analizados · {repsFiltradas.length} reparaciones
              {fechaDesde &&
                fechaHasta &&
                ` · ${formatearFecha(fechaDesde)} → ${formatearFecha(fechaHasta)}`}
              {filtroTecnico !== 'todos' &&
                ` · ${metricasTecnicos.find((t) => t.id === filtroTecnico)?.nombre || ''}`}
            </p>
          </div>
          <BtnExportarPDF onClick={handleExportarPDF} exportando={exportando} />
        </div>
      </div>

      {/* Filtros de fechas */}
      <div className="tec-filtros-fechas">
        <div className="fechas-presets">
          {['ultimos7', 'ultimos15', 'ultimos30', 'esteMes', 'mesPasado'].map((preset) => (
            <button
              key={preset}
              className={`preset-btn ${rangoPreset === preset ? 'active' : ''}`}
              onClick={() => setRangoFechas(preset)}
            >
              📅{' '}
              {preset === 'ultimos7'
                ? 'Últimos 7 días'
                : preset === 'ultimos15'
                  ? 'Últimos 15 días'
                  : preset === 'ultimos30'
                    ? 'Últimos 30 días'
                    : preset === 'esteMes'
                      ? 'Este mes'
                      : 'Mes pasado'}
            </button>
          ))}
          <button
            className={`preset-btn ${rangoPreset === 'todo' ? 'active' : ''}`}
            onClick={() => setRangoFechas('todo')}
          >
            Todo
          </button>
        </div>
        <div className="fechas-custom">
          <label>Desde:</label>
          <input
            type="date"
            value={fechaDesde}
            onChange={(e) => {
              setFechaDesde(e.target.value);
              setRangoPreset('custom');
            }}
          />
          <label>Hasta:</label>
          <input
            type="date"
            value={fechaHasta}
            onChange={(e) => {
              setFechaHasta(e.target.value);
              setRangoPreset('custom');
            }}
          />
        </div>
      </div>

      {/* Filtros adicionales */}
      <div className="tec-filtros">
        <select
          className="tec-select"
          value={filtroTecnico}
          onChange={(e) => setFiltroTecnico(e.target.value)}
        >
          <option value="todos">👥 Todos los técnicos</option>
          {metricasTecnicos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre} {t.cargaActiva > 0 && `(${t.cargaActiva} activos)`}
            </option>
          ))}
        </select>
        <select
          className="tec-select"
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
        >
          <option value="todos"> Todos los estados</option>
          {Object.entries(ESTADO_LABEL).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        <select
          className="tec-select"
          value={filtroDispositivo}
          onChange={(e) => setFiltroDispositivo(e.target.value)}
        >
          <option value="todos">📱 Todos los dispositivos</option>
          {dispositivosUnicos.map((disp) => (
            <option key={disp} value={disp}>
              {disp}
            </option>
          ))}
        </select>
        {(filtroEstado !== 'todos' ||
          filtroDispositivo !== 'todos' ||
          filtroTecnico !== 'todos') && (
          <button
            className="tec-filter-clear"
            onClick={() => {
              setFiltroEstado('todos');
              setFiltroDispositivo('todos');
              setFiltroTecnico('todos');
            }}
          >
            🧹 Limpiar filtros
          </button>
        )}
      </div>

      {/* KPIs */}
      <div className="tec-kpi-grid">
        {[
          { label: 'Total Técnicos', value: kpis.totalTecnicos, icon: '👥', color: '#6366f1' },
          { label: 'Técnicos Activos', value: kpis.tecnicosActivos, icon: '⚡', color: '#10b981' },
          {
            label: 'Mayor Carga',
            value: kpis.mayorCarga,
            icon: '📊',
            color: '#f59e0b',
            sub: 'trabajos activos',
          },
          {
            label: 'Eficiencia Promedio',
            value: `${kpis.eficienciaPromedio}%`,
            icon: '🎯',
            color: '#22d3ee',
          },
          { label: 'Total Terminadas', value: kpis.totalTerminadas, icon: '✅', color: '#10b981' },
          {
            label: 'Ingresos Generados',
            value: `$${kpis.totalIngresos.toLocaleString()}`,
            color: '#f59e0b',
          },
          {
            label: 'Tiempo Promedio',
            value: formatearTiempo(kpis.tiempoPromedioGeneral),
            color: '#8b5cf6',
          },
        ].map((k) => (
          <div className="tec-kpi-card" key={k.label}>
            <div className="tec-kpi-label">
              {k.icon} {k.label}
            </div>
            <div className="tec-kpi-value" style={{ color: k.color }}>
              {k.value}
            </div>
            {k.sub && <div className="tec-kpi-sub">{k.sub}</div>}
          </div>
        ))}
      </div>

      {/* Gráficos existentes */}
      <div className="tec-charts-grid-2">
        <div className="tec-chart-card">
          <div className="tec-chart-title">🏆 Ranking de Productividad</div>
          {barData.length === 0 ? (
            <p className="tec-empty">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={barData}
                layout="horizontal"
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="nombre"
                  type="category"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis
                  type="number"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar
                  dataKey="terminadas"
                  name="Terminadas"
                  stackId="a"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
                <Bar dataKey="enCurso" name="En curso" stackId="a" fill="#6366f1" />
                <Bar dataKey="esperandoPieza" name="Esperando pieza" stackId="a" fill="#22d3ee" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="tec-chart-card">
          <div className="tec-chart-title">📊 Distribución de Trabajos</div>
          {pieEstados.length === 0 ? (
            <p className="tec-empty">Sin datos</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieEstados}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieEstados.map((d, i) => (
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

      {/* RENDIMIENTO POR MARCA */}
      {tiemposPorMarca.length > 0 && (
        <div className="tec-chart-card">
          <div className="tec-chart-title">
            <span className="tec-title-icon" style={{ background: '#8b5cf6' }}>
              <i className="fas fa-trademark"></i>
            </span>
            <span> Rendimiento por marca</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button
                className={`tec-toggle-small ${!modoTiempos ? 'active' : ''}`}
                onClick={() => setModoTiempos(false)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: !modoTiempos ? '#6366f1' : 'white',
                  color: !modoTiempos ? 'white' : '#6366f1',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                Tiempo
              </button>
              <button
                className={`tec-toggle-small ${modoTiempos ? 'active' : ''}`}
                onClick={() => setModoTiempos(true)}
                style={{
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  background: modoTiempos ? '#6366f1' : 'white',
                  color: modoTiempos ? 'white' : '#6366f1',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: 500,
                }}
              >
                Costo
              </button>
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="tec-table-marcas">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Marca</th>
                  <th>Cantidad</th>
                  {!modoTiempos ? (
                    <>
                      <th>Tiempo promedio</th>
                      <th>Más rápido</th>
                      <th>Más lento</th>
                    </>
                  ) : (
                    <>
                      <th>Costo promedio</th>
                      <th>Más económico</th>
                      <th>Más caro</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {(modoTiempos ? costosPorMarca : tiemposPorMarca).map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                    <td className="fw-bold">{item.marca}</td>
                    <td style={{ color: '#6366f1', fontWeight: 600, textAlign: 'center' }}>
                      {item.total}
                    </td>
                    {!modoTiempos ? (
                      <>
                        <td
                          style={{
                            color:
                              parseFloat(item.promedioTiempo) > 24
                                ? '#f43f5e'
                                : parseFloat(item.promedioTiempo) > 12
                                  ? '#f59e0b'
                                  : '#10b981',
                            fontWeight: 500,
                            textAlign: 'right',
                            paddingRight: '20px',
                          }}
                        >
                          {formatearTiempo(item.promedioTiempo)}
                        </td>
                        <td style={{ color: '#10b981', textAlign: 'right', paddingRight: '20px' }}>
                          {formatearTiempo(item.rapido)}
                        </td>
                        <td style={{ color: '#f43f5e', textAlign: 'right', paddingRight: '20px' }}>
                          {formatearTiempo(item.lento)}
                        </td>
                      </>
                    ) : (
                      <>
                        <td
                          style={{
                            color:
                              parseFloat(item.promedioCosto) > 50000
                                ? '#f43f5e'
                                : parseFloat(item.promedioCosto) > 20000
                                  ? '#f59e0b'
                                  : '#10b981',
                            fontWeight: 500,
                            textAlign: 'right',
                            paddingRight: '20px',
                          }}
                        >
                          ${parseInt(item.promedioCosto).toLocaleString()}
                        </td>
                        <td
                          style={{
                            color: '#10b981',
                            cursor: 'pointer',
                            textDecoration: 'underline dotted',
                            textUnderlineOffset: '3px',
                            textAlign: 'right',
                            paddingRight: '20px',
                          }}
                          onMouseEnter={(e) => mostrarTooltipCosto(e, item, 'min')}
                          onMouseLeave={ocultarTooltipCosto}
                        >
                          ${parseInt(item.minCosto).toLocaleString()}
                        </td>
                        <td
                          style={{
                            color: '#f43f5e',
                            cursor: 'pointer',
                            textDecoration: 'underline dotted',
                            textUnderlineOffset: '3px',
                            textAlign: 'right',
                            paddingRight: '20px',
                          }}
                          onMouseEnter={(e) => mostrarTooltipCosto(e, item, 'max')}
                          onMouseLeave={ocultarTooltipCosto}
                        >
                          ${parseInt(item.maxCosto).toLocaleString()}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Alertas de reparaciones demoradas */}
      {reparacionesDemoradas.length > 0 && (
        <div
          className="tec-chart-card"
          style={{ borderColor: '#f43f5e', backgroundColor: '#fef2f2' }}
        >
          <div className="tec-chart-title">
            <span className="tec-title-icon" style={{ background: '#f43f5e' }}>
              <AlertCircle size={14} />
            </span>
            <span>⚠️ Alertas - Reparaciones demoradas (&gt;48 horas no terminadas)</span>
          </div>
          <div style={{ overflowX: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
            <table className="tec-table">
              <thead style={{ position: 'sticky', top: 0, background: '#fef2f2' }}>
                <tr>
                  <th>ID</th>
                  <th>Técnico</th>
                  <th>Dispositivo</th>
                  <th>Duración</th>
                  <th>Estado</th>
                  <th>Pieza</th>
                  <th>Costo</th>
                </tr>
              </thead>
              <tbody>
                {reparacionesDemoradas.slice(0, 15).map((rep, idx) => (
                  <tr key={idx}>
                    <td>#{rep.id}</td>
                    <td>{rep.tecnico}</td>
                    <td>{rep.dispositivo}</td>
                    <td style={{ color: '#f43f5e', fontWeight: 'bold' }}>{rep.horas} horas</td>
                    <td>{rep.estado}</td>
                    <td>{rep.pieza}</td>
                    <td>${rep.costo.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tiempo promedio por estado */}
      {tiemposPorEstado.length > 0 && (
        <div className="tec-charts-grid-2">
          <div className="tec-chart-card">
            <div className="tec-chart-title">
              <span className="tec-title-icon" style={{ background: '#6366f1' }}>
                <Clock size={14} />
              </span>
              <span>Tiempo promedio por estado</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={tiemposPorEstado}
                margin={{ top: 0, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="estado" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Horas', angle: -90, position: 'insideLeft', fontSize: 11 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="promedio" name="Horas promedio" fill="#6366f1" radius={[6, 6, 0, 0]}>
                  {tiemposPorEstado.map((entry, idx) => (
                    <Cell
                      key={idx}
                      fill={
                        entry.promedio < 12
                          ? '#10b981'
                          : entry.promedio < 24
                            ? '#f59e0b'
                            : '#f43f5e'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabla de ranking completo */}
      <div className="tec-chart-card">
        <div className="tec-chart-title">Ranking Completo de Técnicos</div>
        {metricasTecnicos.length === 0 ? (
          <p className="tec-empty">Sin datos</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="tec-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Técnico</th>
                  <th>Total trabajos</th>
                  <th>Terminadas</th>
                  <th>En curso</th>
                  <th>Esperando</th>
                  <th>Tasa éxito</th>
                  <th>Tiempo prom.</th>
                  <th>Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {metricasTecnicos
                  .sort((a, b) => b.terminadas - a.terminadas)
                  .map((t, i) => (
                    <tr key={t.id} className={filtroTecnico === t.id ? 'row-selected' : ''}>
                      <td>
                        <span
                          className={`tec-badge ${i === 0 ? 'pos-1' : i === 1 ? 'pos-2' : i === 2 ? 'pos-3' : 'pos-n'}`}
                        >
                          {i + 1}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{t.nombre}</td>
                      <td style={{ color: '#6366f1', fontWeight: 700 }}>{t.totalMultiples}</td>
                      <td style={{ color: '#10b981', fontWeight: 600 }}>{t.terminadas}</td>
                      <td>{t.enCurso}</td>
                      <td>{t.esperandoPieza}</td>
                      <td>
                        <div className="tec-tasa-wrap">
                          <div
                            className="tec-tasa-bar"
                            style={{
                              width: `${t.tasaExito}%`,
                              background:
                                t.tasaExito >= 70
                                  ? '#10b981'
                                  : t.tasaExito >= 40
                                    ? '#f59e0b'
                                    : '#f43f5e',
                            }}
                          />
                          <span className="tec-tasa-pct">{t.tasaExito}%</span>
                        </div>
                      </td>
                      <td
                        style={{
                          fontWeight: 600,
                          color:
                            t.tiempoPromedio < 4
                              ? '#10b981'
                              : t.tiempoPromedio < 8
                                ? '#f59e0b'
                                : '#f43f5e',
                        }}
                      >
                        {t.tiempoPromedio > 0 ? `${t.tiempoPromedio} hs` : '—'}
                      </td>
                      <td style={{ fontWeight: 600, color: '#f59e0b' }}>
                        ${t.ingresosGenerados.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Lista detallada de reparaciones CON PAGINACIÓN */}
      <div className="tec-chart-card">
        <div className="tec-chart-title">
          <span> Lista de Reparaciones</span>
          <span className="tec-badge-count">{repsFiltradas.length} reparaciones</span>
        </div>

        {/* Filtros extra - VERSIÓN MEJORADA */}
        <div className="tec-filtros-extra">
          <div className="tec-filtro-group">
            <label className="tec-filtro-label"> Estado:</label>
            <select
              className="tec-filter-select"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos"> Todos los estados</option>
              {Object.entries(ESTADO_LABEL).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="tec-filtro-group" style={{ flex: 2 }}>
            <label className="tec-filtro-label"> Buscar dispositivo:</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="tec-input-group" style={{ flex: 1 }}>
                <span className="tec-input-icon">
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="tec-filter-input"
                  placeholder="Buscar por marca o modelo... (Ej: Samsung, iPhone, Xiaomi)"
                  value={searchTermDispositivo}
                  onChange={(e) => setSearchTermDispositivo(e.target.value)}
                />
              </div>
              {searchTermDispositivo && (
                <button
                  className="tec-filter-clear-btn"
                  onClick={() => setSearchTermDispositivo('')}
                  title="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="tec-filtro-group">
            <button
              className="tec-filter-clear"
              onClick={() => {
                setFiltroEstado('todos');
                setSearchTermDispositivo('');
              }}
            >
              <i className="fas fa-times"></i> Limpiar filtros
            </button>
          </div>
        </div>

        {repsFiltradas.length === 0 ? (
          <p className="tec-empty">No hay reparaciones en el período seleccionado</p>
        ) : (
          <>
            <div style={{ overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }}>
              <table className="tec-table reparaciones-table">
                <thead style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>
                  <tr>
                    <th>#</th>
                    <th>ID</th>
                    <th>Técnico</th>
                    <th>Dispositivo</th>
                    <th>Estado</th>
                    <th>Piezas</th>
                    <th>Costo Total</th>
                    <th>Fecha inicio</th>
                    <th>Fecha fin</th>
                  </tr>
                </thead>
                <tbody>
                  {reparacionesPagina.map((rep, idx) => {
                    const nombreTecnico = rep.usuario
                      ? `${rep.usuario.nombre ?? ''} ${rep.usuario.apellido ?? ''}`.trim()
                      : rep.tecnico
                        ? `${rep.tecnico.nombre ?? ''} ${rep.tecnico.apellido ?? ''}`.trim()
                        : 'No asignado';
                    const obtenerDispositivo = (rep) => {
                      if (rep.ingreso?.dispositivo) return rep.ingreso.dispositivo;
                      if (rep.diagnostico?.ingreso?.dispositivo)
                        return rep.diagnostico.ingreso.dispositivo;
                      return null;
                    };
                    const dispositivo = obtenerDispositivo(rep);
                    const multiples = rep.reparaciones_multiples ?? rep.reparacionesMultiples ?? [];
                    const totalPiezas = multiples.length;
                    const costoTotal = multiples.reduce(
                      (sum, rm) => sum + (parseFloat(rm.precio_total) || 0),
                      0
                    );
                    const estado = rep._estado || normalizarEstado(rep);
                    const estadoColor = ESTADO_COLOR[estado] || '#64748b';
                    const estadoLabel = ESTADO_LABEL[estado] || estado;
                    const nombreDispositivo = dispositivo?.modelo?.nombre_modelo
                      ? `${dispositivo.modelo.marca?.marca ?? ''} ${dispositivo.modelo.nombre_modelo}`.trim()
                      : 'N/A';
                    const fechaInicio = rep.created_at || rep.fecha_creacion || rep.fecha;
                    let fechaFin = null;
                    if (multiples.length > 0) {
                      const fechasFin = multiples
                        .filter((rm) => rm.fecha_fin_reparacion)
                        .map((rm) => rm.fecha_fin_reparacion);
                      if (fechasFin.length > 0)
                        fechaFin = new Date(Math.max(...fechasFin.map((d) => new Date(d))));
                    }
                    const numeroGlobal = inicioReparaciones + idx + 1;
                    return (
                      <tr key={rep.id_reparacion || rep.id || idx}>
                        <td>{numeroGlobal}</td>
                        <td style={{ fontWeight: 600, color: '#6366f1' }}>
                          #{rep.id_reparacion || rep.id}
                        </td>
                        <td>{nombreTecnico}</td>
                        <td>{nombreDispositivo}</td>
                        <td>
                          <span
                            className="tec-estado-badge"
                            style={{
                              background: `${estadoColor}15`,
                              color: estadoColor,
                              border: `1px solid ${estadoColor}30`,
                            }}
                          >
                            {estadoLabel}
                          </span>
                        </td>
                        <td
                          onMouseEnter={(e) => mostrarTooltipPiezas(e, rep)}
                          onMouseLeave={ocultarTooltipPiezas}
                          style={{ cursor: 'pointer' }}
                        >
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '4px 10px',
                              background: '#eef2ff',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: 500,
                              color: '#6366f1',
                            }}
                          >
                            {totalPiezas} {totalPiezas === 1 ? 'pieza' : 'piezas'}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600, color: '#f59e0b' }}>
                          $
                          {costoTotal.toLocaleString('es-AR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td>{formatearFecha(fechaInicio)}</td>
                        <td>{fechaFin ? formatearFecha(fechaFin) : '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ✅ PAGINACIÓN */}
            {totalPaginasReparaciones > 1 && (
              <div className="tec-pagination">
                <div className="tec-pagination-info">
                  Mostrando {inicioReparaciones + 1} -{' '}
                  {Math.min(finReparaciones, repsFiltradas.length)} de {repsFiltradas.length}{' '}
                  reparaciones
                </div>
                <div className="tec-pagination-controls">
                  <button
                    className="tec-pagination-btn"
                    onClick={() => setPaginaReparaciones(1)}
                    disabled={paginaReparaciones === 1}
                  >
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                  <button
                    className="tec-pagination-btn"
                    onClick={() => setPaginaReparaciones(paginaReparaciones - 1)}
                    disabled={paginaReparaciones === 1}
                  >
                    <i className="fas fa-angle-left"></i>
                  </button>
                  <span className="tec-pagination-current">
                    Página {paginaReparaciones} de {totalPaginasReparaciones}
                  </span>
                  <button
                    className="tec-pagination-btn"
                    onClick={() => setPaginaReparaciones(paginaReparaciones + 1)}
                    disabled={paginaReparaciones === totalPaginasReparaciones}
                  >
                    <i className="fas fa-angle-right"></i>
                  </button>
                  <button
                    className="tec-pagination-btn"
                    onClick={() => setPaginaReparaciones(totalPaginasReparaciones)}
                    disabled={paginaReparaciones === totalPaginasReparaciones}
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </div>
                <div className="tec-pagination-rows">
                  <span>Mostrar</span>
                  <select
                    value={itemsPorPaginaReparaciones}
                    onChange={(e) => {
                      setItemsPorPaginaReparaciones(Number(e.target.value));
                      setPaginaReparaciones(1);
                    }}
                    className="tec-pagination-select"
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

            <div className="tec-tabla-footer">
              {repsFiltradas.length} reparación{repsFiltradas.length !== 1 ? 'es' : ''}
            </div>
          </>
        )}
      </div>

      {/* Tooltip de detalles de costo por marca */}
      {tooltipCostoMarca.show && tooltipCostoMarca.data && (
        <div
          style={{
            position: 'fixed',
            left: tooltipCostoMarca.x,
            top: tooltipCostoMarca.y,
            background: '#1e293b',
            color: '#e2e8f0',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '12px',
            zIndex: 1000,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
            width: '280px',
          }}
        >
          <div
            style={{
              fontWeight: 'bold',
              marginBottom: '8px',
              borderBottom: '1px solid #475569',
              paddingBottom: '6px',
              fontSize: '13px',
            }}
          >
            {tooltipCostoMarca.data.tipo}: $
            {parseInt(tooltipCostoMarca.data.valor).toLocaleString()}
          </div>
          <div
            style={{ marginBottom: '6px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}
          >
            <span style={{ color: '#94a3b8', minWidth: '70px' }}>Dispositivo:</span>
            <span style={{ wordBreak: 'break-word', flex: 1 }}>
              {tooltipCostoMarca.data.dispositivo}
            </span>
          </div>
          <div
            style={{ marginBottom: '6px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}
          >
            <span style={{ color: '#94a3b8', minWidth: '70px' }}>Pieza:</span>
            <span style={{ wordBreak: 'break-word', flex: 1 }}>{tooltipCostoMarca.data.pieza}</span>
          </div>
          <div style={{ marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#94a3b8', minWidth: '70px' }}>Fecha:</span>
            <span>{formatearFecha(tooltipCostoMarca.data.fecha)}</span>
          </div>
          <div style={{ marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#94a3b8', minWidth: '70px' }}>Estado:</span>
            <span>{tooltipCostoMarca.data.estado || 'N/A'}</span>
          </div>
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              ...(tooltipCostoMarca.data.position === 'bottom'
                ? {
                    top: -8,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderBottom: '8px solid #1e293b',
                  }
                : {
                    bottom: -8,
                    borderLeft: '8px solid transparent',
                    borderRight: '8px solid transparent',
                    borderTop: '8px solid #1e293b',
                  }),
            }}
          />
        </div>
      )}
      {/* Tooltip de categorías de piezas */}
      {tooltipPiezas.show && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPiezas.x,
            top: tooltipPiezas.y,
            transform: 'translateY(-50%)',
            background: '#1e293b',
            color: '#e2e8f0',
            padding: '8px 14px',
            borderRadius: '12px',
            fontSize: '13px',
            zIndex: 1000,
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
          }}
        >
          {tooltipPiezas.categorias.map((cat, i) => (
            <div key={i} style={{ padding: '3px 0', whiteSpace: 'nowrap' }}>
              {cat}
            </div>
          ))}
          <div
            style={{
              position: 'absolute',
              left: -7,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 0,
              height: 0,
              borderTop: '6px solid transparent',
              borderBottom: '6px solid transparent',
              borderRight: '7px solid #1e293b',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ReporteReparaciones;
