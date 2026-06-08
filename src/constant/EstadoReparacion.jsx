// ============================================
// CONSTANTES DE ESTADOS DE REPARACIÓN
// ============================================
import React from 'react';
import { Wrench, Clock, CheckCircle, XCircle } from 'lucide-react'
export const ESTADOS_REPARACION = {
  PENDIENTE: 'PENDIENTE',
  EN_PROCESO: 'EN_PROCESO',
  EN_ESPERA_DE_PIEZAS: 'EN_ESPERA_DE_PIEZAS',
  COMPLETADO: 'COMPLETADO',
  RECHAZADO: 'RECHAZADO',
  CANCELADO: 'CANCELADO'
};

export const ESTADOS_REPARACION_LABELS = {
  [ESTADOS_REPARACION.PENDIENTE]: 'Pendiente',
  [ESTADOS_REPARACION.EN_PROCESO]: 'En proceso',
  [ESTADOS_REPARACION.EN_ESPERA_DE_PIEZAS]: 'En espera de piezas',
  [ESTADOS_REPARACION.COMPLETADO]: 'Completado',
  [ESTADOS_REPARACION.RECHAZADO]: 'Rechazado',
  [ESTADOS_REPARACION.CANCELADO]: 'Cancelado'
};

export const ESTADOS_REPARACION_COLORS = {
  [ESTADOS_REPARACION.PENDIENTE]: 'secondary',
  [ESTADOS_REPARACION.EN_PROCESO]: 'warning',
  [ESTADOS_REPARACION.EN_ESPERA_DE_PIEZAS]: 'info',
  [ESTADOS_REPARACION.COMPLETADO]: 'success',
  [ESTADOS_REPARACION.RECHAZADO]: 'danger',
  [ESTADOS_REPARACION.CANCELADO]: 'dark'
};

// Opciones para selects
export const ESTADOS_REPARACION_OPTIONS = Object.values(ESTADOS_REPARACION).map(estado => ({
  value: estado,
  label: ESTADOS_REPARACION_LABELS[estado] || estado,
  color: ESTADOS_REPARACION_COLORS[estado] || 'secondary'
}));

// ============================================
// FUNCIONES DE UTILIDAD PARA REPARACIONES
// ============================================
export const getEstadoReparacionColor = (estado) => 
  ESTADOS_REPARACION_COLORS[estado] || 'secondary';

export const getEstadoReparacionLabel = (estado) => 
  ESTADOS_REPARACION_LABELS[estado] || estado;

// Íconos para cada estado
export const getEstadoReparacionIcon = (estado) => {
  switch(estado) {
    case ESTADOS_REPARACION.COMPLETADO:
      return <CheckCircle size={14} />;
    case ESTADOS_REPARACION.EN_PROCESO:
      return <Wrench size={14} />;
    case ESTADOS_REPARACION.EN_ESPERA_DE_PIEZAS:
      return <Clock size={14} />;
    case ESTADOS_REPARACION.RECHAZADO:
    case ESTADOS_REPARACION.CANCELADO:
      return <XCircle size={14} />;
    default:
      return <Wrench size={14} />;
  }
};

// Progreso según el estado (para ProgressBar)
export const getProgressPorEstado = (estado) => {
  const progress = {
    [ESTADOS_REPARACION.PENDIENTE]: 10,
    [ESTADOS_REPARACION.EN_PROCESO]: 40,
    [ESTADOS_REPARACION.EN_ESPERA_DE_PIEZAS]: 60,
    [ESTADOS_REPARACION.COMPLETADO]: 100,
    [ESTADOS_REPARACION.RECHAZADO]: 100,
    [ESTADOS_REPARACION.CANCELADO]: 100
  };
  return progress[estado] || 0;
};