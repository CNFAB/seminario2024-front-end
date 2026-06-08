import React, { useState, useEffect } from 'react';
import { Spinner } from 'react-bootstrap';
import { Wrench, ShieldCheck, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/AuthService';
import { usuarioService } from '../../services/usuarioService';
import './PerfilUsuario.css';

// ─── helpers ────────────────────────────────────────────────────────────────
const getInitials = (nombre = '', apellido = '') =>
  `${nombre[0] || ''}${apellido[0] || ''}`.toUpperCase();

const getRol = (roles) => {
  if (roles?.es_administrador) return { label: 'Administrador', color: '#533AB7' };
  if (roles?.es_tecnico)       return { label: 'Técnico',       color: '#185FA5' };
  if (roles?.es_recepcionista) return { label: 'Recepcionista', color: '#0F6E56' };
  return { label: 'Usuario', color: '#5F5E5A' };
};

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
const PerfilUsuario = () => {
  const navigate = useNavigate();

  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [tab,     setTab]     = useState('info');
  const [toast,   setToast]   = useState({ show: false, msg: '', type: 'ok' });

  // form — info
  const [nombre,   setNombre]   = useState('');
  const [apellido, setApellido] = useState('');
  const [correo,   setCorreo]   = useState('');
  const [celular,  setCelular]  = useState('');
  const [infoErr,  setInfoErr]  = useState({});

  // form — seguridad
  const [passActual,  setPassActual]  = useState('');
  const [passNueva,   setPassNueva]   = useState('');
  const [passConfirm, setPassConfirm] = useState('');
  const [strength,    setStrength]    = useState({ w: '0%', c: '#E24B4A', t: '' });
  const [passErr,     setPassErr]     = useState({});

  // ── carga inicial ─────────────────────────────────────────────────────────
  useEffect(() => {
    const u = authService.getCurrentUser();
    if (!u) { navigate('Home'); return; }

    const cargarDatos = async () => {
      try {
        const datosCompletos = await usuarioService.obtenerPorId(u.id_usuario);
        console.log("clientes",datosCompletos);
        const merged = { ...u, ...datosCompletos };
        setUser(merged);
        setNombre(merged.nombre          || '');
        setApellido(merged.apellido      || '');
        setCorreo(merged.correo          || '');
        setCelular(merged.numero_celular || '');
      } catch (e) {
        // Fallback: si falla el fetch usamos lo que hay en sesión
        console.warn('No se pudo obtener datos completos:', e);
        setUser(u);
        setNombre(u.nombre          || '');
        setApellido(u.apellido      || '');
        setCorreo(u.correo          || '');
        setCelular(u.numero_celular || '');
      } finally {
        setLoading(false);
      }
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
      await usuarioService.actualizar(user.id_usuario, {
        nombre, apellido, correo, numero_celular: celular,
      });
      setUser(prev => ({ ...prev, nombre, apellido, correo, numero_celular: celular }));
      showToast('Datos actualizados correctamente');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Error al guardar los cambios', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleResetInfo = () => {
    setNombre(user.nombre          || '');
    setApellido(user.apellido      || '');
    setCorreo(user.correo          || '');
    setCelular(user.numero_celular || '');
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
      await usuarioService.actualizar(user.id_usuario, { contrasena: passNueva });
      setPassActual(''); setPassNueva(''); setPassConfirm('');
      setStrength({ w: '0%', c: '#E24B4A', t: '' });
      showToast('Contraseña actualizada');
    } catch (e) {
      showToast(e?.response?.data?.message || 'Error al actualizar la contraseña', 'error');
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
  const rol      = getRol(user?.roles);
  const initials = getInitials(nombre, apellido);
  const fullName = `${nombre} ${apellido}`.trim() || user?.correo || '—';

  // ── loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="perfil-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner animation="border" variant="primary" />
        <p style={{ marginTop: 12, color: '#6C757D', fontSize: 14 }}>Cargando perfil...</p>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="perfil-page">
      <div className="perfil-wrap">

        {/* Botón volver */}
        <button
          className="perfil-btn perfil-btn-back"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={14} />
          Volver
        </button>

        {/* Toast */}
        <div className={`perfil-toast ${toast.show ? 'show' : ''} ${toast.type}`}>
          {toast.type === 'ok'
            ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#0F6E56" strokeWidth="1.5"/><path d="M5 8l2 2 4-4" stroke="#0F6E56" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="#DC3545" strokeWidth="1.5"/><path d="M8 5v4M8 11v.5" stroke="#DC3545" strokeWidth="1.5" strokeLinecap="round"/></svg>
          }
          {toast.msg}
        </div>

        {/* Header */}
        <div className="perfil-header">
          <div
            className="perfil-avatar"
            style={{ background: rol.color + '18', color: rol.color }}
          >
            {initials}
            <div className="perfil-avatar-dot" />
          </div>
          <div>
            <div className="perfil-nombre">{fullName}</div>
            <div className="perfil-correo">{user?.correo}</div>
            <span
              className="perfil-rol-badge"
              style={{ color: rol.color, background: rol.color + '15' }}
            >
              {rol.label}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="perfil-tabs">
          {[
            { id: 'info',      label: 'Información', Icon: User        },
            { id: 'seguridad', label: 'Seguridad',   Icon: ShieldCheck },
            { id: 'cuenta',    label: 'Cuenta',      Icon: Wrench      },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`perfil-tab ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Panel: Información ──────────────────────────────────────────── */}
        {tab === 'info' && (
          <>
            <div className="perfil-card">
              <div className="perfil-section-label">Datos personales</div>
              <div className="perfil-grid-2">
                <div className="perfil-field">
                  <label className="perfil-label">Nombre</label>
                  <input
                    className={`perfil-input ${infoErr.nombre ? 'has-error' : ''}`}
                    value={nombre}
                    onChange={e => { setNombre(e.target.value); setInfoErr(p => ({ ...p, nombre: '' })); }}
                    placeholder="Tu nombre"
                  />
                  {infoErr.nombre && <span className="perfil-field-error">{infoErr.nombre}</span>}
                </div>
                <div className="perfil-field">
                  <label className="perfil-label">Apellido</label>
                  <input
                    className={`perfil-input ${infoErr.apellido ? 'has-error' : ''}`}
                    value={apellido}
                    onChange={e => { setApellido(e.target.value); setInfoErr(p => ({ ...p, apellido: '' })); }}
                    placeholder="Tu apellido"
                  />
                  {infoErr.apellido && <span className="perfil-field-error">{infoErr.apellido}</span>}
                </div>
              </div>
              <div className="perfil-grid-1">
                <div className="perfil-field">
                  <label className="perfil-label">Número de celular</label>
                  <input
                    className="perfil-input"
                    value={celular}
                    onChange={e => setCelular(e.target.value)}
                    placeholder="+54 11 xxxx-xxxx"
                    type="tel"
                  />
                </div>
              </div>
            </div>

            <div className="perfil-card">
              <div className="perfil-section-label">Contacto</div>
              <div className="perfil-grid-1">
                <div className="perfil-field">
                  <label className="perfil-label">Correo electrónico</label>
                  <input
                    className={`perfil-input ${infoErr.correo ? 'has-error' : ''}`}
                    value={correo}
                    onChange={e => { setCorreo(e.target.value); setInfoErr(p => ({ ...p, correo: '' })); }}
                    placeholder="correo@ejemplo.com"
                    type="email"
                  />
                  {infoErr.correo
                    ? <span className="perfil-field-error">{infoErr.correo}</span>
                    : <span className="perfil-hint">Se usa para iniciar sesión y notificaciones</span>
                  }
                </div>
              </div>
            </div>

            <div className="perfil-btn-row">
              <button className="perfil-btn perfil-btn-ghost" onClick={handleResetInfo} disabled={saving}>
                Cancelar
              </button>
              <button className="perfil-btn perfil-btn-primary" onClick={handleSaveInfo} disabled={saving}>
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </>
        )}

        {/* ── Panel: Seguridad ────────────────────────────────────────────── */}
        {tab === 'seguridad' && (
          <>
            <div className="perfil-card">
              <div className="perfil-section-label">Cambiar contraseña</div>

              <div className="perfil-grid-1" style={{ marginBottom: 12 }}>
                <div className="perfil-field">
                  <label className="perfil-label">Contraseña actual</label>
                  <input
                    className={`perfil-input ${passErr.actual ? 'has-error' : ''}`}
                    type="password"
                    value={passActual}
                    onChange={e => { setPassActual(e.target.value); setPassErr(p => ({ ...p, actual: '' })); }}
                    placeholder="••••••••"
                  />
                  {passErr.actual && <span className="perfil-field-error">{passErr.actual}</span>}
                </div>
              </div>

              <div className="perfil-divider" />

              <div className="perfil-grid-1" style={{ marginBottom: 12 }}>
                <div className="perfil-field">
                  <label className="perfil-label">Nueva contraseña</label>
                  <input
                    className={`perfil-input ${passErr.nueva ? 'has-error' : ''}`}
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
                    ? <span className="perfil-field-error">{passErr.nueva}</span>
                    : passNueva && (
                      <div className="perfil-strength-wrap">
                        <div className="perfil-strength-bar">
                          <div
                            className="perfil-strength-fill"
                            style={{ width: strength.w, background: strength.c }}
                          />
                        </div>
                        <span className="perfil-strength-text" style={{ color: strength.c }}>
                          {strength.t}
                        </span>
                      </div>
                    )
                  }
                </div>
              </div>

              <div className="perfil-grid-1">
                <div className="perfil-field">
                  <label className="perfil-label">Confirmar nueva contraseña</label>
                  <input
                    className={`perfil-input ${passErr.confirm ? 'has-error' : ''}`}
                    type="password"
                    value={passConfirm}
                    onChange={e => { setPassConfirm(e.target.value); setPassErr(p => ({ ...p, confirm: '' })); }}
                    placeholder="Repetí la nueva contraseña"
                  />
                  {passErr.confirm && <span className="perfil-field-error">{passErr.confirm}</span>}
                </div>
              </div>
            </div>

            <div className="perfil-btn-row">
              <button className="perfil-btn perfil-btn-ghost" onClick={handleResetPass} disabled={saving}>
                Cancelar
              </button>
              <button className="perfil-btn perfil-btn-primary" onClick={handleSavePass} disabled={saving}>
                {saving ? 'Actualizando...' : 'Actualizar contraseña'}
              </button>
            </div>
          </>
        )}

        {/* ── Panel: Cuenta ───────────────────────────────────────────────── */}
        {tab === 'cuenta' && (
          <>
            <div className="perfil-card">
              <div className="perfil-section-label">Resumen de cuenta</div>
              {[
                { label: 'ID de usuario', value: `#USR-${String(user?.id_usuario || '').padStart(4, '0')}`, cls: 'muted' },
                { label: 'Rol',           value: rol.label },
                { label: 'Correo',        value: user?.correo          || '—', cls: 'muted' },
                { label: 'Celular',       value: user?.numero_celular  || '—', cls: 'muted' },
                { label: 'Estado',        value: 'Activo',                     cls: 'success' },
              ].map(({ label, value, cls }, i, arr) => (
                <div
                  key={label}
                  className="perfil-info-row"
                  style={i === arr.length - 1 ? { borderBottom: 'none' } : {}}
                >
                  <span className="perfil-info-label">{label}</span>
                  <span className={`perfil-info-value ${cls || ''}`}>{value}</span>
                </div>
              ))}
            </div>

            <div className="perfil-card-danger">
              <div className="perfil-section-label danger">Zona de riesgo</div>
              <p className="perfil-danger-text">
                Cerrás sesión en todos los dispositivos donde estés conectado.
                Necesitarás tus credenciales para volver a entrar.
              </p>
              <button className="perfil-btn perfil-btn-danger">
                Cerrar sesión en todos los dispositivos
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default PerfilUsuario;