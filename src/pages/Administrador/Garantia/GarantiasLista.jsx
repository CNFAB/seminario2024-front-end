import React, { useState, useEffect } from 'react';
import { Table, Badge, Spinner, Alert, Form, Row, Col, Button } from 'react-bootstrap';
import { Eye, Search, Filter, X } from 'lucide-react';
import garantiaService from '../../../services/garantiaService';
import GarantiaDetalleAdmin from './GarantiaDetalleAdmin';
import './GarantiasLista.css';

const GarantiasLista = () => {
  const [garantias, setGarantias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtro, setFiltro] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [garantiaId, setGarantiaId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    cargarGarantias();
  }, []);

  const cargarGarantias = async () => {
    setLoading(true);
    try {
      const response = await garantiaService.obtenerTodas();
      setGarantias(response.data?.data || response.data || []);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar las garantías');
    } finally {
      setLoading(false);
    }
  };

  const getEstadoBadge = (estado, fechaFin) => {
    // Verificar si está vencida
    if (estado === 'VENCIDA' || (fechaFin && new Date(fechaFin) < new Date())) {
      return <span className="garantias-badge garantias-badge-danger">Vencida</span>;
    }

    const config = {
      ACTIVA: { class: 'garantias-badge-success', text: 'Activa' },
      RECLAMADA: { class: 'garantias-badge-warning', text: 'Reclamada' },
      ANULADA: { class: 'garantias-badge-secondary', text: 'Anulada' },
    };

    const c = config[estado] || { class: 'garantias-badge-secondary', text: estado };
    return <span className={`garantias-badge ${c.class}`}>{c.text}</span>;
  };

  // Filtrar garantías
  const garantiasFiltradas = garantias.filter((g) => {
    // Filtro por texto
    const matchTexto =
      g.id_reparacion?.toString().includes(filtro) ||
      g.id_garantia?.toString().includes(filtro) ||
      g.reparacion?.diagnostico?.ingreso?.dispositivo?.modelo?.nombre_modelo
        ?.toLowerCase()
        .includes(filtro.toLowerCase()) ||
      g.reparacion?.ingreso?.dispositivo?.modelo?.nombre_modelo
        ?.toLowerCase()
        .includes(filtro.toLowerCase());

    // Filtro por estado
    let matchEstado = true;
    if (filtroEstado !== 'todos') {
      if (filtroEstado === 'VENCIDA') {
        matchEstado = g.estado === 'VENCIDA' || (g.fecha_fin && new Date(g.fecha_fin) < new Date());
      } else {
        matchEstado = g.estado === filtroEstado;
      }
    }

    return matchTexto && matchEstado;
  });

  // Paginación
  const totalPages = Math.ceil(garantiasFiltradas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const garantiasPaginadas = garantiasFiltradas.slice(startIndex, startIndex + itemsPerPage);

  const limpiarFiltros = () => {
    setFiltro('');
    setFiltroEstado('todos');
    setCurrentPage(1);
  };

  // Estadísticas
  const stats = {
    total: garantias.length,
    activas: garantias.filter(
      (g) => g.estado === 'ACTIVA' && (!g.fecha_fin || new Date(g.fecha_fin) >= new Date())
    ).length,
    vencidas: garantias.filter(
      (g) => g.estado === 'VENCIDA' || (g.fecha_fin && new Date(g.fecha_fin) < new Date())
    ).length,
    reclamadas: garantias.filter((g) => g.estado === 'RECLAMADA').length,
  };

  if (loading)
    return (
      <div className="garantias-lista-container">
        <div className="garantias-loading">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Cargando garantías...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="garantias-lista-container">
        <div className="garantias-error">
          <i className="fas fa-exclamation-triangle"></i> {error}
        </div>
      </div>
    );

  return (
    <div className="garantias-lista-container">
      {/* Header */}
      <div className="garantias-header">
        <div>
          <h2 className="garantias-title">
            <i className="fas fa-shield-alt"></i> Lista de Garantías
          </h2>
          <p className="garantias-subtitle">
            Gestión y seguimiento de todas las garantías emitidas
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="garantias-stats">
        <div className="garantias-stat-card">
          <div className="garantias-stat-header">
            <span className="garantias-stat-label">Total</span>
            <div className="garantias-stat-icon">
              <i className="fas fa-chart-line"></i>
            </div>
          </div>
          <div className="garantias-stat-value">{stats.total}</div>
          <div className="garantias-stat-sub">garantías emitidas</div>
        </div>
        <div className="garantias-stat-card">
          <div className="garantias-stat-header">
            <span className="garantias-stat-label">Activas</span>
            <div className="garantias-stat-icon">
              <i className="fas fa-check-circle"></i>
            </div>
          </div>
          <div className="garantias-stat-value">{stats.activas}</div>
          <div className="garantias-stat-sub">vigentes</div>
        </div>
        <div className="garantias-stat-card">
          <div className="garantias-stat-header">
            <span className="garantias-stat-label">Vencidas</span>
            <div className="garantias-stat-icon">
              <i className="fas fa-clock"></i>
            </div>
          </div>
          <div className="garantias-stat-value">{stats.vencidas}</div>
          <div className="garantias-stat-sub">expiradas</div>
        </div>
        <div className="garantias-stat-card">
          <div className="garantias-stat-header">
            <span className="garantias-stat-label">Reclamadas</span>
            <div className="garantias-stat-icon">
              <i className="fas fa-gavel"></i>
            </div>
          </div>
          <div className="garantias-stat-value">{stats.reclamadas}</div>
          <div className="garantias-stat-sub">en proceso</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="garantias-filtros-card">
        <div className="garantias-filtros-row">
          <div className="garantias-filtro-group" style={{ flex: 2 }}>
            <label className="garantias-filtro-label">
              <Search size={12} /> Buscar
            </label>
            <input
              type="text"
              className="garantias-filtro-input"
              placeholder="ID de garantía, reparación, dispositivo..."
              value={filtro}
              onChange={(e) => {
                setFiltro(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="garantias-filtro-group">
            <label className="garantias-filtro-label">
              <Filter size={12} /> Estado
            </label>
            <select
              className="garantias-filtro-select"
              value={filtroEstado}
              onChange={(e) => {
                setFiltroEstado(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="todos">Todos</option>
              <option value="ACTIVA">Activas</option>
              <option value="VENCIDA">Vencidas</option>
              <option value="RECLAMADA">Reclamadas</option>
              <option value="ANULADA">Anuladas</option>
            </select>
          </div>
          <div className="garantias-filtro-group" style={{ flex: 0 }}>
            <label className="garantias-filtro-label">&nbsp;</label>
            <button className="garantias-btn-limpiar" onClick={limpiarFiltros}>
              <X size={14} /> Limpiar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="garantias-table-wrapper">
        <table className="garantias-table">
          <thead>
            <tr>
              <th>ID Garantía</th>
              <th>Reparación</th>
              <th>Dispositivo</th>
              <th>Cliente</th>
              <th>Fecha Inicio</th>
              <th>Fecha Fin</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {garantiasPaginadas.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-5 text-muted">
                  <i className="fas fa-inbox fa-2x mb-2 d-block"></i>
                  No se encontraron garantías
                </td>
              </tr>
            ) : (
              garantiasPaginadas.map((garantia) => {
                // Obtener cliente
                const cliente =
                  garantia.reparacion?.ingreso?.dispositivo?.cliente ||
                  garantia.reparacion?.diagnostico?.ingreso?.dispositivo?.cliente;
                const dispositivo =
                  garantia.reparacion?.ingreso?.dispositivo ||
                  garantia.reparacion?.diagnostico?.ingreso?.dispositivo;
                const nombreDispositivo = dispositivo?.modelo?.nombre_modelo
                  ? `${dispositivo.modelo.marca?.marca || ''} ${dispositivo.modelo.nombre_modelo}`.trim()
                  : 'N/A';

                return (
                  <tr key={garantia.id_garantia}>
                    <td>
                      <strong>#{garantia.id_garantia}</strong>
                    </td>
                    <td>#{garantia.id_reparacion}</td>
                    <td>{nombreDispositivo}</td>
                    <td>
                      {cliente?.nombre} {cliente?.apellido}
                    </td>
                    <td>{new Date(garantia.fecha_inicio).toLocaleDateString()}</td>
                    <td>{new Date(garantia.fecha_fin).toLocaleDateString()}</td>
                    <td>{getEstadoBadge(garantia.estado, garantia.fecha_fin)}</td>
                    <td>
                      <button
                        className="garantias-btn-action garantias-btn-view"
                        onClick={() => {
                          setGarantiaId(garantia.id_garantia);
                          setShowAdminModal(true);
                        }}
                      >
                        <Eye size={14} /> Ver
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="garantias-pagination">
          <button
            className="garantias-pagination-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            <i className="fas fa-chevron-left"></i> Anterior
          </button>
          <span className="px-3">
            Página {currentPage} de {totalPages}
          </span>
          <button
            className="garantias-pagination-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Siguiente <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}

      {/* Modal de detalle */}
      <GarantiaDetalleAdmin
        show={showAdminModal}
        onHide={() => setShowAdminModal(false)}
        idGarantia={garantiaId}
        onActualizado={cargarGarantias}
      />
    </div>
  );
};

export default GarantiasLista;
