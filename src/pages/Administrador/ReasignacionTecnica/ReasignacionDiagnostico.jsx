// components/Admin/Reasignaciones/ReasignacionDiagnostico.jsx
import React, { useState, useEffect } from 'react';
import { reasignacionDiagnosticoService } from '../../../services/reasignacionDiagnosticoService';
import ModalReasignar from './ModalReasignar';
import './ReasignacionDiagnostico.css';

const ReasignacionDiagnostico = () => {
  const [tecnicos, setTecnicos] = useState([]);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);
  const [diagnosticosPendientes, setDiagnosticosPendientes] = useState([]);
  const [diagnosticosSeleccionados, setDiagnosticosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => { cargarTecnicos(); }, []);

  useEffect(() => {
    if (tecnicoSeleccionado) {
      cargarDiagnosticosPendientes(tecnicoSeleccionado.id_usuario);
    }
  }, [tecnicoSeleccionado]);

  const cargarTecnicos = async () => {
    setLoading(true);
    try {
      const data = await reasignacionDiagnosticoService.obtenerTecnicosDisponibles();
      console.log('Técnicos cargados:', data);
      setTecnicos(data.data || data);
    } catch (error) {
      console.error('Error al cargar técnicos:', error);
      alert('Error al cargar la lista de técnicos');
    } finally {
      setLoading(false);
    }
  };

  const cargarDiagnosticosPendientes = async (idTecnico) => {
    setLoading(true);
    try {
      const data = await reasignacionDiagnosticoService.obtenerPendientesPorTecnico(idTecnico);
      console.log('Diagnósticos del técnico:', data);
      const lista = data.data || data;
      setDiagnosticosPendientes(lista);
      setDiagnosticosSeleccionados([]);
    } catch (error) {
      console.error('Error al cargar diagnósticos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleDiagnostico = (idDiagnostico) => {
    setDiagnosticosSeleccionados(prev =>
      prev.includes(idDiagnostico)
        ? prev.filter(id => id !== idDiagnostico)
        : [...prev, idDiagnostico]
    );
  };

  const handleSeleccionarTodos = () => {
    if (diagnosticosSeleccionados.length === diagnosticosPendientes.length) {
      setDiagnosticosSeleccionados([]);
    } else {
      setDiagnosticosSeleccionados(diagnosticosPendientes.map(d => d.id_diagnostico));
    }
  };

  const handleReasignar = async (idTecnicoDestino) => {
    if (diagnosticosSeleccionados.length === 0) {
      alert('Seleccione al menos un diagnóstico para reasignar');
      return;
    }
    setLoading(true);
    try {
      await reasignacionDiagnosticoService.reasignarMultiplesDiagnosticos(
        diagnosticosSeleccionados,
        idTecnicoDestino
      );
      alert(`✅ ${diagnosticosSeleccionados.length} diagnóstico(s) reasignado(s) exitosamente`);
      setShowModal(false);
      setDiagnosticosSeleccionados([]);
      if (tecnicoSeleccionado) {
        cargarDiagnosticosPendientes(tecnicoSeleccionado.id_usuario);
      }
      // Recargar técnicos para actualizar cargas
      cargarTecnicos();
    } catch (error) {
      console.error('Error al reasignar:', error);
      alert('❌ Error al reasignar los diagnósticos');
    } finally {
      setLoading(false);
    }
  };

  // Renderizar indicador de estado en línea
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

  const getEstadoBadge = (estado) => {
    const estados = {
      'ESPERANDO_DIAGNOSTICO': { label: 'Esperando Diag.', color: 'warning' },
      'EN_REVISION': { label: 'En Revisión', color: 'primary' },
      'APROBADO': { label: 'Aprobado', color: 'success' },
      'RECHAZADO': { label: 'Rechazado', color: 'danger' },
      'LISTO_PARA_RETIRAR': { label: 'Listo Retirar', color: 'info' },
      'NO_REPARADO': { label: 'No Reparado', color: 'secondary' },
      'EXPIRADO': { label: 'Expirado', color: 'dark' },
       'ESPERANDO_APROBACION': { label: 'Esp. Aprob.', color: 'warning' }
    };
    const estadoInfo = estados[estado] || { label: estado, color: 'secondary' };
    return <span className={`badge bg-${estadoInfo.color}`}>{estadoInfo.label}</span>;
  };

  const getDispositivoNombre = (diagnostico) => {
    const marca = diagnostico.ingreso?.dispositivo?.modelo?.marca?.marca || '';
    const modelo = diagnostico.ingreso?.dispositivo?.modelo?.nombre_modelo || '';
    return marca || modelo ? `${marca} ${modelo}`.trim() : 'N/A';
  };

  // Contar piezas (incluyendo el campo id_pieza individual y las múltiples)
  const contarPiezas = (diagnostico) => {
    let total = 0;
    if (diagnostico.id_pieza) total++;
    if (diagnostico.piezas && Array.isArray(diagnostico.piezas)) {
      total += diagnostico.piezas.length;
    }
    return total;
  };

  return (
    <div className="reasignaciones-container">
      <div className="reasignaciones-header">
        <h2>
          <i className="fas fa-stethoscope me-2"></i>
          Reasignar Diagnósticos
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
                  {renderOnlineIndicator(tecnico)}
                  <div className="tecnico-carga">
                    <span className={`carga-badge ${tecnico.carga_actual > 5 ? 'alta' : tecnico.carga_actual > 3 ? 'media' : 'baja'}`}>
                      {tecnico.carga_actual} diagnóstico(s) activo(s)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel derecho — Diagnósticos */}
        <div className="diagnosticos-panel">
          <div className="panel-header">
            <h3>
              <i className="fas fa-notes-medical me-2"></i>
              {tecnicoSeleccionado
                ? `Diagnósticos de ${tecnicoSeleccionado.nombre} ${tecnicoSeleccionado.apellido}`
                : 'Seleccione un técnico'}
            </h3>
            {diagnosticosPendientes.length > 0 && (
              <button className="btn-seleccionar-todos" onClick={handleSeleccionarTodos}>
                {diagnosticosSeleccionados.length === diagnosticosPendientes.length
                  ? 'Deseleccionar Todos'
                  : 'Seleccionar Todos'}
              </button>
            )}
          </div>

          {tecnicoSeleccionado && (
            <>
              <div className="diagnosticos-stats">
                <span className="stat-item">
                  <i className="fas fa-stethoscope me-1"></i>
                  Total activos: {diagnosticosPendientes.length}
                </span>
                {diagnosticosSeleccionados.length > 0 && (
                  <>
                    <span className="stat-item selected">
                      <i className="fas fa-check-circle me-1"></i>
                      Seleccionados: {diagnosticosSeleccionados.length}
                    </span>
                    <button className="btn-reasignar" onClick={() => setShowModal(true)}>
                      <i className="fas fa-arrow-right me-1"></i>
                      Reasignar Seleccionados
                    </button>
                  </>
                )}
              </div>

              <div className="diagnosticos-list">
                {loading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando diagnósticos...</p>
                  </div>
                ) : diagnosticosPendientes.length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-check-circle"></i>
                    <p>No hay diagnósticos activos para este técnico</p>
                  </div>
                ) : (
                  <table className="diagnosticos-table">
                    <thead>
                      <tr>
                        <th width="50">
                          <input
                            type="checkbox"
                            checked={diagnosticosSeleccionados.length === diagnosticosPendientes.length}
                            onChange={handleSeleccionarTodos}
                          />
                        </th>
                        <th>ID</th>
                        <th>Dispositivo</th>
                        <th>Estado</th>
                        <th>Piezas</th>
                        <th>Expira</th>
                      </tr>
                    </thead>
                    <tbody>
                      {diagnosticosPendientes.map(diagnostico => (
                        <tr
                          key={diagnostico.id_diagnostico}
                          className={diagnosticosSeleccionados.includes(diagnostico.id_diagnostico) ? 'selected-row' : ''}
                        >
                          <td>
                            <input
                              type="checkbox"
                              checked={diagnosticosSeleccionados.includes(diagnostico.id_diagnostico)}
                              onChange={() => handleToggleDiagnostico(diagnostico.id_diagnostico)}
                            />
                          </td>
                          <td>#{diagnostico.id_diagnostico}</td>
                          <td>{getDispositivoNombre(diagnostico)}</td>
                          <td>{getEstadoBadge(diagnostico.estado)}</td>
                          <td>
                            <span className="badge bg-secondary">
                              {contarPiezas(diagnostico)} pieza(s)
                            </span>
                          </td>
                          <td>
                            {diagnostico.fecha_expiracion && (
                              <span style={{ fontSize: '12px' }}>
                                {new Date(diagnostico.fecha_expiracion).toLocaleDateString()}
                              </span>
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
        cantidadSeleccionados={diagnosticosSeleccionados.length}
      />
    </div>
  );
};

export default ReasignacionDiagnostico;