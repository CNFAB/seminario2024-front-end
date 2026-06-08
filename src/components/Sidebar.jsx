// src/components/Sidebar.jsx
import React, { useState } from 'react';
import './Sidebar.css';

const Sidebar = ({ seccionActiva, setSeccionActiva }) => {
  const [catalogoAbierto, setCatalogoAbierto] = useState(false);
  const [controlTecnicoAbierto, setControlTecnicoAbierto] = useState(false);
  const [reportesAbierto, setReportesAbierto] = useState(false);
  const [garantiasAbierto, setGarantiasAbierto] = useState(false);
  const [usuariosAbierto, setUsuariosAbierto] = useState(false);

  // NUEVOS estados para REPORTES por roles
  const [reportesRecepcionAbierto, setReportesRecepcionAbierto] = useState(false);
  const [reportesTecnicoAbierto, setReportesTecnicoAbierto] = useState(false);
  const [reportesInventarioAbierto, setReportesInventarioAbierto] = useState(false);

  const handleSubmenuClick = (key) => {
    setSeccionActiva(key);
  };

  return (
    <div className="sidebar-modern">
      {/* ── BRAND ── */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <i className="fas fa-tools"></i>
        </div>
        <div className="brand-title">Panel Admin</div>
      </div>

      <nav className="sidebar-nav">
        {/* ================= GENERAL ================= */}
        <div className="sidebar-section-label">GENERAL</div>
        <button
          className={`sidebar-item ${seccionActiva === 'dashboard' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('dashboard')}
        >
          <i className="fas fa-chart-line"></i>
          Dashboard
        </button>

        {/* ================= USUARIOS ================= */}
        <div className="sidebar-section-label">USUARIOS</div>
        <div>
          <button
            className={`sidebar-item ${usuariosAbierto ? 'active' : ''}`}
            onClick={() => setUsuariosAbierto(!usuariosAbierto)}
          >
            <i className="fas fa-users"></i>
            Usuarios
            <i
              className={`fas fa-chevron-${usuariosAbierto ? 'down' : 'right'}`}
              style={{ marginLeft: 'auto' }}
            ></i>
          </button>

          {usuariosAbierto && (
            <div className="sidebar-submenu">
              <button
                className={`sidebar-subitem ${seccionActiva === 'personal' ? 'active' : ''}`}
                onClick={() => handleSubmenuClick('personal')}
              >
                <i className="fas fa-user-tie"></i> Personal
              </button>
            </div>
          )}
        </div>

        {/* ================= GESTIÓN ================= */}
        <div className="sidebar-section-label">GESTIÓN DE TALLER</div>

        <button
          className={`sidebar-item ${seccionActiva === 'dispositivos' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('dispositivos')}
        >
          <i className="fas fa-mobile-alt"></i> Dispositivos
        </button>

        <button
          className={`sidebar-item ${seccionActiva === 'inventario' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('inventario')}
        >
          <i className="fas fa-boxes"></i> Inventario
        </button>

        {/* ================= CONTROL TÉCNICO ================= */}
        <div className="sidebar-section-label">CONTROL TÉCNICO</div>
        <div>
          <button
            className={`sidebar-item ${controlTecnicoAbierto ? 'active' : ''}`}
            onClick={() => setControlTecnicoAbierto(!controlTecnicoAbierto)}
          >
            <i className="fas fa-user-cog"></i>
            Control Técnico
            <i
              className={`fas fa-chevron-${controlTecnicoAbierto ? 'down' : 'right'}`}
              style={{ marginLeft: 'auto' }}
            ></i>
          </button>

          {controlTecnicoAbierto && (
            <div className="sidebar-submenu">
              <button
                className={`sidebar-subitem ${seccionActiva === 'reasignacionDiagnostico' ? 'active' : ''}`}
                onClick={() => handleSubmenuClick('reasignacionDiagnostico')}
              >
                <i className="fas fa-exchange-alt"></i> Reasignar Diagnósticos
              </button>
              <button
                className={`sidebar-subitem ${seccionActiva === 'reasignacionReparacion' ? 'active' : ''}`}
                onClick={() => handleSubmenuClick('reasignacionReparacion')}
              >
                <i className="fas fa-wrench"></i> Reasignar Reparaciones
              </button>
            </div>
          )}
        </div>

        {/* ================= REPORTES ================= */}
        <div className="sidebar-section-label">REPORTES</div>
        <div>
          <button
            className={`sidebar-item ${reportesAbierto ? 'active' : ''}`}
            onClick={() => setReportesAbierto(!reportesAbierto)}
          >
            <i className="fas fa-chart-bar"></i>
            Reportes
            <i
              className={`fas fa-chevron-${reportesAbierto ? 'down' : 'right'}`}
              style={{ marginLeft: 'auto' }}
            ></i>
          </button>

          {reportesAbierto && (
            <div className="sidebar-submenu">
              {/* estadisticas-Globales */}
              <button
                className={`sidebar-subitem estadisticas-globales ${seccionActiva === 'estadisticasGlobales' ? 'active' : ''}`}
                onClick={() => handleSubmenuClick('estadisticasGlobales')}
              >
                <i className="fas fa-chart-pie"></i> Estadísticas Globales
              </button>
              {/* RECEPCIÓN */}
              <button
                className={`sidebar-item ${seccionActiva === 'reportesRecepcion' ? 'active' : ''}`}
                onClick={() => handleSubmenuClick('reportesRecepcion')}
              >
                <i className="fas fa-headset"></i> Recepcionistas
              </button>

              {/* TÉCNICO */}
              <button
                className="sidebar-item"
                onClick={() => setReportesTecnicoAbierto(!reportesTecnicoAbierto)}
              >
                <i className="fas fa-user-cog"></i> Técnico
                <i
                  className={`fas fa-chevron-${reportesTecnicoAbierto ? 'down' : 'right'}`}
                  style={{ marginLeft: 'auto' }}
                ></i>
              </button>

              {reportesTecnicoAbierto && (
                <div className="sidebar-submenu nested">
                  <button
                    className={`sidebar-subitem ${seccionActiva === 'reportesDiagnosticos' ? 'active' : ''}`}
                    onClick={() => handleSubmenuClick('reportesDiagnosticos')}
                  >
                    <i className="fas fa-stethoscope"></i> Diagnósticos
                  </button>
                  <button
                    className={`sidebar-subitem ${seccionActiva === 'reportesReparaciones' ? 'active' : ''}`}
                    onClick={() => handleSubmenuClick('reportesReparaciones')}
                  >
                    <i className="fas fa-wrench"></i> Reparaciones
                  </button>
                </div>
              )}

              {/* INVENTARIO */}
              <button
                className="sidebar-subitem"
                onClick={() => setReportesInventarioAbierto(!reportesInventarioAbierto)}
              >
                <i className="fas fa-boxes"></i> Inventario
                <i
                  className={`fas fa-chevron-${reportesInventarioAbierto ? 'down' : 'right'}`}
                  style={{ marginLeft: 'auto' }}
                ></i>
              </button>

              {reportesInventarioAbierto && (
                <div className="sidebar-submenu nested">
                  <button
                    className={`sidebar-subitem ${seccionActiva === 'reportes-piezas' ? 'active' : ''}`}
                    onClick={() => handleSubmenuClick('reportes-piezas')}
                  >
                    <i className="fas fa-microchip"></i> Piezas
                  </button>
                </div>
              )}
              {/*  GANANCIAS GENERALES - DENTRO DEL MENÚ */}
              <button
                className={`sidebar-subitem ${seccionActiva === 'gananciasGenerales' ? 'active' : ''}`}
                onClick={() => handleSubmenuClick('gananciasGenerales')}
              >
                <i className="fas fa-chart-line"></i> Ganancias Generales
              </button>
            </div>
          )}
        </div>

        {/* ================= TESTIMONIOS ================= */}
        <div className="sidebar-section-label">TESTIMONIOS</div>
        <button
          className={`sidebar-item ${seccionActiva === 'testimoniosAdmin' ? 'active' : ''}`}
          onClick={() => setSeccionActiva('testimoniosAdmin')}
        >
          <i className="fas fa-star"></i>
          Moderar Testimonios
        </button>

        {/* ================= GARANTÍAS ================= */}
        <div className="sidebar-section-label">GARANTÍAS</div>
        <div>
          <button
            className={`sidebar-item ${garantiasAbierto ? 'active' : ''}`}
            onClick={() => setGarantiasAbierto(!garantiasAbierto)}
          >
            <i className="fas fa-shield-alt"></i>
            Garantías
            <i
              className={`fas fa-chevron-${garantiasAbierto ? 'down' : 'right'}`}
              style={{ marginLeft: 'auto' }}
            ></i>
          </button>

          {garantiasAbierto && (
            <div className="sidebar-submenu">
              <button
                className={`sidebar-subitem ${seccionActiva === 'garantias-lista' ? 'active' : ''}`}
                onClick={() => handleSubmenuClick('garantias-lista')}
              >
                <i className="fas fa-list"></i> Lista de Garantías
              </button>
              <button
                className={`sidebar-subitem ${seccionActiva === 'reclamos-lista' ? 'active' : ''}`}
                onClick={() => handleSubmenuClick('reclamos-lista')}
              >
                <i className="fas fa-clipboard-list"></i> Reclamos
              </button>
              <button
                className={`sidebar-subitem ${seccionActiva === 'garantias-estadisticas' ? 'active' : ''}`}
                onClick={() => handleSubmenuClick('garantias-estadisticas')}
              >
                <i className="fas fa-chart-pie"></i> Estadísticas
              </button>
              <button
                className={`sidebar-subitem ${seccionActiva === 'control-calidad' ? 'active' : ''}`}
                onClick={() => handleSubmenuClick('control-calidad')}
              >
                <i className="fas fa-chart-line"></i> Ctrl. Calidad
              </button>
            </div>
          )}
        </div>

        {/* ================= CATÁLOGO ================= */}
        <div className="sidebar-section-label">CATÁLOGO BASE</div>
        <div>
          <button
            className={`sidebar-item ${catalogoAbierto ? 'active' : ''}`}
            onClick={() => setCatalogoAbierto(!catalogoAbierto)}
          >
            <i className="fas fa-book"></i>
            Catálogo
            <i
              className={`fas fa-chevron-${catalogoAbierto ? 'down' : 'right'}`}
              style={{ marginLeft: 'auto' }}
            ></i>
          </button>

          {catalogoAbierto && (
            <div className="sidebar-submenu">
              <button
                className={`sidebar-subitem ${seccionActiva === 'categoria' ? 'active' : ''}`}
                onClick={() => handleSubmenuClick('categoria')}
              >
                <i className="fas fa-tags"></i> Categorías
              </button>
              <button
                className={`sidebar-subitem ${seccionActiva === 'marcas' ? 'active' : ''}`}
                onClick={() => handleSubmenuClick('marcas')}
              >
                <i className="fas fa-trademark"></i> Marcas
              </button>
              <button
                className={`sidebar-subitem ${seccionActiva === 'modelos' ? 'active' : ''}`}
                onClick={() => handleSubmenuClick('modelos')}
              >
                <i className="fas fa-microchip"></i> Modelos
              </button>
              <button
                className={`sidebar-subitem ${seccionActiva === 'compatibilidad' ? 'active' : ''}`}
                onClick={() => handleSubmenuClick('compatibilidad')}
              >
                <i className="fas fa-link"></i> Compatibilidad
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* FOOTER */}
      <div className="sidebar-footer">
        <div className="sidebar-footer-user">
          <div className="sidebar-footer-avatar">A</div>
          <div>
            <div className="sidebar-footer-name">Administrador</div>
            <div className="sidebar-footer-role">Sistema de reparaciones</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
