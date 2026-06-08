import React, { useEffect, useState, useMemo } from 'react';
import { inventarioService } from '../../../services/InventarioService';
import { estadisticaService } from '../../../services/estadisticaService';
import { FormularioPieza } from './FormularioPiezas';
import { Spinner } from 'react-bootstrap';
import './Inventario.css';

const STOCK_BAJO = 5;

const Inventario = () => {
  const [piezas, setPiezas] = useState([]);
  const [filteredPiezas, setFilteredPiezas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroStock, setFiltroStock] = useState('todos');
  const [categorias, setCategorias] = useState([]);

  // ✅ Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1);
  const [itemsPorPagina, setItemsPorPagina] = useState(15);

  const [estadisticas, setEstadisticas] = useState({
    totalPiezas: 0,
    stockBajo: 0,
    valorTotal: 0,
    categorias: 0,
  });

  // ── Carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    fetchPiezas();
    fetchCategorias();
    fetchEstadisticas();
  }, []);

  useEffect(() => {
    aplicarFiltros();
  }, [piezas, searchTerm, filtroCategoria, filtroStock]);

  // ✅ Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setPaginaActual(1);
  }, [searchTerm, filtroCategoria, filtroStock]);

  const fetchPiezas = async () => {
    setLoading(true);
    try {
      const data = await inventarioService.obtenerTodas();
      setPiezas(data);
      setFilteredPiezas(data);
    } catch (error) {
      console.error('Error al cargar piezas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategorias = async () => {
    try {
      const data = await inventarioService.obtenerCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      const response = await estadisticaService.obtenerInventarioCompleto();
      setEstadisticas({
        totalPiezas: response.total_piezas || 0,
        stockBajo: response.stock_bajo || 0,
        valorTotal: response.valor_total || 0,
        categorias: response.categorias || 0,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const aplicarFiltros = () => {
    let filtrados = [...piezas];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtrados = filtrados.filter((p) => {
        const nombre = p.nombre_pieza?.toLowerCase() || '';
        const categoria =
          typeof p.categoria === 'object'
            ? p.categoria?.categoria?.toLowerCase() || ''
            : p.categoria?.toLowerCase() || '';
        return nombre.includes(term) || categoria.includes(term);
      });
    }

    if (filtroCategoria !== 'todos') {
      filtrados = filtrados.filter((p) => {
        const idCat = typeof p.categoria === 'object' ? p.categoria?.id_categoria : p.id_categoria;
        return idCat === parseInt(filtroCategoria);
      });
    }

    if (filtroStock === 'bajo') filtrados = filtrados.filter((p) => p.stock > 0 && p.stock <= 5);
    if (filtroStock === 'agotado') filtrados = filtrados.filter((p) => p.stock === 0);
    if (filtroStock === 'disponible') filtrados = filtrados.filter((p) => p.stock > 5);

    setFilteredPiezas(filtrados);
  };

  // ✅ Lógica de paginación
  const totalPaginas = Math.ceil(filteredPiezas.length / itemsPorPagina);
  const inicio = (paginaActual - 1) * itemsPorPagina;
  const fin = inicio + itemsPorPagina;
  const piezasPagina = filteredPiezas.slice(inicio, fin);

  const handleShow = (pieza = null) => {
    setEditing(pieza ? pieza.id_pieza : null);
    setShowModal(true);
  };
  const handleClose = () => {
    setShowModal(false);
    setEditing(null);
  };

  const handleSave = async (formData) => {
    try {
      if (editing) {
        await inventarioService.actualizar(editing, formData);
        alert('✅ Pieza actualizada correctamente');
      } else {
        await inventarioService.crear(formData);
        alert('✅ Pieza creada correctamente');
      }
      await fetchPiezas();
      await fetchEstadisticas();
      handleClose();
    } catch (error) {
      console.error('Error guardando pieza:', error);
      const msg =
        error.response?.data?.message || error.response?.data?.error || 'Error al guardar';
      alert(`❌ ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar esta pieza?')) return;
    try {
      await inventarioService.eliminar(id);
      await fetchPiezas();
      await fetchEstadisticas();
      alert('✅ Pieza eliminada correctamente');
    } catch (error) {
      console.error('Error eliminando pieza:', error);
      alert('Error al eliminar la pieza');
    }
  };

  const getStockBadge = (stock) => {
    if (stock === 0) return <span className="inv-badge-stock agotado">Agotado</span>;
    if (stock <= 5) return <span className="inv-badge-stock bajo">Stock Bajo</span>;
    return <span className="inv-badge-stock disponible">Disponible</span>;
  };

  const limpiarFiltros = () => {
    setSearchTerm('');
    setFiltroCategoria('todos');
    setFiltroStock('todos');
  };

  // ── Alertas calculadas desde piezas ──────────────────────────────────────
  const alertas = useMemo(
    () => ({
      sinStock: piezas.filter((p) => (p.stock ?? 0) === 0),
      stockBajo: piezas.filter((p) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= STOCK_BAJO),
    }),
    [piezas]
  );

  return (
    <div className="inv-wrap">
      {/* Header */}
      <div className="inv-header">
        <h2>
          <i className="fas fa-boxes"></i>
          Gestión de Inventario
        </h2>
        <button className="inv-btn-agregar" onClick={() => handleShow()}>
          <i className="fas fa-plus"></i>
          Agregar Pieza
        </button>
      </div>

      {/* KPIs */}
      <div className="inv-kpi-grid">
        <div className="inv-kpi-card">
          <div className="inv-kpi-icon azul">
            <i className="fas fa-boxes"></i>
          </div>
          <div>
            <div className="inv-kpi-valor">{estadisticas.totalPiezas}</div>
            <div className="inv-kpi-label">Total de Piezas</div>
          </div>
        </div>
        <div className="inv-kpi-card">
          <div className="inv-kpi-icon amarillo">
            <i className="fas fa-exclamation-circle"></i>
          </div>
          <div>
            <div className="inv-kpi-valor">{estadisticas.stockBajo}</div>
            <div className="inv-kpi-label">Stock Bajo</div>
          </div>
        </div>
        <div className="inv-kpi-card">
          <div className="inv-kpi-icon verde">
            <i className="fas fa-dollar-sign"></i>
          </div>
          <div>
            <div className="inv-kpi-valor">
              ${Number(estadisticas.valorTotal).toLocaleString('es-AR')}
            </div>
            <div className="inv-kpi-label">Valor Total</div>
          </div>
        </div>
        <div className="inv-kpi-card">
          <div className="inv-kpi-icon cyan">
            <i className="fas fa-layer-group"></i>
          </div>
          <div>
            <div className="inv-kpi-valor">{estadisticas.categorias}</div>
            <div className="inv-kpi-label">Categorías</div>
          </div>
        </div>
      </div>

      {/* Alertas de stock — solo se muestran si hay problema */}
      {(alertas.sinStock.length > 0 || alertas.stockBajo.length > 0) && (
        <div className="inv-alertas">
          {alertas.sinStock.length > 0 && (
            <div className="inv-banner inv-banner-rojo">
              <div className="inv-banner-icon rojo">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="inv-banner-texto">
                <div className="inv-banner-label">Sin stock</div>
                <div className="inv-banner-detalle">
                  {alertas.sinStock
                    .slice(0, 4)
                    .map((p) => p.nombre_pieza)
                    .join(' · ')}
                  {alertas.sinStock.length > 4 && ` · +${alertas.sinStock.length - 4} más`}
                </div>
              </div>
              <span className="inv-banner-badge rojo">
                {alertas.sinStock.length} pieza{alertas.sinStock.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {alertas.stockBajo.length > 0 && (
            <div className="inv-banner inv-banner-amarillo">
              <div className="inv-banner-icon amarillo">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <div className="inv-banner-texto">
                <div className="inv-banner-label">Stock bajo (≤{STOCK_BAJO} unidades)</div>
                <div className="inv-banner-detalle">
                  {alertas.stockBajo
                    .slice(0, 4)
                    .map((p) => p.nombre_pieza)
                    .join(' · ')}
                  {alertas.stockBajo.length > 4 && ` · +${alertas.stockBajo.length - 4} más`}
                </div>
              </div>
              <span className="inv-banner-badge amarillo">
                {alertas.stockBajo.length} pieza{alertas.stockBajo.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="inv-filtros-card">
        <div className="inv-filtros-row">
          <div className="inv-input-group" style={{ flex: 2 }}>
            <span className="inv-input-icon">
              <i className="fas fa-search"></i>
            </span>
            <input
              className="inv-input"
              type="text"
              placeholder="Buscar por nombre de pieza..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="inv-input-group">
            <span className="inv-input-icon">
              <i className="fas fa-filter"></i>
            </span>
            <select
              className="inv-select"
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
            >
              <option value="todos">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.categoria}
                </option>
              ))}
            </select>
          </div>

          <div className="inv-input-group">
            <span className="inv-input-icon">
              <i className="fas fa-archive"></i>
            </span>
            <select
              className="inv-select"
              value={filtroStock}
              onChange={(e) => setFiltroStock(e.target.value)}
            >
              <option value="todos">Todos los stocks</option>
              <option value="disponible">Disponible</option>
              <option value="bajo">Stock bajo (≤5)</option>
              <option value="agotado">Agotado</option>
            </select>
          </div>

          <button className="inv-btn-limpiar" onClick={limpiarFiltros}>
            <i className="fas fa-times me-1"></i>Limpiar
          </button>
        </div>
      </div>

      {/* Tabla */}
      {/* Tabla */}
      <div className="inv-tabla-card">
        {loading ? (
          <div className="inv-loading">
            <Spinner animation="border" size="sm" style={{ color: '#6366f1' }} />
            <span>Cargando inventario...</span>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="inv-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Pieza</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {piezasPagina.length > 0 ? (
                    piezasPagina.map((p, index) => (
                      <tr key={p.id_pieza}>
                        <td className="col-num">
                          {(paginaActual - 1) * itemsPorPagina + index + 1}
                        </td>
                        <td className="col-nombre">{p.nombre_pieza}</td>
                        <td>
                          <span className="inv-badge-cat">
                            {p.categoria?.categoria || p.categoria || 'Sin categoría'}
                          </span>
                        </td>
                        <td className="col-precio">
                          ${parseFloat(p.precio || 0).toLocaleString('es-AR')}
                        </td>
                        <td className="col-stock">{p.stock}</td>
                        <td>{getStockBadge(p.stock)}</td>
                        <td>
                          <div className="inv-acciones">
                            <button
                              className="inv-btn-accion editar"
                              onClick={() => handleShow(p)}
                              title="Editar"
                            >
                              <i className="fas fa-pen"></i>
                            </button>
                            <button
                              className="inv-btn-accion eliminar"
                              onClick={() => handleDelete(p.id_pieza)}
                              title="Eliminar"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7">
                        <div className="inv-vacio">
                          <i className="fas fa-box-open"></i>
                          No se encontraron piezas
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/*  Paginación */}
            {totalPaginas > 1 && (
              <div className="inv-pagination">
                <div className="inv-pagination-info">
                  Mostrando {inicio + 1} - {Math.min(fin, filteredPiezas.length)} de{' '}
                  {filteredPiezas.length} piezas
                </div>
                <div className="inv-pagination-controls">
                  <button
                    className="inv-pagination-btn"
                    onClick={() => setPaginaActual(1)}
                    disabled={paginaActual === 1}
                  >
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                  <button
                    className="inv-pagination-btn"
                    onClick={() => setPaginaActual(paginaActual - 1)}
                    disabled={paginaActual === 1}
                  >
                    <i className="fas fa-angle-left"></i>
                  </button>

                  <span className="inv-pagination-current">
                    Página {paginaActual} de {totalPaginas}
                  </span>

                  <button
                    className="inv-pagination-btn"
                    onClick={() => setPaginaActual(paginaActual + 1)}
                    disabled={paginaActual === totalPaginas}
                  >
                    <i className="fas fa-angle-right"></i>
                  </button>
                  <button
                    className="inv-pagination-btn"
                    onClick={() => setPaginaActual(totalPaginas)}
                    disabled={paginaActual === totalPaginas}
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </div>

                <div className="inv-pagination-rows">
                  <span>Mostrar</span>
                  <select
                    value={itemsPorPagina}
                    onChange={(e) => {
                      setItemsPorPagina(Number(e.target.value));
                      setPaginaActual(1);
                    }}
                    className="inv-pagination-select"
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

            <div className="inv-tabla-footer">
              {filteredPiezas.length} piezas
              {filteredPiezas.length !== piezas.length && ` (filtradas de ${piezas.length})`}
            </div>
          </>
        )}
      </div>

      {/* Modal Formulario */}
      <FormularioPieza
        show={showModal}
        onHide={handleClose}
        onSave={handleSave}
        editing={!!editing}
        initialData={editing ? piezas.find((p) => p.id_pieza === editing) : null}
        categorias={categorias}
      />
    </div>
  );
};

export default Inventario;
