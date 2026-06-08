import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Smartphone, History, CheckCircle, Clock, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { clienteService } from '../../services/clienteService';
import { DispositivosCliente } from './Componentes/DispositivoCliente';
import { HistorialReparaciones } from './Componentes/HistorialReparaciones';
import TimeLineDiagnostico from './Componentes/TimeLineDiagnostico';
import { diagnosticoService } from '../../services/diagnosticoService';
import GarantiasCliente from './Componentes/GarantiasCliente';
import MisReclamosCliente from './Componentes/MisReclamosCliente';
import ModalCalificacion from './Componentes/ModalCalificacion';
import testimonioService from '../../services/testimonioService';
import Header from '../../components/header/Header';
import AlertCustom from '../../components/Alert/AlertCustom'; // ✅ Importar AlertCustom
import './ClienteDashboard.css';

const ClienteDashboard = () => {
  const [historialReparaciones, setHistorialReparaciones] = useState([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [dispositivos, setDispositivos] = useState([]);
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState(null);
  const [activeTab, setActiveTab] = useState('dispositivos');
  const [historialCargado, setHistorialCargado] = useState(false);
  const [garantiasCargadas, setGarantiasCargadas] = useState(false);
  const [loadingAccion, setLoadingAccion] = useState(false);
  const [showModalCalificacion, setShowModalCalificacion] = useState(false);
  const [reparacionParaCalificar, setReparacionParaCalificar] = useState(null);
  const [reparacionesPendientesCalificar, setReparacionesPendientesCalificar] = useState([]);
  const navigate = useNavigate();

  // ============================================
  // MANEJAR CALIFICACIÓN COMPLETADA
  // ============================================
  const handleCalificacionCompletada = () => {
    const nuevasPendientes = reparacionesPendientesCalificar.slice(1);
    if (nuevasPendientes.length > 0) {
      setReparacionesPendientesCalificar(nuevasPendientes);
      setReparacionParaCalificar(nuevasPendientes[0]);
      setShowModalCalificacion(true);
    } else {
      setShowModalCalificacion(false);
      setReparacionParaCalificar(null);
    }
    cargarDatosCliente();
  };

  // ============================================
  // EFECTO PRINCIPAL
  // ============================================
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      navigate('/home');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const pagoStatus = params.get('pago');
    const paymentId = params.get('payment_id');
    const preferenceId = params.get('preference_id');

    if (pagoStatus === 'success' && paymentId && preferenceId) {
      api
        .get('/verificar-pago', { params: { payment_id: paymentId, preference_id: preferenceId } })
        .then(() => cargarDatosCliente())
        .catch(() => cargarDatosCliente())
        .finally(() => {
          window.history.replaceState({}, '', '/cliente/dashboard');
        });
    } else {
      cargarDatosCliente();
    }
  }, []);

  // ============================================
  // FUNCIONES DE UTILIDAD
  // ============================================
  const isDiagnosticoExpirado = (fechaExpiracion) => {
    if (!fechaExpiracion) return false;
    const fechaExp = new Date(fechaExpiracion);
    const ahora = new Date();
    fechaExp.setHours(0, 0, 0, 0);
    ahora.setHours(0, 0, 0, 0);
    return fechaExp < ahora;
  };

  const obtenerEstadisticasDispositivos = () => {
    if (!dispositivos || dispositivos.length === 0) {
      return { total: 0, completados: 0, enReparacion: 0 };
    }

    const estadosValidos = {
      completados: ['TERMINADO', 'LISTO_PARA_RETIRAR', 'COMPLETADO', 'RETIRADO'],
      enReparacion: ['EN_REPARACION', 'APROBADO', 'EN_PROCESO', 'PENDIENTE', 'DIAGNOSTICO'],
    };

    let completados = 0;
    let enReparacion = 0;

    dispositivos.forEach((disp) => {
      const estado = disp.estado_actual || disp.estado || '';
      if (estadosValidos.completados.includes(estado)) {
        completados++;
      } else if (estadosValidos.enReparacion.includes(estado)) {
        enReparacion++;
      }
    });

    return {
      total: dispositivos.length,
      completados,
      enReparacion,
    };
  };

  const estadisticas = obtenerEstadisticasDispositivos();

  const verificarPendientesCalificacion = async () => {
    console.log('🔍 Verificando testimonios pendientes...');
    try {
      const response = await testimonioService.verificarPendientes();
      if (response.tiene_pendientes && response.reparaciones?.length > 0) {
        const noGarantia = response.reparaciones.filter((rep) => rep.es_garantia !== true);
        if (noGarantia.length > 0) {
          setReparacionesPendientesCalificar(noGarantia);
          setReparacionParaCalificar(noGarantia[0]);
          setShowModalCalificacion(true);
        } else {
          console.log('🔧 Solo hay reparaciones de garantía - no mostrar modal');
        }
      }
    } catch (error) {
      console.error('Error al verificar testimonios pendientes:', error);
    }
  };

  // ============================================
  // CARGAR DATOS DEL CLIENTE
  // ============================================
  const cargarDatosCliente = async () => {
    setLoading(true);
    try {
      const response = await api.get('/cliente/mis-dispositivos');
      const datosDispositivos = response.data.data || response.data;
      const dispositivosFiltrados = Array.isArray(datosDispositivos)
        ? datosDispositivos.filter((disp) => {
            const estadoIngreso = disp.ingreso?.estado || disp.ultimo_ingreso?.estado;
            return estadoIngreso !== 'RETIRADO';
          })
        : datosDispositivos;
      setDispositivos(dispositivosFiltrados);
      if (dispositivosFiltrados.length > 0) setDispositivoSeleccionado(dispositivosFiltrados[0]);
      const clienteData = JSON.parse(localStorage.getItem('user_data') || '{}');
      setCliente(clienteData);
      try {
        await verificarPendientesCalificacion();
      } catch (testimonioError) {
        console.error('Error al verificar testimonios:', testimonioError);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('user_role');
        localStorage.removeItem('user_type');
        navigate('/Home');
      } else {
        console.error('Error al cargar dispositivos:', err);
        setError('Error al cargar tus dispositivos. Por favor, intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CARGAR HISTORIAL DE REPARACIONES
  // ============================================
  const cargarHistorialReparaciones = async () => {
    setLoadingHistorial(true);
    try {
      const resultado = await clienteService.obtenerMiHistorial();
      if (Array.isArray(resultado)) {
        setHistorialReparaciones(resultado);
      } else if (resultado.success && resultado.data) {
        setHistorialReparaciones(resultado.data);
      } else if (resultado.data && Array.isArray(resultado.data)) {
        setHistorialReparaciones(resultado.data);
      } else {
        setHistorialReparaciones([]);
      }
    } catch (error) {
      console.error('❌ Error cargando historial:', error);
      setHistorialReparaciones([]);
    } finally {
      setLoadingHistorial(false);
    }
  };

  // ============================================
  // MANEJAR ACCIONES DEL CLIENTE (ACTUALIZADAS CON ALERTCUSTOM)
  // ============================================
  const handleAceptarDiagnostico = async (idDiagnostico) => {
    setLoadingAccion(true);
    try {
      await diagnosticoService.clienteAceptar(idDiagnostico);
      await cargarDatosCliente();

      // ✅ Alerta de éxito personalizada
      await AlertCustom.success('Diagnóstico aceptado correctamente', '✅ Aceptado');
    } catch (error) {
      console.error('Error al aceptar diagnóstico:', error);

      if (error.response?.data?.code === 'DIAGNOSTICO_EXPIRADO') {
        await AlertCustom.warning(
          error.response?.data?.message || 'Este diagnóstico ya expiró.',
          'Diagnóstico Expirado'
        );
      } else if (error.response?.data?.message) {
        await AlertCustom.error(error.response.data.message, 'Error');
      } else {
        await AlertCustom.error('Error al aceptar el diagnóstico', 'Error');
      }
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleRechazarDiagnostico = async (idDiagnostico) => {
    setLoadingAccion(true);
    try {
      await diagnosticoService.rechazarDiagnostico(idDiagnostico);
      await cargarDatosCliente();

      // ✅ Alerta de rechazo personalizada
      await AlertCustom.success('Diagnóstico rechazado correctamente', '❌ Rechazado');
    } catch (error) {
      console.error('Error al rechazar diagnóstico:', error);

      if (error.response?.data?.code === 'DIAGNOSTICO_EXPIRADO') {
        await AlertCustom.warning(
          error.response?.data?.message || 'Este diagnóstico ya expiró.',
          'Diagnóstico Expirado'
        );
      } else if (error.response?.data?.message) {
        await AlertCustom.error(error.response.data.message, 'Error');
      } else {
        await AlertCustom.error('Error al rechazar el diagnóstico', 'Error');
      }
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleCancelarReparacion = async (idIngreso) => {
    setLoadingAccion(true);
    try {
      await reparacionMultipleService.cancelarReparacion(idIngreso);
      await cargarDatosCliente();

      await AlertCustom.warning('Reparación cancelada correctamente', '⚠️ Cancelada');
    } catch (error) {
      console.error('Error al cancelar reparación:', error);

      if (error.response?.data?.message) {
        await AlertCustom.error(error.response.data.message, 'Error');
      } else {
        await AlertCustom.error('Error al cancelar la reparación', 'Error');
      }
    } finally {
      setLoadingAccion(false);
    }
  };

  const handleLogout = async () => {
    // Confirmar antes de cerrar sesión
    const confirmado = await AlertCustom.confirm({
      title: 'Cerrar sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      confirmText: 'Sí, cerrar sesión',
      cancelText: 'Cancelar',
      confirmButtonColor: '#dc3545',
    });

    if (confirmado.isConfirmed) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_role');
      localStorage.removeItem('user_type');
      navigate('/home');
    }
  };

  // ============================================
  // RENDERIZADO
  // ============================================
  return (
    <div className="cliente-dashboard-wrapper">
      <Header
        user={{
          nombre: cliente?.nombre,
          apellido: cliente?.apellido,
          correo: cliente?.correo,
        }}
        rolKey="cliente"
        onLogout={handleLogout}
        profilePath="/cliente/perfil"
      />

      <Container fluid className="cliente-dashboard-container">
        {/* Stats Cards */}
        <Row className="mb-4">
          <Col md={4} className="mb-3 mb-md-0">
            <Card className="cliente-stats-card">
              <Card.Body className="cliente-stats-body">
                <div className="cliente-stats-icon">
                  <Smartphone size={24} />
                </div>
                <div>
                  <h3 className="cliente-stats-number">{estadisticas.total}</h3>
                  <small className="cliente-stats-label">Tus dispositivos</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3 mb-md-0">
            <Card className="cliente-stats-card">
              <Card.Body className="cliente-stats-body">
                <div className="cliente-stats-icon">
                  <CheckCircle size={24} />
                </div>
                <div>
                  <h3 className="cliente-stats-number">{estadisticas.completados}</h3>
                  <small className="cliente-stats-label">Completados</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="cliente-stats-card">
              <Card.Body className="cliente-stats-body">
                <div className="cliente-stats-icon">
                  <Clock size={24} />
                </div>
                <div>
                  <h3 className="cliente-stats-number">{estadisticas.enReparacion}</h3>
                  <small className="cliente-stats-label">En reparación</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Main Card with Tabs */}
        <Card className="cliente-main-card">
          <Card.Body className="p-0">
            <div className="cliente-tabs-wrapper">
              <div className="cliente-tabs-header">
                <button
                  className={`cliente-tab ${activeTab === 'dispositivos' ? 'cliente-tab-active' : ''}`}
                  onClick={() => setActiveTab('dispositivos')}
                >
                  <Smartphone size={16} className="cliente-tab-icon" />
                  Mis Dispositivos
                </button>
                <button
                  className={`cliente-tab ${activeTab === 'historial' ? 'cliente-tab-active' : ''}`}
                  onClick={() => {
                    setActiveTab('historial');
                    if (!historialCargado) {
                      setHistorialCargado(true);
                      cargarHistorialReparaciones();
                    }
                  }}
                >
                  <History size={16} className="cliente-tab-icon" />
                  Historial
                  {loadingHistorial && <div className="cliente-spinner-sm ms-2"></div>}
                </button>
                <button
                  className={`cliente-tab ${activeTab === 'garantias' ? 'cliente-tab-active' : ''}`}
                  onClick={() => {
                    setActiveTab('garantias');
                    setGarantiasCargadas(true);
                  }}
                >
                  <ShieldCheck size={16} className="cliente-tab-icon" />
                  Garantías
                </button>
                <button
                  className={`cliente-tab ${activeTab === 'mis-reclamos' ? 'cliente-tab-active' : ''}`}
                  onClick={() => setActiveTab('mis-reclamos')}
                >
                  <ShieldAlert size={16} className="cliente-tab-icon" />
                  Mis Reclamos
                </button>
              </div>

              <div className="cliente-tab-content">
                {/* Pestaña Mis Dispositivos */}
                {activeTab === 'dispositivos' && (
                  <div className="cliente-tab-pane">
                    <Row>
                      <Col md={4}>
                        <DispositivosCliente
                          dispositivos={dispositivos}
                          seleccionado={dispositivoSeleccionado}
                          onSelect={setDispositivoSeleccionado}
                        />
                      </Col>
                      <Col md={8}>
                        {dispositivoSeleccionado ? (
                          <TimeLineDiagnostico
                            dispositivo={dispositivoSeleccionado}
                            onAceptar={handleAceptarDiagnostico}
                            onRechazar={handleRechazarDiagnostico}
                            onCancelar={handleCancelarReparacion}
                            isExpirado={isDiagnosticoExpirado}
                          />
                        ) : (
                          <div className="cliente-empty-state">
                            <Smartphone size={48} className="cliente-empty-icon" />
                            <h5 className="cliente-empty-title">Selecciona un dispositivo</h5>
                            <p className="cliente-empty-text">
                              Elige un dispositivo de la lista para ver su historial y diagnósticos
                            </p>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </div>
                )}

                {/* Pestaña Historial */}
                {activeTab === 'historial' && (
                  <div className="cliente-tab-pane">
                    {loadingHistorial ? (
                      <div className="cliente-loading-container">
                        <div className="cliente-spinner"></div>
                        <p className="cliente-loading-text">Cargando historial...</p>
                      </div>
                    ) : (
                      <HistorialReparaciones
                        dispositivos={dispositivos}
                        historialData={historialReparaciones}
                        loading={loadingHistorial}
                      />
                    )}
                  </div>
                )}

                {/* Pestaña Garantías */}
                {activeTab === 'garantias' && (
                  <div className="cliente-tab-pane">
                    <GarantiasCliente dispositivos={dispositivos} clienteId={cliente?.id_cliente} />
                  </div>
                )}

                {/* Pestaña Mis Reclamos */}
                {activeTab === 'mis-reclamos' && (
                  <div className="cliente-tab-pane">
                    <MisReclamosCliente />
                  </div>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Modal de Calificación */}
      <ModalCalificacion
        show={showModalCalificacion}
        onClose={() => setShowModalCalificacion(false)}
        reparacion={reparacionParaCalificar}
        onCalificado={handleCalificacionCompletada}
      />
    </div>
  );
};

// Componente Skeleton para las tarjetas de estadísticas
const StatsSkeleton = () => (
  <div className="cliente-stats-skeleton">
    <div className="cliente-stats-skeleton-icon"></div>
    <div className="cliente-stats-skeleton-content">
      <div className="cliente-stats-skeleton-number"></div>
      <div className="cliente-stats-skeleton-label"></div>
    </div>
  </div>
);

export default ClienteDashboard;
