// components/Admin/Reasignaciones/ReasignacionReparacion.jsx
import React, { useState, useEffect } from 'react';
import { reasignacionReparacionService } from '../../../services/reasignacionReparacionService';
import ModalReasignar from './ModalReasignar';
import './ReasignacionDiagnostico.css';

const ReasignacionReparacion = () => {
  const [tecnicos, setTecnicos]                           = useState([]);
  const [tecnicoSeleccionado, setTecnicoSeleccionado]     = useState(null);
  const [reparacionesPendientes, setReparacionesPendientes] = useState([]);
  const [reparacionesSeleccionadas, setReparacionesSeleccionadas] = useState([]);
  const [loading, setLoading]                             = useState(false);
  const [showModal, setShowModal]                         = useState(false);

  useEffect(() => { cargarTecnicos(); }, []);

  useEffect(() => {
    if (tecnicoSeleccionado) {
      cargarReparacionesPendientes(tecnicoSeleccionado.id_usuario);
    }
  }, [tecnicoSeleccionado]);

  const cargarTecnicos = async () => {
    setLoading(true);
    try {
      const data = await reasignacionReparacionService.obtenerTecnicosDisponibles();
      console.log('Técnicos cargados:', data);
      setTecnicos(data.data || data);
    } catch (error) {
      console.error('Error al cargar técnicos:', error);
      alert('Error al cargar la lista de técnicos');
    } finally {
      setLoading(false);
    }
  };

  // En ReasignacionReparacion.jsx
const cargarReparacionesPendientes = async (idTecnico) => {
  setLoading(true);
  try {
const data = await reasignacionReparacionService.obtenerPendientesPorTecnico(idTecnico);
    console.log("Reparaciones activas:", data);
    const lista = data.data || data;
    setReparacionesPendientes(lista);
    setReparacionesSeleccionadas([]);
  } catch (error) {
    console.error('Error al cargar reparaciones:', error);
  } finally {
    setLoading(false);
  }
};

  const handleToggleReparacion = (idReparacion) => {
    setReparacionesSeleccionadas(prev =>
      prev.includes(idReparacion)
        ? prev.filter(id => id !== idReparacion)
        : [...prev, idReparacion]
    );
  };

  const handleSeleccionarTodos = () => {
    if (reparacionesSeleccionadas.length === reparacionesPendientes.length) {
      setReparacionesSeleccionadas([]);
    } else {
      setReparacionesSeleccionadas(reparacionesPendientes.map(r => r.id_reparacion));
    }
  };

  const handleReasignar = async (idTecnicoDestino) => {
    if (reparacionesSeleccionadas.length === 0) {
      alert('Seleccione al menos una reparación para reasignar');
      return;
    }
    setLoading(true);
    try {
      await reasignacionReparacionService.reasignarMultiplesReparaciones(
        reparacionesSeleccionadas,
        idTecnicoDestino
      );
      alert(`✅ ${reparacionesSeleccionadas.length} reparación(es) reasignada(s) exitosamente`);
      setShowModal(false);
      setReparacionesSeleccionadas([]);
      setReparacionesPendientes([]);
      if (tecnicoSeleccionado) {
        cargarReparacionesPendientes(tecnicoSeleccionado.id_usuario);
      }
    } catch (error) {
      console.error('Error al reasignar:', error);
      alert('❌ Error al reasignar las reparaciones');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado) => {
    const estados = {
      'PENDIENTE':            { label: 'Pendiente',       color: 'warning'   },
      'EN_REPARACION':        { label: 'En Reparación',   color: 'primary'   },
      'ESPERANDO_PIEZA':      { label: 'Esp. Pieza',      color: 'secondary' },
      'ESPERANDO_APROBACION': { label: 'Esp. Aprobación', color: 'info'      },
    };
    const estadoInfo = estados[estado] || { label: estado, color: 'secondary' };
    return <span className={`badge bg-${estadoInfo.color}`}>{estadoInfo.label}</span>;
  };

  const getTipoBadge = (reparacion) => {
    if (reparacion.id_diagnostico) {
      return <span className="badge bg-primary opacity-75">Desde diagnóstico</span>;
    }
    return <span className="badge bg-success opacity-75">Directa</span>;
  };

  const getDispositivoNombre = (reparacion) => {
    const marca  = reparacion.ingreso?.dispositivo?.modelo?.marca?.marca || '';
    const modelo = reparacion.ingreso?.dispositivo?.modelo?.nombre_modelo || '';
    return marca || modelo ? `${marca} ${modelo}`.trim() : 'N/A';
  };

  // 🟢 NUEVA FUNCIÓN: Renderizar indicador de estado en línea
  const renderOnlineIndicator = (tecnico) => {
    const isOnline = tecnico.en_linea === true || tecnico.en_linea === 1;
    
    return (
      <div className="online-indicator-container">
        <div className={`online-indicator ${isOnline ? 'online' : 'offline'}`}>
          <span className="indicator-dot"></span>
          <span className="indicator-text">
            {isOnline ? 'En línea' : 'Desconectado'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="reasignaciones-container">
      <div className="reasignaciones-header">
        <h2>
          <i className="fas fa-wrench me-2"></i>
          Reasignar Reparaciones
        </h2>
      </div>

      <div className="reasignaciones-layout">

        {/* Panel izquierdo — Técnicos */}
        <div className="tecnicos-panel">
          <div className="panel-header">
            <h3><i className="fas fa-users me-2"></i>Técnicos</h3>
          </div>
          <div className="tecnicos-list">
            {tecnicos.map(tecnico => (
              <div
                key={tecnico.id_usuario}
                className={`tecnico-card ${tecnicoSeleccionado?.id_usuario === tecnico.id_usuario ? 'selected' : ''}`}
                onClick={() => setTecnicoSeleccionado(tecnico)}
              >
                <div className="tecnico-avatar">
                  {tecnico.nombre?.charAt(0)}{tecnico.apellido?.charAt(0)}
                </div>
                <div className="tecnico-info">
                  <div className="tecnico-nombre">
                    {tecnico.nombre} {tecnico.apellido}
                  </div>
                  {/* 🟢 NUEVO: Mostrar estado en línea */}
                  {renderOnlineIndicator(tecnico)}
                  <div className="tecnico-carga">
                    <span className={`carga-badge ${tecnico.carga_actual > 5 ? 'alta' : tecnico.carga_actual > 3 ? 'media' : 'baja'}`}>
                      {tecnico.carga_actual} trabajos activos
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho — Reparaciones */}
        <div className="diagnosticos-panel">
          <div className="panel-header">
            <h3>
              <i className="fas fa-tools me-2"></i>
              {tecnicoSeleccionado
                ? `Reparaciones de ${tecnicoSeleccionado.nombre} ${tecnicoSeleccionado.apellido}`
                : 'Seleccione un técnico'}
            </h3>
            {reparacionesPendientes.length > 0 && (
              <button className="btn-seleccionar-todos" onClick={handleSeleccionarTodos}>
                {reparacionesSeleccionadas.length === reparacionesPendientes.length
                  ? 'Deseleccionar Todos'
                  : 'Seleccionar Todos'}
              </button>
            )}
          </div>

          {tecnicoSeleccionado && (
            <>
              <div className="diagnosticos-stats">
                <span className="stat-item">
                  <i className="fas fa-wrench me-1"></i>
                  Total activas: {reparacionesPendientes.length}
                </span>
                {reparacionesSeleccionadas.length > 0 && (
                  <>
                    <span className="stat-item selected">
                      <i className="fas fa-check-circle me-1"></i>
                      Seleccionadas: {reparacionesSeleccionadas.length}
                    </span>
                    <button className="btn-reasignar" onClick={() => setShowModal(true)}>
                      <i className="fas fa-arrow-right me-1"></i>
                      Reasignar Seleccionadas
                    </button>
                  </>
                )}
              </div>

              <div className="diagnosticos-list">
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando reparaciones...</p>
                  </div>
                ) : reparacionesPendientes.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-check-circle"></i>
                    <p>No hay reparaciones activas para este técnico</p>
                  </div>
                ) : (
                  <table className="diagnosticos-table">
                    <thead>
                      <tr>
                        <th width="50">
                          <input
                            type="checkbox"
                            checked={reparacionesSeleccionadas.length === reparacionesPendientes.length}
                            onChange={handleSeleccionarTodos}
                          />
                        </th>
                        <th>ID</th>
                        <th>Tipo</th>
                        <th>Dispositivo</th>
                        <th>Estado</th>
                        <th>Piezas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reparacionesPendientes.map(reparacion => (
                        <tr
                          key={reparacion.id_reparacion}
                          className={reparacionesSeleccionadas.includes(reparacion.id_reparacion) ? 'selected-row' : ''}
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={reparacionesSeleccionadas.includes(reparacion.id_reparacion)}
                              onChange={() => handleToggleReparacion(reparacion.id_reparacion)}
                            />
                          </td>
                          <td>#{reparacion.id_reparacion}</td>
                          <td>{getTipoBadge(reparacion)}</td>
                          <td>{getDispositivoNombre(reparacion)}</td>
                          <td>{getEstadoBadge(reparacion.estado_general || reparacion.estado)}</td>
                          <td>
                            {reparacion.reparaciones_multiples?.length > 0 ? (
                              <div style={{ fontSize: '12px' }}>
                                <span className="badge bg-secondary me-1">
                                  {reparacion.reparaciones_multiples.length} pieza(s)
                                </span>
                                {reparacion.reparaciones_multiples.map(p => (
                                  <div key={p.id_multiple} className="text-muted" style={{ fontSize: '11px' }}>
                                    • {p.pieza?.nombre_pieza || `Pieza #${p.id_pieza}`}
                                    <span className={`badge bg-${p.estado === 'APROBADO' ? 'success' : 'warning'} ms-1`} 
                                          style={{ fontSize: '10px' }}>
                                      {p.estado}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-muted" style={{ fontSize: '12px' }}>Sin piezas aún</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ModalReasignar
        show={showModal}
        onClose={() => setShowModal(false)}
        tecnicos={tecnicos.filter(t => t.id_usuario !== tecnicoSeleccionado?.id_usuario)}
        onConfirm={handleReasignar}
        cantidadSeleccionados={reparacionesSeleccionadas.length}
      />
    </div>
  );
};

export default ReasignacionReparacion;