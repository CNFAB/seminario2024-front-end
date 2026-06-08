import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { ShieldCheck, User, ArrowLeft, Info, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clienteService } from '../../services/clienteService';
import '../../style/themes.css';
import './PerfilCliente.css';

// ─── helpers ────────────────────────────────────────────────────────────────
const getInitials = (nombre = '', apellido = '') =>
  `${nombre[0] || ''}${apellido[0] || ''}`.toUpperCase();

const measureStrength = (val) => {
  let score = 0;
  if (val.length >= 8)          score++;
  if (/[A-Z]/.test(val))        score++;
  if (/[0-9]/.test(val))        score++;
  if (/[^a-zA-Z0-9]/.test(val)) score++;
  return [
    { w: '0%',   c: '#E24B4A', t: ''           },
    { w: '25%',  c: '#E24B4A', t: 'Muy débil'  },
    { w: '50%',  c: '#EF9F27', t: 'Regular'    },
    { w: '75%',  c: '#639922', t: 'Buena'      },
    { w: '100%', c: '#1D9E75', t: 'Muy segura' },
  ][score];
};

// ════════════════════════════════════════════════════════════════════════════
const PerfilCliente = () => {
  const navigate = useNavigate();

  const [cliente,  setCliente]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [tab,      setTab]      = useState('info');
  const [toast,    setToast]    = useState({ show: false, msg: '', type: 'ok' });

  // form — info
  const [nombre,    setNombre]    = useState('');
  const [apellido,  setApellido]  = useState('');
  const [correo,    setCorreo]    = useState('');
  const [telefono,  setTelefono]  = useState('');
  const [infoErr,   setInfoErr]   = useState({});

  // form — seguridad
  const [passActual,  setPassActual]  = useState('');
  const [passNueva,   setPassNueva]   = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [strength,    setStrength]    = useState({ w: '0%', c: '#E24B4A', t: '' });
  const [passErr,     setPassErr]     = useState({});

  // ── carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) { navigate('/cliente/login'); return; }

    const cargarDatos = async () => {
      const res = await clienteService.obtenerPerfil();
      if (res.success) {
        const data = res.data?.data || res.data;
        setCliente(data);
        setNombre(data.nombre       || '');
        setApellido(data.apellido   || '');
        setCorreo(data.correo       || '');
        setTelefono(data.numero_celular   || '');
      } else {
        // fallback desde localStorage si el fetch falla
        const local = JSON.parse(localStorage.getItem('user_data') || '{}');
        setCliente(local);
        setNombre(local.nombre     || '');
        setApellido(local.apellido || '');
        setCorreo(local.correo     || '');
        setTelefono(local.telefono || '');
      }
      setLoading(false);
    };

    cargarDatos();
  }, []);

  // ── toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'ok') => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3500);
  };

  // ── guardar info ──────────────────────────────────────────────────────────
  const validateInfo = () => {
    const err = {};
    if (!nombre.trim())   err.nombre   = 'Requerido';
    if (!apellido.trim()) err.apellido = 'Requerido';
    if (!correo.trim())   err.correo   = 'Requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
      err.correo = 'Correo inválido';
    setInfoErr(err);
    return Object.keys(err).length === 0;
  };

  const handleSaveInfo = async () => {
    if (!validateInfo()) return;
    setSaving(true);
    try {
      const res = await clienteService.actualizarCliente(cliente.id_cliente, {
        nombre, apellido, correo, numero_celular: telefono,
      });
      if (res.success) {
        setCliente(prev => ({ ...prev, nombre, apellido, correo, numero_celular: telefono }));
        localStorage.setItem('user_data', JSON.stringify({ ...cliente, nombre, apellido, correo, numero_celular: telefono }));
        showToast('Datos actualizados correctamente');
      } else {
        showToast(res.error || 'Error al guardar los cambios', 'error');
      }
    } catch (e) {
      showToast('Error inesperado al guardar los cambios', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetInfo = () => {
    setNombre(cliente.nombre       || '');
    setApellido(cliente.apellido   || '');
    setCorreo(cliente.correo       || '');
    setTelefono(cliente.numero_celular || '');
    setInfoErr({});
  };

  // ── guardar contraseña ────────────────────────────────────────────────────
  const validatePass = () => {
    const err = {};
    if (!passActual)               err.actual  = 'Ingresá tu contraseña actual';
    if (!passNueva)                err.nueva   = 'Ingresá la nueva contraseña';
    else if (passNueva.length < 8) err.nueva   = 'Mínimo 8 caracteres';
    if (passNueva !== passConfirm) err.confirm = 'Las contraseñas no coinciden';
    setPassErr(err);
    return Object.keys(err).length === 0;
  };

  const handleSavePass = async () => {
    if (!validatePass()) return;
    setSaving(true);
    try {
      const res = await clienteService.actualizarCliente(cliente.id_cliente, { contrasena: passNueva });
      if (res.success) {
        setPassActual(''); setPassNueva(''); setPassConfirm('');
        setStrength({ w: '0%', c: '#E24B4A', t: '' });
        showToast('Contraseña actualizada');
      } else {
        showToast(res.error || 'Error al actualizar la contraseña', 'error');
      }
    } catch (e) {
      showToast('Error inesperado al actualizar la contraseña', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPass = () => {
    setPassActual(''); setPassNueva(''); setPassConfirm('');
    setStrength({ w: '0%', c: '#E24B4A', t: '' });
    setPassErr({});
  };

  // ── derivados ─────────────────────────────────────────────────────────────
  const initials = getInitials(nombre, apellido);
  const fullName = `${nombre} ${apellido}`.trim() || cliente?.correo || '—';

  // ── loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="pc-page">
      <div className="pc-loading-center">
        <div className="pc-spinner"></div>
        <p className="pc-loading-text">Cargando tu perfil...</p>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="pc-page">
      <div className="pc-wrap">

        {/* Botón volver */}
        <button className="pc-btn-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={15} />
          Volver
        </button>

        {/* Toast */}
        <div className={`pc-toast ${toast.show ? 'show' : ''} ${toast.type === 'ok' ? 'ok' : 'error'}`}>
          {toast.type === 'ok'
            ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#10b981" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#ef4444" strokeWidth="1.5"/><path d="M8 5v4M8 11v.5" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round"/></svg>
          }
          {toast.msg}
        </div>

        {/* Header Card */}
        <div className="pc-header-card">
          <div className="pc-header">
            <div className="pc-avatar">
              {initials}
              <div className="pc-avatar-dot" />
            </div>
            <div className="pc-header-info">
              <div className="pc-nombre">{fullName}</div>
              <div className="pc-correo">{cliente?.correo}</div>
              <span className="pc-badge-cliente">Cliente</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="pc-tabs-wrapper">
          <div className="pc-tabs-header">
            {[
              { id: 'info', label: 'Información', Icon: User },
              { id: 'seguridad', label: 'Seguridad', Icon: ShieldCheck },
              { id: 'cuenta', label: 'Cuenta', Icon: Info },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                className={`pc-tab ${tab === id ? 'pc-tab-active' : ''}`}
                onClick={() => setTab(id)}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>

          <div className="pc-tab-content">
            {/* ── Panel: Información ──────────────────────────────────────────── */}
            {tab === 'info' && (
              <>
                <div className="pc-card">
                  <div className="pc-section-label">Datos personales</div>
                  <div className="pc-grid-2">
                    <div className="pc-field">
                      <label className="pc-label">Nombre</label>
                      <input
                        className={`pc-input ${infoErr.nombre ? 'has-error' : ''}`}
                        value={nombre}
                        onChange={e => { setNombre(e.target.value); setInfoErr(p => ({ ...p, nombre: '' })); }}
                        placeholder="Tu nombre"
                      />
                      {infoErr.nombre && <span className="pc-field-error">{infoErr.nombre}</span>}
                    </div>
                    <div className="pc-field">
                      <label className="pc-label">Apellido</label>
                      <input
                        className={`pc-input ${infoErr.apellido ? 'has-error' : ''}`}
                        value={apellido}
                        onChange={e => { setApellido(e.target.value); setInfoErr(p => ({ ...p, apellido: '' })); }}
                        placeholder="Tu apellido"
                      />
                      {infoErr.apellido && <span className="pc-field-error">{infoErr.apellido}</span>}
                    </div>
                  </div>
                  <div className="pc-grid-1">
                    <div className="pc-field">
                      <label className="pc-label">Número de celular</label>
                      <input
                        className="pc-input"
                        value={telefono}
                        onChange={e => setTelefono(e.target.value)}
                        placeholder="+54 11 xxxx-xxxx"
                        type="tel"
                      />
                    </div>
                  </div>
                </div>

                <div className="pc-card">
                  <div className="pc-section-label">Contacto</div>
                  <div className="pc-grid-1">
                    <div className="pc-field">
                      <label className="pc-label">Correo electrónico</label>
                      <input
                        className={`pc-input ${infoErr.correo ? 'has-error' : ''}`}
                        value={correo}
                        onChange={e => { setCorreo(e.target.value); setInfoErr(p => ({ ...p, correo: '' })); }}
                        placeholder="correo@ejemplo.com"
                        type="email"
                      />
                      {infoErr.correo
                        ? <span className="pc-field-error">{infoErr.correo}</span>
                        : <span className="pc-hint">Se usa para iniciar sesión y notificaciones</span>
                      }
                    </div>
                  </div>
                </div>

                <div className="pc-btn-row">
                  <button className="pc-btn pc-btn-ghost" onClick={handleResetInfo} disabled={saving}>
                    Cancelar
                  </button>
                  <button className="pc-btn pc-btn-primary" onClick={handleSaveInfo} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </>
            )}

            {/* ── Panel: Seguridad ────────────────────────────────────────────── */}
            {tab === 'seguridad' && (
              <>
                <div className="pc-card">
                  <div className="pc-section-label">Cambiar contraseña</div>

                  <div className="pc-grid-1" style={{ marginBottom: 12 }}>
                    <div className="pc-field">
                      <label className="pc-label">Contraseña actual</label>
                      <input
                        className={`pc-input ${passErr.actual ? 'has-error' : ''}`}
                        type="password"
                        value={passActual}
                        onChange={e => { setPassActual(e.target.value); setPassErr(p => ({ ...p, actual: '' })); }}
                        placeholder="••••••••"
                      />
                      {passErr.actual && <span className="pc-field-error">{passErr.actual}</span>}
                    </div>
                  </div>

                  <div className="pc-divider" />

                  <div className="pc-grid-1" style={{ marginBottom: 12 }}>
                    <div className="pc-field">
                      <label className="pc-label">Nueva contraseña</label>
                      <input
                        className={`pc-input ${passErr.nueva ? 'has-error' : ''}`}
                        type="password"
                        value={passNueva}
                        onChange={e => {
                          setPassNueva(e.target.value);
                          setStrength(measureStrength(e.target.value));
                          setPassErr(p => ({ ...p, nueva: '' }));
                        }}
                        placeholder="Mínimo 8 caracteres"
                      />
                      {passErr.nueva
                        ? <span className="pc-field-error">{passErr.nueva}</span>
                        : passNueva && (
                          <div className="pc-strength-wrap">
                            <div className="pc-strength-bar">
                              <div className="pc-strength-fill" style={{ width: strength.w, background: strength.c }} />
                            </div>
                            <span className="pc-strength-text" style={{ color: strength.c }}>{strength.t}</span>
                          </div>
                        )
                      }
                    </div>
                  </div>

                  <div className="pc-grid-1">
                    <div className="pc-field">
                      <label className="pc-label">Confirmar nueva contraseña</label>
                      <input
                        className={`pc-input ${passErr.confirm ? 'has-error' : ''}`}
                        type="password"
                        value={passConfirm}
                        onChange={e => { setPassConfirm(e.target.value); setPassErr(p => ({ ...p, confirm: '' })); }}
                        placeholder="Repetí la nueva contraseña"
                      />
                      {passErr.confirm && <span className="pc-field-error">{passErr.confirm}</span>}
                    </div>
                  </div>
                </div>

                <div className="pc-btn-row">
                  <button className="pc-btn pc-btn-ghost" onClick={handleResetPass} disabled={saving}>
                    Cancelar
                  </button>
                  <button className="pc-btn pc-btn-primary" onClick={handleSavePass} disabled={saving}>
                    {saving ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                </div>
              </>
            )}

            {/* ── Panel: Cuenta ───────────────────────────────────────────────── */}
            {tab === 'cuenta' && (
              <>
                <div className="pc-card">
                  <div className="pc-section-label">Resumen de cuenta</div>
                  {[
                    { label: 'ID de cliente', value: `#CLI-${String(cliente?.id_cliente || '').padStart(4, '0')}`, muted: true },
                    { label: 'Nombre', value: fullName },
                    { label: 'Correo', value: cliente?.correo || '—', muted: true },
                    { label: 'Celular', value: cliente?.numero_celular || '—', muted: true },
                    { label: 'Estado', value: 'Activo', success: true },
                  ].map(({ label, value, muted, success }, i, arr) => (
                    <div
                      key={label}
                      className="pc-info-row"
                      style={i === arr.length - 1 ? { borderBottom: 'none' } : {}}
                    >
                      <span className="pc-info-label">{label}</span>
                      <span className={`pc-info-value ${muted ? 'muted' : ''} ${success ? 'success' : ''}`}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pc-card-danger">
                  <div className="pc-section-label danger">Zona de riesgo</div>
                  <p className="pc-danger-text">
                    Cerrás sesión en todos los dispositivos donde estés conectado.
                    Necesitarás tus credenciales para volver a entrar.
                  </p>
                  <button
                    className="pc-btn pc-btn-danger"
                    onClick={() => {
                      localStorage.removeItem('auth_token');
                      localStorage.removeItem('user_data');
                      localStorage.removeItem('user_role');
                      localStorage.removeItem('user_type');
                      navigate('/cliente/login');
                    }}
                  >
                    <LogOut size={14} className="me-2" />
                    Cerrar sesión en todos los dispositivos
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PerfilCliente;