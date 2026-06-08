import React, { useEffect, useState, useMemo } from 'react';
import { Spinner } from 'react-bootstrap';
import { usuarioService } from '../../../services/UsuarioService';
import { FormularioPersonal } from './FormularioPersonal';
import styles from './Personal.module.css';

// ── Helpers ───────────────────────────────────────────────────────────────────
const iniciales = (nombre, apellido) => {
  const n = (nombre?.[0] ?? '').toUpperCase();
  const a = (apellido?.[0] ?? '').toUpperCase();
  return n + a || '?';
};

const avatarClase = (p) => {
  if (p.es_administrador) return styles.avatarAdmin;
  if (p.es_tecnico) return styles.avatarTecnico;
  if (p.es_recepcionista) return styles.avatarRecep;
  return styles.avatarDefault;
};

const Personal = () => {
  const [personal, setPersonal] = useState([]);
  const [filteredPersonal, setFilteredPersonal] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // ── Carga ────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchPersonal();
  }, []);
  useEffect(() => {
    aplicarFiltros();
  }, [personal, searchTerm, filtroTipo, filtroEstado]);

  const fetchPersonal = async () => {
    setLoading(true);
    try {
      const data = await usuarioService.obtenerTodos();
      console.log('usuarios', data);
      const lista = Array.isArray(data) ? data : (data?.data ?? []);

      const listaNormalizada = lista.map((p) => ({
        ...p,
        activo: p.activo === 1 || p.activo === true || p.activo === '1',
      }));

      setPersonal(listaNormalizada);
      setFilteredPersonal(listaNormalizada);
    } catch (error) {
      console.error('Error al cargar personal:', error);
    } finally {
      setLoading(false);
    }
  };
  const aplicarFiltros = () => {
    let f = [...personal];
    if (searchTerm) {
      const t = searchTerm.toLowerCase();
      f = f.filter(
        (p) =>
          p.nombre?.toLowerCase().includes(t) ||
          p.apellido?.toLowerCase().includes(t) ||
          p.correo?.toLowerCase().includes(t) ||
          p.numero_celular?.includes(t)
      );
    }
    if (filtroTipo !== 'todos') {
      f = f.filter((p) => {
        if (filtroTipo === 'tecnico') return p.es_tecnico;
        if (filtroTipo === 'recepcion') return p.es_recepcionista;
        if (filtroTipo === 'admin') return p.es_administrador;
        return true;
      });
    }
    if (filtroEstado !== 'todos') {
      const activo = filtroEstado === 'activo';
      f = f.filter((p) => Boolean(p.activo) === activo);
    }
    setFilteredPersonal(f);
  };

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const kpis = useMemo(
    () => ({
      total: personal.length,
      tecnicos: personal.filter((p) => p.es_tecnico).length,
      receps: personal.filter((p) => p.es_recepcionista).length,
      admins: personal.filter((p) => p.es_administrador).length,
    }),
    [personal]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleShow = (p = null) => {
    setEditing(p ? p.id_usuario : null);
    setShowModal(true);
  };
  const handleClose = () => {
    setShowModal(false);
    setEditing(null);
  };

  // Personal.jsx
  const handleSave = async (formData) => {
    try {
      if (editing) {
        await usuarioService.actualizar(editing, formData);
      } else {
        await usuarioService.crear(formData);
      }
      await fetchPersonal();
      handleClose(); // ✅ Solo cerrar si fue exitoso
    } catch (error) {
      console.error('Error guardando personal:', error);
      // ✅ IMPORTANTE: Re-lanzar el error para que FormularioPersonal lo capture
      throw error;
    }
  };
  const handleToggleActivo = async (id, activoActual) => {
    try {
      await usuarioService.toggleActivo(id); // ✅ Usa el nuevo método
      await fetchPersonal();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert('Error al cambiar el estado del usuario');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este registro?')) return;
    try {
      await usuarioService.eliminar(id);
      await fetchPersonal();
    } catch (error) {
      console.error('Error eliminando personal:', error);
      alert('Error al eliminar el registro');
    }
  };

  const limpiar = () => {
    setSearchTerm('');
    setFiltroTipo('todos');
    setFiltroEstado('todos');
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.personalContainer}>
      {/* Header */}
      <div className={styles.personalHeader}>
        <h2>
          <i className="fas fa-users"></i>
          Gestión de Personal
        </h2>
        <button className={styles.btnPrimary} onClick={() => handleShow()}>
          <i className="fas fa-user-plus"></i>
          Agregar Personal
        </button>
      </div>

      {/* KPIs */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconTotal}`}>
            <i className="fas fa-users"></i>
          </div>
          <div>
            <div className={styles.kpiValor}>{kpis.total}</div>
            <div className={styles.kpiLabel}>Total personal</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconTecnico}`}>
            <i className="fas fa-tools"></i>
          </div>
          <div>
            <div className={styles.kpiValor}>{kpis.tecnicos}</div>
            <div className={styles.kpiLabel}>Técnicos</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconRecep}`}>
            <i className="fas fa-headset"></i>
          </div>
          <div>
            <div className={styles.kpiValor}>{kpis.receps}</div>
            <div className={styles.kpiLabel}>Recepcionistas</div>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.kpiIconAdmin}`}>
            <i className="fas fa-user-shield"></i>
          </div>
          <div>
            <div className={styles.kpiValor}>{kpis.admins}</div>
            <div className={styles.kpiLabel}>Administradores</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className={styles.filtrosCard}>
        <div className={styles.filtrosRow}>
          <div className={styles.inputGroup} style={{ flex: 2 }}>
            <span className={styles.inputIcon}>
              <i className="fas fa-search"></i>
            </span>
            <input
              className={styles.input}
              type="text"
              placeholder="Buscar por nombre, correo o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <i className="fas fa-filter"></i>
            </span>
            <select
              className={styles.select}
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
            >
              <option value="todos">Todos los roles</option>
              <option value="tecnico">Técnicos</option>
              <option value="recepcion">Recepcionistas</option>
              <option value="admin">Administradores</option>
            </select>
          </div>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <i className="fas fa-circle"></i>
            </span>
            <select
              className={styles.select}
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>
          <button className={styles.btnLimpiar} onClick={limpiar}>
            <i className="fas fa-times" style={{ marginRight: 4 }}></i>Limpiar
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className={styles.tablaCard}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Cargando personal...</span>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Empleado</th>
                  <th>Teléfono</th>
                  <th>Rol(es)</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPersonal.length > 0 ? (
                  filteredPersonal.map((p, i) => (
                    <tr key={p.id_usuario}>
                      <td style={{ color: '#94a3b8', fontSize: 12 }}>{i + 1}</td>

                      {/* Empleado con avatar */}
                      <td>
                        <div className={styles.avatarWrap}>
                          <div className={`${styles.avatar} ${avatarClase(p)}`}>
                            {iniciales(p.nombre, p.apellido)}
                          </div>
                          <div>
                            <div className={styles.nombre}>
                              {p.nombre} {p.apellido}
                            </div>
                            <div className={styles.correoSmall}>{p.correo}</div>
                          </div>
                        </div>
                      </td>

                      {/* Teléfono */}
                      <td style={{ fontSize: 13, color: '#64748b' }}>{p.numero_celular ?? '—'}</td>

                      {/* Roles */}
                      <td>
                        <div className={styles.roles}>
                          {p.es_administrador && (
                            <span className={`${styles.rolBadge} ${styles.rolBadgeAdmin}`}>
                              <i className="fas fa-user-shield"></i> Admin
                            </span>
                          )}
                          {p.es_tecnico && (
                            <span className={`${styles.rolBadge} ${styles.rolBadgeTecnico}`}>
                              <i className="fas fa-tools"></i> Técnico
                            </span>
                          )}
                          {p.es_recepcionista && (
                            <span className={`${styles.rolBadge} ${styles.rolBadgeRecep}`}>
                              <i className="fas fa-headset"></i> Recepción
                            </span>
                          )}
                          {!p.es_administrador && !p.es_tecnico && !p.es_recepcionista && (
                            <span className={`${styles.rolBadge} ${styles.rolBadgeSin}`}>
                              Sin rol
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Estado */}
                      <td>
                        <span
                          className={`${styles.estado} ${p.activo ? styles.estadoActivo : styles.estadoInactivo}`}
                        >
                          <span
                            className={`${styles.estadoDot} ${p.activo ? styles.estadoDotActivo : styles.estadoDotInactivo}`}
                          ></span>
                          {p.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>

                      {/* Acciones */}
                      <td>
                        <div className={styles.acciones}>
                          <button
                            className={`${styles.btnAccion} ${styles.btnAccionEditar}`}
                            onClick={() => handleShow(p)}
                            title="Editar"
                          >
                            <i className="fas fa-pen"></i>
                          </button>
                          <button
                            className={`${styles.btnAccion} ${p.activo ? styles.btnAccionDesactivar : styles.btnAccionActivar}`}
                            onClick={() => handleToggleActivo(p.id_usuario, p.activo)}
                            title={p.activo ? 'Desactivar' : 'Activar'}
                          >
                            <i
                              className={`fas ${p.activo ? 'fa-user-slash' : 'fa-user-check'}`}
                            ></i>
                          </button>
                          <button
                            className={`${styles.btnAccion} ${styles.btnAccionEliminar}`}
                            onClick={() => handleDelete(p.id_usuario)}
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
                    <td colSpan="6">
                      <div className={styles.vacio}>
                        <i className="fas fa-users"></i>
                        {searchTerm || filtroTipo !== 'todos' || filtroEstado !== 'todos'
                          ? 'No se encontraron resultados con ese filtro'
                          : 'No hay personal registrado'}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className={styles.tablaFooter}>
          {filteredPersonal.length} registro{filteredPersonal.length !== 1 ? 's' : ''}
          {filteredPersonal.length !== personal.length && ` (filtrados de ${personal.length})`}
        </div>
      </div>

      {/* Modal Formulario */}
      <FormularioPersonal
        show={showModal}
        onHide={handleClose}
        onSave={handleSave}
        editing={!!editing}
        initialData={editing ? personal.find((p) => p.id_usuario === editing) : null}
      />
    </div>
  );
};

export default Personal;
