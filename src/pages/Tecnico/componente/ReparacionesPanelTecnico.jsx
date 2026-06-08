// pages/Tecnico/componente/ReparacionesPanelTecnico.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Card, Alert, Button, Spinner, Form, Row, Col } from 'react-bootstrap';
import { Wrench, Smartphone, PlusCircle, X, Save } from 'lucide-react';

import reparacionService from '../../../services/ReparacionService';
import { ReparacionItemTecnico } from './ReparacionItemTecnico';

// Estados que NO se muestran en el panel del técnico
const ESTADOS_OCULTOS_REPARACIONES = [
  'LISTO_PARA_RETIRAR',
  'PAGADO',
  'TERMINADO',
  'CANCELADO',
  'RECHAZADO',
  'ESPERANDO_APROBACION', // Este estado lo ve el cliente, no el técnico
];

// Función para calcular el estado general basado en las piezas
const calcularEstadoGeneral = (reparacion) => {
  const piezas = reparacion.reparaciones_multiples || [];

  if (piezas.length === 0) return 'SIN_PIEZAS';

  // 👉 Obtener solo piezas activas (excluye RECHAZADO y CANCELADO)
  const piezasActivas = piezas.filter((p) => p.estado !== 'RECHAZADO' && p.estado !== 'CANCELADO');

  // Si no hay piezas activas (todas rechazadas/canceladas) → TERMINADO
  if (piezasActivas.length === 0) return 'TERMINADO';

  // 👉 Si todas las piezas activas están TERMINADO → TERMINADO
  if (piezasActivas.every((p) => p.estado === 'TERMINADO')) {
    return 'TERMINADO';
  }

  // Si alguna pieza está EN_REPARACION
  if (piezasActivas.some((p) => p.estado === 'EN_REPARACION')) {
    return 'EN_REPARACION';
  }

  // Si alguna pieza está ESPERANDO_PIEZA
  if (piezasActivas.some((p) => p.estado === 'ESPERANDO_PIEZA')) {
    return 'ESPERANDO_PIEZA';
  }

  // Si alguna pieza está ESPERANDO_APROBACION
  if (piezasActivas.some((p) => p.estado === 'ESPERANDO_APROBACION')) {
    return 'ESPERANDO_APROBACION';
  }

  return 'PENDIENTE';
};

export function ReparacionesPanelTecnico({
  ingresoId,
  currentUser,
  dispositivoInfo,
  onCountChange,
  onDispositivosActualizar,
}) {
  const [reparaciones, setReparaciones] = useState([]);
  const [reparacionesFiltradas, setReparacionesFiltradas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showNuevaRep, setShowNuevaRep] = useState(false);
  const [creando, setCreando] = useState(false);
  const [comentario, setComentario] = useState('');
  const [errorCrear, setErrorCrear] = useState(null);
  const cargandoRef = useRef(false);
  const ultimoIngresoIdRef = useRef(null);
  useEffect(() => {
    if (ingresoId) cargarReparaciones();
  }, [ingresoId]);

  useEffect(() => {
    if (onCountChange) onCountChange(reparacionesFiltradas.length);
  }, [reparacionesFiltradas, onCountChange]);

  const cargarReparaciones = async () => {
    // ✅ Evitar cargas múltiples simultáneas
    if (cargandoRef.current) {
      console.log('⚠️ Ya hay una carga en curso, omitiendo...');
      return;
    }

    console.log('🔍 Cargando reparaciones para ingresoId:', ingresoId);
    cargandoRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await reparacionService.obtenerPorIngresoConDiagnostico(ingresoId);

      const data = response?.data?.data || response?.data || response || [];
      const arr = Array.isArray(data) ? data : [];

      // Calcular estado general y filtrar
      const filtradas = arr.filter((rep) => {
        const estadoGeneral = calcularEstadoGeneral(rep);

        // Reparaciones sin diagnóstico y sin piezas se muestran
        if (
          rep.id_diagnostico === null &&
          (!rep.reparaciones_multiples || rep.reparaciones_multiples.length === 0)
        ) {
          return true;
        }

        const oculto = ESTADOS_OCULTOS_REPARACIONES.includes(estadoGeneral);

        if (oculto) {
          console.log(`📌 Reparación #${rep.id_reparacion} oculta - estado: ${estadoGeneral}`);
        }

        return !oculto;
      });

      setReparacionesFiltradas(filtradas);

      const nuevoCount = filtradas.length;
      if (onCountChange && nuevoCount !== reparacionesFiltradas.length) {
        console.log('📊 Actualizando contador a:', nuevoCount);
        onCountChange(nuevoCount);
      }

      // ✅ EVITAR EL BUCLE: Solo actualizar dispositivos si NO quedan reparaciones activas
      // y si el ingresoId cambió realmente
      if (
        filtradas.length === 0 &&
        onDispositivosActualizar &&
        ingresoId !== ultimoIngresoIdRef.current
      ) {
        ultimoIngresoIdRef.current = ingresoId;
        console.log('📱 No quedan reparaciones activas, actualizando lista de dispositivos...');
        // ✅ Usar setTimeout para evitar llamadas inmediatas que causen bucles
        setTimeout(() => {
          onDispositivosActualizar();
        }, 100);
      }
    } catch (err) {
      console.error('Error cargando reparaciones:', err);
      setError('No se pudieron cargar las reparaciones');
    } finally {
      setLoading(false);
      cargandoRef.current = false;
    }
  };

  const handleCrearReparacion = async () => {
    if (!ingresoId) return;
    setCreando(true);
    setErrorCrear(null);
    try {
      await reparacionService.crear({
        id_ingreso: ingresoId,
        id_usuario: currentUser?.id_usuario,
        id_diagnostico: null,
        comentario: comentario || 'Reparación directa solicitada por el cliente',
      });
      setShowNuevaRep(false);
      setComentario('');
      await cargarReparaciones();
    } catch (err) {
      console.error('Error creando reparación:', err);
      setErrorCrear('No se pudo crear la reparación. Intentá de nuevo.');
    } finally {
      setCreando(false);
    }
  };

  return (
    <Card className="shadow-sm border-0">
      {/* Header */}
      <Card.Header className="bg-primary text-white py-3">
        <div className="d-flex align-items-center gap-2">
          <Smartphone size={18} />
          <div>
            <h5 className="mb-0 fw-bold">
              {dispositivoInfo?.marca} {dispositivoInfo?.modelo}
            </h5>
            <small className="opacity-75">Reparaciones · Ingreso #{ingresoId}</small>
          </div>
        </div>
      </Card.Header>

      <Card.Body>
        {/* Lista */}
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" size="sm" />
            <p className="mt-2 text-muted small">Cargando reparaciones...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="py-2">
            {error}
            <Button
              size="sm"
              variant="outline-danger"
              className="ms-3"
              onClick={cargarReparaciones}
            >
              Reintentar
            </Button>
          </Alert>
        ) : reparacionesFiltradas.length === 0 ? (
          <div className="text-center py-4 bg-light rounded-3">
            <Wrench size={36} className="text-muted mb-2" />
            <p className="text-muted mb-0">No hay reparaciones activas para este dispositivo</p>
            <small className="text-muted">
              Las reparaciones terminadas, pagadas o canceladas no se muestran
            </small>
          </div>
        ) : (
          reparacionesFiltradas.map((rep) => (
            <ReparacionItemTecnico
              key={rep.id_reparacion}
              reparacion={rep}
              onRecargar={cargarReparaciones}
            />
          ))
        )}
      </Card.Body>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </Card>
  );
}
