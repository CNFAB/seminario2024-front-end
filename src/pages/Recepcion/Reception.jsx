// src/pages/Recepcion/Reception.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import FormularioCliente from '../../components/FormularioCliente';
import FormularioDispositivo from '../../components/FormularioDispositivo';
import FormularioIngresoD from '../../components/FormularioIngresoD';
import AnimationTab from '../../components/AnimationTab';
import Header from '../../components/header/Header';
import authService from '../../services/AuthService';
import ReportePDF from '../Recepcion/Reporte/ReportePDF';
import { usePDFReporte } from '../Recepcion/Reporte/usePDFReporte';
import { clienteService } from '../../services/clienteService';
import ListaIngresos from '../Recepcion/ListaIngresos';
import GestionReclamosGarantia from '../Recepcion/Reclamo/GestionReclamosGarantia';

import './Reception.css';

const PASOS = [
  { key: 'cliente', icon: 'fas fa-user', label: 'Cliente' },
  { key: 'dispositivo', icon: 'fas fa-mobile-alt', label: 'Dispositivo' },
  { key: 'ingreso', icon: 'fas fa-sign-in-alt', label: 'Ingreso' },
];

const Reception = () => {
  const [user, setUser] = useState(null);
  const [modo, setModo] = useState(null); // 'ingreso', 'retiro', 'reclamos'
  const [paso, setPaso] = useState('buscar');
  const [clienteEncontrado, setClienteEncontrado] = useState(null);
  const [dispositivoElegido, setDispositivoElegido] = useState(null);

  const [datosCliente, setDatosCliente] = useState(null);
  const [datosDispositivo, setDatosDispositivo] = useState(null);
  const [datosIngreso, setDatosIngreso] = useState(null);

  const { pdfRef, generarPDF } = usePDFReporte();
  const navigate = useNavigate();

  useEffect(() => {
    const u = authService.getCurrentUser();
    if (!u) {
      navigate('/Home');
      return;
    }
    setUser(u);
  }, [navigate]);

  const handleLogout = () => {
    authService.logout();
    navigate('/Home');
  };

  const resetear = () => {
    setPaso('buscar');
    setClienteEncontrado(null);
    setDispositivoElegido(null);
    setDatosCliente(null);
    setDatosDispositivo(null);
    setDatosIngreso(null);
  };

  const resetearCompleto = () => {
    setModo(null);
    resetear();
  };

  const generarPDFYResetear = async () => {
    await generarPDF();
    resetear();
  };

  const pasoIdx = PASOS.findIndex((p) => p.key === paso);

  if (!user)
    return (
      <div className="rec-loading">
        <Spinner animation="border" size="sm" style={{ color: '#6366f1' }} />
        <span>Cargando...</span>
      </div>
    );

  // ✅ Si no hay modo seleccionado, mostrar pantalla de selección
  if (!modo) {
    return (
      <div className="rec-shell">
        <Header
          user={{
            nombre: user.nombre,
            apellido: user.apellido,
            correo: user.correo,
            roles: user.roles,
          }}
          rolKey="es_recepcionista"
          onLogout={handleLogout}
          profilePath="/perfil"
        />
        <div className="rec-body">
          <div className="rec-modo-selector">
            <h2 className="rec-modo-titulo">¿Qué acción deseas realizar?</h2>
            <div className="rec-modo-cards">
              {/* Opción 1: Nuevo Ingreso */}
              <div className="rec-modo-card" onClick={() => setModo('ingreso')}>
                <div className="rec-modo-icon ingreso">
                  <i className="fas fa-sign-in-alt"></i>
                </div>
                <h3>Nuevo Ingreso</h3>
                <p>Registrar un dispositivo que entra al taller para reparación</p>
                <span className="rec-modo-btn">+ Nuevo ingreso</span>
              </div>

              {/* Opción 2: Retirar Dispositivo */}
              <div className="rec-modo-card" onClick={() => setModo('retiro')}>
                <div className="rec-modo-icon retiro">
                  <i className="fas fa-sign-out-alt"></i>
                </div>
                <h3>Retirar Dispositivo</h3>
                <p>Cliente retira su dispositivo reparado</p>
                <span className="rec-modo-btn"> Marcar retiro</span>
              </div>

              {/* ✅ Opción 3: Gestionar Reclamos de Garantía (NUEVO) */}
              <div className="rec-modo-card" onClick={() => setModo('reclamos')}>
                <div className="rec-modo-icon reclamos">
                  <i className="fas fa-gavel"></i>
                </div>
                <h3>Reclamos de Garantía</h3>
                <p>Registrar ingreso de dispositivos por reclamos aprobados</p>
                <span className="rec-modo-btn"> Gestionar reclamos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ MODO: RETIRAR DISPOSITIVO
  if (modo === 'retiro') {
    return (
      <div className="rec-shell">
        <Header
          user={{
            nombre: user.nombre,
            apellido: user.apellido,
            correo: user.correo,
            roles: user.roles,
          }}
          rolKey="es_recepcionista"
          onLogout={handleLogout}
          profilePath="/perfil"
        />
        <div className="rec-body">
          <button className="rec-btn-back" onClick={resetearCompleto}>
            <i className="fas fa-arrow-left"></i> Volver
          </button>

          <ListaIngresos onRetiroCompleto={resetearCompleto} />
        </div>
      </div>
    );
  }

  // ✅ MODO: GESTIONAR RECLAMOS DE GARANTÍA (NUEVO)
  if (modo === 'reclamos') {
    return (
      <div className="rec-shell">
        <Header
          user={{
            nombre: user.nombre,
            apellido: user.apellido,
            correo: user.correo,
            roles: user.roles,
          }}
          rolKey="es_recepcionista"
          onLogout={handleLogout}
          profilePath="/perfil"
        />
        <div className="rec-body">
          <button className="rec-btn-back" onClick={resetearCompleto}>
            <i className="fas fa-arrow-left"></i> Volver
          </button>

          <GestionReclamosGarantia />
        </div>
      </div>
    );
  }

  // ✅ MODO: NUEVO INGRESO (flujo original)
  return (
    <div className="rec-shell">
      <Header
        user={{
          nombre: user.nombre,
          apellido: user.apellido,
          correo: user.correo,
          roles: user.roles,
        }}
        rolKey="es_recepcionista"
        onLogout={handleLogout}
        profilePath="/perfil"
      />

      <div className="rec-body">
        {/* Botón para volver al selector */}
        <button className="rec-btn-back" onClick={resetearCompleto}>
          <i className="fas fa-arrow-left"></i> Cambiar acción
        </button>

        {/* ── BUSCAR ── */}
        {paso === 'buscar' && (
          <BuscarCliente
            onEncontrado={(cliente) => {
              setClienteEncontrado(cliente);
              setDatosCliente({
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                correo: cliente.correo,
                numero_celular: cliente.numero_celular,
              });
              setPaso('elegir-dispositivo');
            }}
            onNuevoCliente={() => setPaso('cliente')}
          />
        )}

        {/* ── ELEGIR DISPOSITIVO ── */}
        {paso === 'elegir-dispositivo' && clienteEncontrado && (
          <ElegirDispositivo
            cliente={clienteEncontrado}
            onElegir={(disp) => {
              setDispositivoElegido(disp);
              setDatosDispositivo({
                marcaNombre: disp.modelo?.marca?.marca ?? '—',
                modeloNombre: disp.modelo?.nombre_modelo ?? '—',
                imei: disp.imei ?? disp.codigo_interno ?? null,
              });
              setPaso('ingreso');
            }}
            onNuevoDispositivo={() => setPaso('dispositivo')}
            onVolver={resetear}
          />
        )}

        {/* ── FORMULARIOS PASO A PASO ── */}
        {['cliente', 'dispositivo', 'ingreso'].includes(paso) && (
          <>
            <div className="rec-progress-card">
              <div className="rec-progress-steps">
                {PASOS.map((p, i) => {
                  const activo = p.key === paso;
                  const completado = pasoIdx > i;
                  return (
                    <div key={p.key} className="rec-step">
                      <div
                        className={`rec-step-circle ${activo ? 'activo' : completado ? 'completado' : 'pendiente'}`}
                      >
                        {completado ? <i className="fas fa-check"></i> : <i className={p.icon}></i>}
                      </div>
                      <div className={`rec-step-label ${activo ? 'activo' : ''}`}>{p.label}</div>
                      {i < PASOS.length - 1 && (
                        <div className={`rec-step-line ${completado ? 'completado' : ''}`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="rec-progress-bar-wrap">
                <div
                  className="rec-progress-bar"
                  style={{ width: `${((pasoIdx + 1) / PASOS.length) * 100}%` }}
                ></div>
              </div>
              <div className="rec-progress-texto">
                Paso {pasoIdx + 1} de {PASOS.length}
              </div>
            </div>

            <div className="rec-form-card">
              {/* PASO 1 — Cliente nuevo */}
              <AnimationTab activeKey={paso} tabKey="cliente">
                {paso === 'cliente' && (
                  <FormularioCliente
                    onComplete={(cliente) => {
                      if (cliente) {
                        setClienteEncontrado(cliente);
                        setDatosCliente({
                          nombre: cliente.nombre,
                          apellido: cliente.apellido,
                          correo: cliente.correo,
                          numero_celular: cliente.numero_celular,
                        });
                      }
                      setPaso('dispositivo');
                    }}
                  />
                )}
              </AnimationTab>

              {/* PASO 2 — Dispositivo nuevo */}
              <AnimationTab activeKey={paso} tabKey="dispositivo">
                {paso === 'dispositivo' && (
                  <FormularioDispositivo
                    clienteId={clienteEncontrado?.id_cliente ?? null}
                    clienteInfo={clienteEncontrado}
                    onComplete={(dispData) => {
                      if (dispData) {
                        setDatosDispositivo(dispData);
                        if (dispData.id_dispositivo) {
                          setDispositivoElegido(dispData);
                        }
                      }
                      setPaso('ingreso');
                    }}
                  />
                )}
              </AnimationTab>

              {/* PASO 3 — Ingreso */}
              <AnimationTab activeKey={paso} tabKey="ingreso">
                {paso === 'ingreso' && (
                  <FormularioIngresoD
                    onComplete={(ingresoData) => {
                      if (ingresoData) setDatosIngreso(ingresoData);
                      generarPDFYResetear();
                    }}
                    user={user}
                    dispositivoId={dispositivoElegido?.id_dispositivo}
                  />
                )}
              </AnimationTab>

              {/* Navegación */}
              <div className="rec-nav-btns">
                <button
                  className="rec-btn-outline"
                  onClick={() => {
                    if (paso === 'cliente') resetear();
                    if (paso === 'dispositivo') {
                      clienteEncontrado ? setPaso('elegir-dispositivo') : setPaso('cliente');
                    }
                    if (paso === 'ingreso') setPaso('dispositivo');
                  }}
                >
                  <i className="fas fa-chevron-left"></i> Anterior
                </button>

                <span className="rec-nav-info">
                  Paso {pasoIdx + 1} de {PASOS.length}
                </span>

                {paso !== 'ingreso' && (
                  <button
                    className="rec-btn-primary"
                    onClick={() => {
                      if (paso === 'cliente') setPaso('dispositivo');
                      if (paso === 'dispositivo') setPaso('ingreso');
                    }}
                  >
                    Siguiente <i className="fas fa-chevron-right"></i>
                  </button>
                )}
                {paso === 'ingreso' && (
                  <button className="rec-btn-success" onClick={resetear}>
                    <i className="fas fa-redo"></i> Nuevo ingreso
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <ReportePDF
        ref={pdfRef}
        datosCliente={datosCliente ?? {}}
        datosDispositivo={datosDispositivo ?? {}}
        datosIngreso={datosIngreso ?? {}}
      />
    </div>
  );
};

// ── Pantalla de búsqueda (sin cambios) ──────────────────────────────────────
const BuscarCliente = ({ onEncontrado, onNuevoCliente }) => {
  const [query, setQuery] = useState('');
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  const buscar = async () => {
    if (query.trim().length < 3) {
      setError('Ingresá al menos 3 caracteres');
      return;
    }
    setBuscando(true);
    setError('');
    setResultado(null);
    try {
      const result = await clienteService.buscarClienteConDispositivos(query);
      if (result.success && result.data) {
        setResultado(result.data);
      } else {
        setResultado(false);
        setError(result.message || 'Cliente no encontrado');
      }
    } catch (e) {
      console.error(e);
      setResultado(false);
      setError('Error al buscar cliente');
    } finally {
      setBuscando(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') buscar();
  };

  return (
    <div className="rec-buscar-wrap">
      <div className="rec-buscar-card">
        <div className="rec-buscar-icon">
          <i className="fas fa-search"></i>
        </div>
        <h2 className="rec-buscar-titulo">¿El cliente ya está registrado?</h2>
        <p className="rec-buscar-sub">
          Buscá por celular, correo o nombre para evitar registrarlo de nuevo
        </p>

        <div className="rec-buscar-input-group">
          <input
            className="rec-buscar-input"
            type="text"
            placeholder="Celular, correo o nombre..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setResultado(null);
              setError('');
            }}
            onKeyDown={handleKey}
            autoFocus
          />
          <button className="rec-buscar-btn" onClick={buscar} disabled={buscando}>
            {buscando ? (
              <Spinner animation="border" size="sm" />
            ) : (
              <>
                <i className="fas fa-search"></i> Buscar
              </>
            )}
          </button>
        </div>
        {error && <p className="rec-buscar-error">{error}</p>}

        {resultado && (
          <div className="rec-resultado-card">
            <div className="rec-resultado-avatar">
              {(resultado.nombre?.[0] ?? '').toUpperCase()}
              {(resultado.apellido?.[0] ?? '').toUpperCase()}
            </div>
            <div className="rec-resultado-info">
              <div className="rec-resultado-nombre">
                {resultado.nombre} {resultado.apellido}
              </div>
              <div className="rec-resultado-detalle">
                {resultado.correo} · {resultado.numero_celular}
              </div>
              <div className="rec-resultado-disps">
                {resultado.dispositivos?.length > 0
                  ? `${resultado.dispositivos.length} dispositivo${resultado.dispositivos.length !== 1 ? 's' : ''} registrado${resultado.dispositivos.length !== 1 ? 's' : ''}`
                  : 'Sin dispositivos registrados'}
              </div>
            </div>
            <button className="rec-btn-primary" onClick={() => onEncontrado(resultado)}>
              Continuar <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}

        {resultado === false && (
          <div className="rec-no-encontrado">
            <i className="fas fa-user-slash"></i>
            <span>Cliente no encontrado</span>
          </div>
        )}

        <div className="rec-divider">
          <span>o</span>
        </div>

        <button className="rec-btn-outline rec-btn-nuevo" onClick={onNuevoCliente}>
          <i className="fas fa-user-plus"></i>
          Registrar nuevo cliente
        </button>
      </div>
    </div>
  );
};

// ── Elegir dispositivo existente (sin cambios) ──────────────────────────────
const ElegirDispositivo = ({ cliente, onElegir, onNuevoDispositivo, onVolver }) => {
  const dispositivos = cliente.dispositivos ?? [];

  return (
    <div className="rec-buscar-wrap">
      <div className="rec-buscar-card" style={{ maxWidth: 560 }}>
        <div className="rec-cliente-pill">
          <div className="rec-resultado-avatar" style={{ width: 36, height: 36, fontSize: 13 }}>
            {(cliente.nombre?.[0] ?? '').toUpperCase()}
            {(cliente.apellido?.[0] ?? '').toUpperCase()}
          </div>
          <span>
            {cliente.nombre} {cliente.apellido} · {cliente.numero_celular}
          </span>
        </div>

        <h2 className="rec-buscar-titulo" style={{ marginTop: 16 }}>
          ¿Cuál dispositivo ingresa?
        </h2>
        <p className="rec-buscar-sub">
          Elegí uno de los dispositivos registrados o agregá uno nuevo
        </p>

        {dispositivos.length > 0 ? (
          <div className="rec-disp-lista">
            {dispositivos.map((d) => (
              <button key={d.id_dispositivo} className="rec-disp-item" onClick={() => onElegir(d)}>
                <div className="rec-disp-icon">
                  <i className="fas fa-mobile-alt"></i>
                </div>
                <div className="rec-disp-info">
                  <div className="rec-disp-modelo">
                    {d.modelo?.marca?.marca ?? '—'} {d.modelo?.nombre_modelo ?? '—'}
                  </div>
                  <div className="rec-disp-imei">{d.imei ?? d.codigo_interno ?? 'Sin IMEI'}</div>
                </div>
                <i className="fas fa-chevron-right rec-disp-arrow"></i>
              </button>
            ))}
          </div>
        ) : (
          <div className="rec-no-encontrado">
            <i className="fas fa-mobile-alt"></i>
            <span>Sin dispositivos registrados</span>
          </div>
        )}

        <div className="rec-divider">
          <span>o</span>
        </div>

        <button className="rec-btn-outline rec-btn-nuevo" onClick={onNuevoDispositivo}>
          <i className="fas fa-plus"></i>
          Registrar nuevo dispositivo
        </button>

        <button className="rec-btn-link" onClick={onVolver}>
          <i className="fas fa-arrow-left"></i> Volver a buscar
        </button>
      </div>
    </div>
  );
};

export default Reception;
