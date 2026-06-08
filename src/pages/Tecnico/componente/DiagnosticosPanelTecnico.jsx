// pages/tecnico/componentes/DiagnosticosPanelTecnico.jsx
import React, { useState, useEffect } from 'react';
import { Card, Spinner, Alert, Button, Badge } from 'react-bootstrap';
import { ClipboardList, Smartphone, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

import { diagnosticoService } from '../../../services/DiagnosticoService';
import { DiagnosticoItemTecnico } from './DiagnosticoItemTecnico';

// Estados que NO queremos mostrar (ocultos)
const ESTADOS_OCULTOS = ['ESPERANDO_APROBACION', 'RECHAZADO', 'APROBADO', 'PAGADO', 'LISTO_PARA_RETIRAR'];

const formatearFecha = (fecha) => {
  if (!fecha) return 'Sin fecha';
  return new Date(fecha).toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};

const getBadgeIngreso = (index) =>
  index === 0 ? { bg: '#0d6efd', label: 'Ingreso actual' } : { bg: '#6c757d', label: `Ingreso anterior` };

export function DiagnosticosPanelTecnico({
  dispositivo,
  currentUser,
  onDiagnosticoCreado,
  onDiagnosticoActualizado,
  onCountChange,
}) {
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandidos, setExpandidos] = useState({});

  useEffect(() => {
    if (dispositivo?.id_dispositivo) {
      cargarIngresos();
    }
  }, [dispositivo]);

  // Contar solo diagnósticos VISIBLES (no ocultos)
  useEffect(() => {
    const total = ingresos.reduce((sum, ing) => sum + (ing.diagnosticos?.length || 0), 0);
    if (onCountChange) onCountChange(total);
  }, [ingresos, onCountChange]);

  const cargarIngresos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await diagnosticoService.obtenerIngresosPorDispositivo(
        dispositivo.id_dispositivo,
        currentUser?.id_usuario
      );
      const lista = res?.data || res || [];
      
      // Filtrar: ocultar diagnósticos con estados no deseados
      const listaFiltrada = Array.isArray(lista) 
        ? lista.map(ingreso => ({
            ...ingreso,
            diagnosticos: ingreso.diagnosticos?.filter(
              diag => !ESTADOS_OCULTOS.includes(diag.estado)
            ) || []
          })).filter(ingreso => ingreso.diagnosticos.length > 0)
        : [];
      
      setIngresos(listaFiltrada);

      // Expandir solo el ingreso más reciente por defecto
      if (listaFiltrada.length > 0) {
        setExpandidos({ [listaFiltrada[0].id_ingreso]: true });
      } else {
        setExpandidos({});
         if (onDiagnosticoActualizado) onDiagnosticoActualizado();
      }
    } catch (err) {
      console.error('Error al cargar ingresos:', err);
      setError('No se pudieron cargar los diagnósticos');
    } finally {
      setLoading(false);
    }
  };

  const toggleIngreso = (idIngreso) => {
    setExpandidos(prev => ({ ...prev, [idIngreso]: !prev[idIngreso] }));
  };

  const handleUpdateDiag = async (id, datos) => {
    await diagnosticoService.actualizar(id, datos);
    await cargarIngresos();
    if (onDiagnosticoActualizado) onDiagnosticoActualizado();
  };

  const getNombreMarca = () => {
    if (dispositivo?.modelo?.marca)
      return typeof dispositivo.modelo.marca === 'object'
        ? dispositivo.modelo.marca.marca : dispositivo.modelo.marca;
    if (dispositivo?.marca)
      return typeof dispositivo.marca === 'object'
        ? dispositivo.marca.marca : dispositivo.marca;
    return 'Marca';
  };

  const getNombreModelo = () => {
    if (dispositivo?.modelo)
      return typeof dispositivo.modelo === 'object'
        ? dispositivo.modelo.nombre_modelo : dispositivo.modelo;
    return 'Modelo';
  };

  if (!dispositivo) return null;

  const dispositivoInfo = { marca: getNombreMarca(), modelo: getNombreModelo() };

  return (
    <Card className="shadow-sm border-0">

      {/* Header azul */}
      <Card.Header className="bg-primary text-white py-3">
        <div className="d-flex align-items-center gap-2">
          <Smartphone size={18} />
          <div>
            <h5 className="mb-0 fw-bold">{dispositivoInfo.marca} {dispositivoInfo.modelo}</h5>
            <small className="opacity-75">Diagnósticos · ID {dispositivo.id_dispositivo}</small>
          </div>
        </div>
      </Card.Header>

      <Card.Body className="p-3">

        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" variant="primary" size="sm" />
            <p className="mt-2 text-muted small">Cargando diagnósticos...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="py-2">
            {error}
            <Button size="sm" variant="outline-danger" className="ms-3" onClick={cargarIngresos}>
              Reintentar
            </Button>
          </Alert>
        ) : ingresos.length === 0 ? (
          <div className="text-center py-4 bg-light rounded-3">
            <ClipboardList size={36} className="text-muted mb-2" />
            <p className="text-muted mb-0">No hay diagnósticos activos para este dispositivo</p>
            <small className="text-muted">Los diagnósticos aprobados, rechazados o en espera no se muestran</small>
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {ingresos.map((ingreso, index) => {
              const badge = getBadgeIngreso(index);
              const abierto = !!expandidos[ingreso.id_ingreso];
              const cantidad = ingreso.diagnosticos?.length || 0;

              return (
                <div
                  key={ingreso.id_ingreso}
                  style={{
                    border: `1.5px solid ${index === 0 ? '#0d6efd33' : '#dee2e6'}`,
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Fila clickeable con fecha */}
                  <div
                    onClick={() => toggleIngreso(ingreso.id_ingreso)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      cursor: 'pointer',
                      background: index === 0 ? '#f0f5ff' : '#f8f9fa',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = index === 0 ? '#e0ecff' : '#f0f0f0'}
                    onMouseLeave={e => e.currentTarget.style.background = index === 0 ? '#f0f5ff' : '#f8f9fa'}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <Calendar size={16} style={{ color: badge.bg }} />
                      <span className="fw-semibold" style={{ fontSize: '0.9rem', color: '#1a1a1a' }}>
                        {formatearFecha(ingreso.fecha_ingreso)}
                      </span>
                      <span
                        style={{
                          background: badge.bg,
                          color: 'white',
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: '20px',
                          fontWeight: 600,
                        }}
                      >
                        {badge.label}
                      </span>
                      {ingreso.estado_ingreso && (
                        <span style={{
                          background: '#f0f0f0',
                          color: '#666',
                          fontSize: '0.7rem',
                          padding: '2px 8px',
                          borderRadius: '20px',
                        }}>
                          {ingreso.estado_ingreso}
                        </span>
                      )}
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      <span style={{ fontSize: '0.78rem', color: '#888' }}>
                        {cantidad} diagnóstico{cantidad !== 1 ? 's' : ''}
                      </span>
                      {abierto ? <ChevronUp size={16} color="#888" /> : <ChevronDown size={16} color="#888" />}
                    </div>
                  </div>

                  {/* Diagnósticos expandibles */}
                  {abierto && (
                    <div style={{ padding: '12px 16px', background: 'white' }}>
                      {cantidad === 0 ? (
                        <p className="text-muted small text-center py-2 mb-0">
                          Sin diagnósticos en este ingreso
                        </p>
                      ) : (
                        ingreso.diagnosticos.map((diag) => (
                          <DiagnosticoItemTecnico
                            key={diag.id_diagnostico}
                            diagnostico={diag}
                            onUpdate={handleUpdateDiag}
                            onEstadoCambiado={cargarIngresos}
                          />
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ❌ BOTÓN ELIMINADO - Ya no se muestra "Agregar nuevo diagnóstico" */}

      </Card.Body>
    </Card>
  );
}