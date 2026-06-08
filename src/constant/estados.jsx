// ============================================
// CONSTANTES DE ESTADOS
// ============================================
export const ESTADOS_DIAGNOSTICO = {
  ESPERANDO_DIAGNOSTICO: 'ESPERANDO_DIAGNOSTICO',
  ESPERANDO_APROBACION: 'ESPERANDO_APROBACION',
  EN_REVISION: 'EN_REVISION',
  EN_REPARACION: 'EN_REPARACION',
  EN_ESPERA_DE_PIEZAS: 'EN_ESPERA_DE_PIEZAS',
  LISTO_PARA_RETIRAR: 'LISTO_PARA_RETIRAR',
  COMPLETADO: 'COMPLETADO',
  APROBADO: 'APROBADO',
  RECHAZADO: 'RECHAZADO',
  NO_REPARADO: 'NO_REPARADO'
};

export const ESTADOS_LABELS = {
  [ESTADOS_DIAGNOSTICO.ESPERANDO_DIAGNOSTICO]: 'Esperando Diagnóstico',
  [ESTADOS_DIAGNOSTICO.ESPERANDO_APROBACION]: 'Esperando aprobación',
  [ESTADOS_DIAGNOSTICO.EN_REVISION]: 'En revisión',
  [ESTADOS_DIAGNOSTICO.EN_REPARACION]: 'En reparación',
  [ESTADOS_DIAGNOSTICO.EN_ESPERA_DE_PIEZAS]: 'En espera de piezas',
  [ESTADOS_DIAGNOSTICO.LISTO_PARA_RETIRAR]: 'Listo para retirar',
  [ESTADOS_DIAGNOSTICO.COMPLETADO]: 'Completado',
  [ESTADOS_DIAGNOSTICO.APROBADO]: 'Aprobado',
  [ESTADOS_DIAGNOSTICO.RECHAZADO]: 'Rechazado',
  [ESTADOS_DIAGNOSTICO.NO_REPARADO]: 'No reparado'
};

export const ESTADOS_COLORS = {
  [ESTADOS_DIAGNOSTICO.ESPERANDO_DIAGNOSTICO]: 'warning',
  [ESTADOS_DIAGNOSTICO.ESPERANDO_APROBACION]: 'info',
  [ESTADOS_DIAGNOSTICO.EN_REVISION]: 'primary',
  [ESTADOS_DIAGNOSTICO.EN_REPARACION]: 'secondary',
  [ESTADOS_DIAGNOSTICO.EN_ESPERA_DE_PIEZAS]: 'dark',
  [ESTADOS_DIAGNOSTICO.LISTO_PARA_RETIRAR]: 'success',
  [ESTADOS_DIAGNOSTICO.COMPLETADO]: 'success',
  [ESTADOS_DIAGNOSTICO.APROBADO]: 'success',
  [ESTADOS_DIAGNOSTICO.RECHAZADO]: 'danger',
  [ESTADOS_DIAGNOSTICO.NO_REPARADO]: 'danger'
};

// ============================================
// CONSTANTES DE GRAVEDAD
// ============================================
export const GRAVEDAD = {
  URGENTE: 'URGENTE',
  MODERADO: 'MODERADO',
  LEVE: 'LEVE'
};

export const GRAVEDAD_LABELS = {
  [GRAVEDAD.URGENTE]: 'Urgente',
  [GRAVEDAD.MODERADO]: 'Moderado',
  [GRAVEDAD.LEVE]: 'Leve'
};

export const GRAVEDAD_COLORS = {
  [GRAVEDAD.URGENTE]: 'danger',
  [GRAVEDAD.MODERADO]: 'warning',
  [GRAVEDAD.LEVE]: 'success'
};

export const GRAVEDAD_OPTIONS = [
  { value: GRAVEDAD.LEVE, label: GRAVEDAD_LABELS[GRAVEDAD.LEVE], color: GRAVEDAD_COLORS[GRAVEDAD.LEVE] },
  { value: GRAVEDAD.MODERADO, label: GRAVEDAD_LABELS[GRAVEDAD.MODERADO], color: GRAVEDAD_COLORS[GRAVEDAD.MODERADO] },
  { value: GRAVEDAD.URGENTE, label: GRAVEDAD_LABELS[GRAVEDAD.URGENTE], color: GRAVEDAD_COLORS[GRAVEDAD.URGENTE] }
];

// ============================================
// FUNCIONES DE UTILIDAD
// ============================================
export const getGravedadColor = (gravedad) => GRAVEDAD_COLORS[gravedad] || 'secondary';
export const getGravedadLabel = (gravedad) => GRAVEDAD_LABELS[gravedad] || gravedad;
export const getEstadoColor = (estado) => ESTADOS_COLORS[estado] || 'secondary';
export const getEstadoLabel = (estado) => ESTADOS_LABELS[estado] || estado;