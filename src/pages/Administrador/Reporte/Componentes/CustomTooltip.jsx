import React from 'react';

/**
 * Función para formatear horas a formato legible (minutos/horas/días)
 */
const formatearTiempo = (horas) => {
  if (!horas && horas !== 0) return '—';

  const horasNum = parseFloat(horas);
  if (isNaN(horasNum)) return '—';

  // Si es 0 o menor a 1 minuto
  if (horasNum === 0) return '< 1 min';

  // Si es menos de 1 hora, mostrar en minutos
  if (horasNum < 1) {
    const minutos = Math.round(horasNum * 60);
    if (minutos === 0) return '< 1 min';
    return `${minutos} minuto${minutos !== 1 ? 's' : ''}`;
  }

  // Si es menos de 24 horas, mostrar horas y minutos
  if (horasNum < 24) {
    const horasEnteras = Math.floor(horasNum);
    const minutosRestantes = Math.round((horasNum - horasEnteras) * 60);

    if (minutosRestantes === 0) {
      return `${horasEnteras} hora${horasEnteras !== 1 ? 's' : ''}`;
    }
    return `${horasEnteras} h ${minutosRestantes} min`;
  }

  // Si es más de 24 horas, mostrar días, horas y minutos
  const dias = Math.floor(horasNum / 24);
  const horasRestantes = horasNum % 24;
  const horasEnteras = Math.floor(horasRestantes);
  const minutosRestantes = Math.round((horasRestantes - horasEnteras) * 60);

  let resultado = `${dias} día${dias !== 1 ? 's' : ''}`;
  if (horasEnteras > 0) {
    resultado += ` ${horasEnteras} h`;
  }
  if (minutosRestantes > 0) {
    resultado += ` ${minutosRestantes} min`;
  }
  return resultado;
};

/**
 * Función para formatear valores numéricos (moneda)
 */
const formatearMoneda = (valor) => {
  const num = parseFloat(valor);
  if (isNaN(num)) return valor;
  return `$${num.toLocaleString()}`;
};

/**
 * Detectar si un valor debe formatearse como tiempo
 */
const esValorDeTiempo = (name, dataKey) => {
  const palabrasTiempo = [
    'hora',
    'tiempo',
    'promedio',
    'duracion',
    'duración',
    'inicio',
    'total',
    'rapido',
    'lento',
    'demora',
    'hour',
    'time',
    'duration',
    'average',
    'promedio_horas',
    'tiempo',
  ];

  const textoLower = (name || '' + (dataKey || '')).toLowerCase();
  return palabrasTiempo.some((palabra) => textoLower.includes(palabra));
};

/**
 * Detectar si un valor debe formatearse como moneda
 */
const esValorDeMoneda = (name, dataKey) => {
  const palabrasMoneda = [
    'ingreso',
    'costo',
    'precio',
    'ganancia',
    'total_generado',
    'ingresos',
    'costos',
    'monto',
    'valor',
  ];

  const textoLower = (name || '' + (dataKey || '')).toLowerCase();
  return palabrasMoneda.some((palabra) => textoLower.includes(palabra));
};

/**
 * Tooltip reutilizable para todas las gráficas Recharts
 * Uso: <Tooltip content={<CustomTooltip />} />
 */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        background: '#1e293b',
        border: '1px solid #334155',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
        color: '#e2e8f0',
        minWidth: 160,
      }}
    >
      <div
        style={{
          fontWeight: 700,
          marginBottom: 6,
          color: '#a5b4fc',
          borderBottom: '1px solid #334155',
          paddingBottom: 4,
        }}
      >
        {label}
      </div>
      {payload.map((p, i) => {
        let displayValue = p.value;

        // Formatear según el tipo de dato
        if (typeof p.value === 'number') {
          // Si es tiempo (por nombre o dataKey)
          if (esValorDeTiempo(p.name, p.dataKey)) {
            displayValue = formatearTiempo(p.value);
          }
          // Si es moneda
          else if (esValorDeMoneda(p.name, p.dataKey)) {
            displayValue = formatearMoneda(p.value);
          }
          // Si es porcentaje (valores entre 0-100 con palabras clave)
          else if (
            p.name?.toLowerCase().includes('tasa') ||
            p.name?.toLowerCase().includes('éxito') ||
            p.name?.toLowerCase().includes('exito')
          ) {
            displayValue = `${p.value}%`;
          }
        }

        return (
          <div key={i} style={{ color: p.color ?? '#e2e8f0', marginTop: 4 }}>
            {p.name}: <strong>{displayValue}</strong>
          </div>
        );
      })}
    </div>
  );
};

export default CustomTooltip;
