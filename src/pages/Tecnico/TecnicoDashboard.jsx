// pages/Tecnico/TecnicoDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Button } from 'react-bootstrap';
import { Smartphone, Clock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import authService from '../../services/AuthService';
import { diagnosticoService } from '../../services/DiagnosticoService';
import reparacionService from '../../services/ReparacionService';
import PresupuestoService from '../../services/PresupuestoService';
import ReclamosPanelTecnico from './componente/Reclamo/ReclamosPanelTecnico';

import Header from '../../components/header/Header';
import { DispositivosTecnico } from './componente/DispositivosTecnico';
import { DiagnosticosPanelTecnico } from './componente/DiagnosticosPanelTecnico';
import { ReparacionesPanelTecnico } from './componente/ReparacionesPanelTecnico';
import { PresupuestosPanelTecnico } from './componente/PresupuestosPanelTecnico';
import { PresupuestosListaTecnico } from './componente/PresupuestosListaTecnico';
import { TabsNavigation } from './componente/TabsNavigation';

const ESTADOS_OCULTOS_DIAGNOSTICOS = [
  'ESPERANDO_APROBACION',
  'RECHAZADO',
  'APROBADO',
  'TERMINADO',
  'LISTO_PARA_RETIRAR',
  'PAGADO',
];

// ✅ Estados que NO queremos mostrar en reparaciones
const ESTADOS_OCULTOS_REPARACIONES = [
  'ESPERANDO_DIAGNOSTICO',
  'LISTO_PARA_RETIRAR',
  'PAGADO',
  'TERMINADO',
  'CANCELADO',
  'RECHAZADO',
];

// ✅ Estados que NO queremos mostrar en presupuestos
const ESTADOS_OCULTOS_PRESUPUESTOS = ['APROBADO', 'RECHAZADO'];

const TecnicoDashboard = () => {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);

  // ✅ Estados para DIAGNÓSTICOS
  const [dispositivosDiag, setDispositivosDiag] = useState([]);
  const [dispositivoSeleccionadoDiag, setDispositivoSeleccionadoDiag] = useState(null);

  // ✅ Estados para REPARACIONES
  const [dispositivosRep, setDispositivosRep] = useState([]);
  const [dispositivoSeleccionadoRep, setDispositivoSeleccionadoRep] = useState(null);

  // ✅ Estados para PRESUPUESTOS
  const [presupuestosList, setPresupuestosList] = useState([]);
  const [presupuestoSeleccionado, setPresupuestoSeleccionado] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabActivo, setTabActivo] = useState('diagnosticos');
  const [countDiag, setCountDiag] = useState(0);
  const [countRep, setCountRep] = useState(0);
  const [countPres, setCountPres] = useState(0);
  const [countReclamos, setCountReclamos] = useState(0);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/Home');
      return;
    }
    if (!user.roles?.es_tecnico) {
      navigate('/Home');
      return;
    }
    setCurrentUser(user);
  }, [navigate]);

  useEffect(() => {
    if (!currentUser) return;

    cargarDispositivosDiagnosticos(currentUser.id_usuario);
    cargarDispositivosReparaciones(currentUser.id_usuario);
    cargarPresupuestos(currentUser.id_usuario);
  }, [currentUser]);

  const cargarDispositivosDiagnosticos = async (tecnicoId) => {
    setLoading(true);
    setError(null);
    try {
      const dispositivosMap = new Map();

      try {
        const resDiag = await diagnosticoService.obtenerPorTecnico(tecnicoId);
        const diagnosticos = resDiag?.data?.data || resDiag?.data || [];

        console.log('📋 Todos los diagnósticos:', diagnosticos);

        const diagnosticosActivos = diagnosticos.filter(
          (diag) => !ESTADOS_OCULTOS_DIAGNOSTICOS.includes(diag.estado)
        );

        console.log('📋 Diagnósticos activos:', diagnosticosActivos);

        diagnosticosActivos.forEach((diag) => {
          const disp = diag.ingreso?.dispositivo;
          if (disp && !dispositivosMap.has(disp.id_dispositivo)) {
            dispositivosMap.set(disp.id_dispositivo, {
              ...disp,
              id_ingreso: diag.id_ingreso,
              ingreso: diag.ingreso,
              estado_actual: diag.estado,
            });
          }
        });
      } catch (e) {
        console.warn('Error cargando diagnósticos:', e);
      }

      const lista = Array.from(dispositivosMap.values());
      console.log('📱 Dispositivos con diagnósticos activos:', lista);

      setDispositivosDiag(lista);
      if (lista.length > 0) {
        setDispositivoSeleccionadoDiag(lista[0]);
        setCountDiag(lista.length);
      } else {
        setDispositivoSeleccionadoDiag(null);
        setCountDiag(0);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        authService.logout();
        navigate('/Home');
      } else {
        setError('Error al cargar los dispositivos con diagnósticos pendientes.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cargar dispositivos para REPARACIONES
  const cargarDispositivosReparaciones = async (tecnicoId) => {
    setLoading(true);
    setError(null);
    try {
      const dispositivosMap = new Map();

      try {
        const resRep = await reparacionService.obtenerPorTecnico(tecnicoId);
        const reparaciones = resRep?.data?.data || resRep?.data || [];

        console.log('🔧 Todas las reparaciones:', reparaciones);

        const ESTADOS_ACTIVOS = [
          'PENDIENTE',
          'EN_REPARACION',
          'ESPERANDO_PIEZA',
          'SIN_REPARACIONES',
        ];

        const reparacionesPorDispositivo = new Map();

        reparaciones.forEach((rep) => {
          const disp = rep.ingreso?.dispositivo || rep.diagnostico?.ingreso?.dispositivo;
          const ingresoId = rep.id_ingreso || rep.diagnostico?.ingreso?.id_ingreso;
          const ingreso = rep.ingreso || rep.diagnostico?.ingreso;

          if (!disp) return;

          const dispositivoId = disp.id_dispositivo;
          if (!reparacionesPorDispositivo.has(dispositivoId)) {
            reparacionesPorDispositivo.set(dispositivoId, {
              dispositivo: disp,
              reparaciones: [],
              id_ingreso: ingresoId,
              ingreso: ingreso,
            });
          }

          reparacionesPorDispositivo.get(dispositivoId).reparaciones.push(rep);
        });

        const dispositivosConReparacionesActivas = [];

        for (const [id, data] of reparacionesPorDispositivo.entries()) {
          const tieneReparacionActiva = data.reparaciones.some((rep) =>
            ESTADOS_ACTIVOS.includes(rep.estado_general)
          );

          if (tieneReparacionActiva) {
            dispositivosConReparacionesActivas.push({
              ...data.dispositivo,
              id_ingreso: data.id_ingreso,
              ingreso: data.ingreso,
              reparaciones_activas: data.reparaciones.filter((r) =>
                ESTADOS_ACTIVOS.includes(r.estado_general)
              ),
            });
          }
        }

        console.log(
          '📱 Dispositivos con reparaciones activas:',
          dispositivosConReparacionesActivas
        );

        setDispositivosRep(dispositivosConReparacionesActivas);
        if (dispositivosConReparacionesActivas.length > 0) {
          setDispositivoSeleccionadoRep(dispositivosConReparacionesActivas[0]);
          setCountRep(dispositivosConReparacionesActivas.length);
        } else {
          setDispositivoSeleccionadoRep(null);
          setCountRep(0);
        }
      } catch (e) {
        console.error('Error cargando reparaciones:', e);
        setError('Error al cargar las reparaciones');
      }
    } catch (err) {
      console.error('Error cargando reparaciones:', err);
      setError('Error al cargar los dispositivos con reparaciones activas.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cargar presupuestos para el técnico
  const cargarPresupuestos = async (tecnicoId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await PresupuestoService.getPresupuestosPendientesPorTecnico(tecnicoId);

      if (result.success) {
        const presupuestos = result.data?.data || result.data || [];

        const presupuestosActivos = presupuestos.filter(
          (p) => !ESTADOS_OCULTOS_PRESUPUESTOS.includes(p.estado)
        );

        console.log('💰 Presupuestos activos:', presupuestosActivos);

        setPresupuestosList(presupuestosActivos);
        setCountPres(presupuestosActivos.length);

        if (presupuestosActivos.length > 0) {
          setPresupuestoSeleccionado(presupuestosActivos[0]);
        } else {
          setPresupuestoSeleccionado(null);
        }
      } else {
        setError(result.message || 'Error al cargar presupuestos');
      }
    } catch (err) {
      console.error('Error cargando presupuestos:', err);
      setError('Error al cargar los presupuestos pendientes.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/Home');
  };

  // ✅ Obtener la lista según la pestaña activa
  const getDispositivosActuales = () => {
    if (tabActivo === 'diagnosticos') return dispositivosDiag;
    if (tabActivo === 'reparaciones') return dispositivosRep;
    if (tabActivo === 'presupuestos') return presupuestosList;
    return []; // Para reclamos no usa lista lateral
  };

  const getSeleccionadoActual = () => {
    if (tabActivo === 'diagnosticos') return dispositivoSeleccionadoDiag;
    if (tabActivo === 'reparaciones') return dispositivoSeleccionadoRep;
    if (tabActivo === 'presupuestos') return presupuestoSeleccionado;
    return null; // Para reclamos no aplica
  };

  const getIngresoId = () => {
    const seleccionado = getSeleccionadoActual();
    if (tabActivo === 'presupuestos') {
      return seleccionado?.id_ingreso || seleccionado?.ingreso?.id_ingreso;
    }
    return seleccionado?.id_ingreso || seleccionado?.ingreso?.id_ingreso || null;
  };

  // ✅ Estadísticas según pestaña activa
  const itemsActuales = getDispositivosActuales();
  const totalItems = tabActivo === 'reclamos' ? countReclamos : itemsActuales.length;

  const enProceso =
    tabActivo === 'presupuestos'
      ? itemsActuales.filter((p) => p.estado === 'PENDIENTE').length
      : tabActivo === 'reclamos'
        ? 0
        : itemsActuales.filter(
            (d) => d.estado_actual === 'EN_REPARACION' || d.estado_actual === 'APROBADO'
          ).length;

  if (loading) {
    return (
      <>
        <Header
          user={currentUser}
          rolKey="es_tecnico"
          onLogout={handleLogout}
          profilePath="/perfil"
        />
        <Container
          fluid
          className="d-flex justify-content-center align-items-center bg-light"
          style={{ minHeight: 'calc(100vh - 64px)' }}
        >
          <div className="text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">
              {tabActivo === 'diagnosticos' && 'Cargando diagnósticos...'}
              {tabActivo === 'reparaciones' && 'Cargando reparaciones...'}
              {tabActivo === 'presupuestos' && 'Cargando presupuestos...'}
              {tabActivo === 'reclamos' && 'Cargando reclamos...'}
            </p>
          </div>
        </Container>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header
          user={currentUser}
          rolKey="es_tecnico"
          onLogout={handleLogout}
          profilePath="/perfil"
        />
        <Container fluid className="py-5 bg-light" style={{ minHeight: 'calc(100vh - 64px)' }}>
          <Alert variant="danger" className="w-50 mx-auto text-center">
            <Alert.Heading>Error</Alert.Heading>
            <p>{error}</p>
            <Button
              variant="primary"
              onClick={() => {
                if (tabActivo === 'diagnosticos') {
                  cargarDispositivosDiagnosticos(currentUser?.id_usuario);
                } else if (tabActivo === 'reparaciones') {
                  cargarDispositivosReparaciones(currentUser?.id_usuario);
                } else if (tabActivo === 'presupuestos') {
                  cargarPresupuestos(currentUser?.id_usuario);
                }
              }}
            >
              Reintentar
            </Button>
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <Header
        user={currentUser}
        rolKey="es_tecnico"
        onLogout={handleLogout}
        profilePath="/perfil"
      />

      <Container fluid className="p-4 bg-light" style={{ minHeight: 'calc(100vh - 64px)' }}>
        {/* Stats */}
        <Row className="mb-4 g-3">
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center gap-3">
                <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                  <Smartphone size={22} className="text-primary" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0">{totalItems}</h3>
                  <small className="text-muted">
                    {tabActivo === 'diagnosticos' && 'Dispositivos con diagnósticos activos'}
                    {tabActivo === 'reparaciones' && 'Dispositivos en reparación'}
                    {tabActivo === 'presupuestos' && 'Presupuestos pendientes'}
                    {tabActivo === 'reclamos' && 'Reclamos asignados'}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center gap-3">
                <div className="bg-warning bg-opacity-10 p-3 rounded-3">
                  <Clock size={22} className="text-warning" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0">{enProceso}</h3>
                  <small className="text-muted">
                    {tabActivo === 'presupuestos'
                      ? 'Pendientes'
                      : tabActivo === 'reclamos'
                        ? 'En revisión'
                        : 'En proceso'}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="d-flex align-items-center gap-3">
                <div className="bg-success bg-opacity-10 p-3 rounded-3">
                  <CheckCircle size={22} className="text-success" />
                </div>
                <div>
                  <h3 className="fw-bold mb-0">
                    {tabActivo === 'presupuestos'
                      ? itemsActuales.filter((p) => p.estado === 'APROBADO').length
                      : tabActivo === 'reclamos'
                        ? 0
                        : itemsActuales.filter(
                            (d) =>
                              d.estado_actual === 'TERMINADO' ||
                              d.estado_actual === 'LISTO_PARA_RETIRAR' ||
                              d.estado_actual === 'PAGADO'
                          ).length}
                  </h3>
                  <small className="text-muted">
                    {tabActivo === 'presupuestos'
                      ? 'Aprobados'
                      : tabActivo === 'reclamos'
                        ? 'Completados'
                        : 'Completados'}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <TabsNavigation
          activeTab={tabActivo}
          onTabChange={setTabActivo}
          counts={{
            diagnosticos: countDiag,
            reparaciones: countRep,
            presupuestos: countPres,
            reclamos: countReclamos,
          }}
        />

        <Row className="g-4">
          <Col md={4}>
            {tabActivo === 'presupuestos' ? (
              <PresupuestosListaTecnico
                presupuestos={presupuestosList}
                seleccionado={presupuestoSeleccionado}
                onSelect={setPresupuestoSeleccionado}
              />
            ) : tabActivo !== 'reclamos' ? (
              <DispositivosTecnico
                dispositivos={getDispositivosActuales()}
                seleccionado={getSeleccionadoActual()}
                onSelect={(disp) => {
                  if (tabActivo === 'diagnosticos') {
                    setDispositivoSeleccionadoDiag(disp);
                  } else if (tabActivo === 'reparaciones') {
                    setDispositivoSeleccionadoRep(disp);
                  }
                }}
              />
            ) : (
              <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                  <Smartphone size={48} className="text-muted mb-3 opacity-50" />
                  <h6 className="text-muted">Reclamos de Garantía</h6>
                  <p className="small text-muted mb-0">
                    Gestione los reclamos desde el panel derecho
                  </p>
                </Card.Body>
              </Card>
            )}
          </Col>

          <Col md={8}>
            {tabActivo === 'reclamos' ? (
              <ReclamosPanelTecnico onCountChange={setCountReclamos} />
            ) : !getSeleccionadoActual() ? (
              <Card className="border-0 shadow-sm text-center p-5">
                <Smartphone size={48} className="text-muted mb-3 mx-auto" />
                <h5 className="text-muted">
                  {tabActivo === 'diagnosticos' && 'No hay diagnósticos pendientes'}
                  {tabActivo === 'reparaciones' && 'No hay reparaciones activas'}
                  {tabActivo === 'presupuestos' && 'No hay presupuestos pendientes'}
                </h5>
                <p className="text-muted small">
                  {tabActivo === 'diagnosticos'
                    ? 'Todos los diagnósticos han sido aprobados, rechazados o completados'
                    : tabActivo === 'reparaciones'
                      ? 'Las reparaciones terminadas, pagadas o canceladas no se muestran'
                      : 'Los presupuestos aprobados o rechazados no se muestran'}
                </p>
              </Card>
            ) : tabActivo === 'diagnosticos' ? (
              <DiagnosticosPanelTecnico
                dispositivo={getSeleccionadoActual()}
                currentUser={currentUser}
                onDiagnosticoCreado={() => cargarDispositivosDiagnosticos(currentUser?.id_usuario)}
                onDiagnosticoActualizado={() =>
                  cargarDispositivosDiagnosticos(currentUser?.id_usuario)
                }
                onCountChange={setCountDiag}
              />
            ) : tabActivo === 'reparaciones' ? (
              <ReparacionesPanelTecnico
                ingresoId={getIngresoId()}
                currentUser={currentUser}
                dispositivoInfo={{
                  marca:
                    getSeleccionadoActual()?.modelo?.marca?.marca ||
                    getSeleccionadoActual()?.marca ||
                    '',
                  modelo:
                    getSeleccionadoActual()?.modelo?.nombre_modelo ||
                    getSeleccionadoActual()?.modelo ||
                    '',
                }}
                onCountChange={setCountRep}
                onDispositivosActualizar={() => {
                  // ✅ En lugar de recargar todo, eliminar el dispositivo actual de la lista
                  const dispositivoActual = getSeleccionadoActual();
                  if (dispositivoActual) {
                    // Eliminar el dispositivo de la lista
                    setDispositivosRep((prev) =>
                      prev.filter((d) => d.id_dispositivo !== dispositivoActual.id_dispositivo)
                    );
                    // Si hay más dispositivos, seleccionar el primero
                    if (dispositivosRep.length > 1) {
                      const nuevoSeleccionado = dispositivosRep.find(
                        (d) => d.id_dispositivo !== dispositivoActual.id_dispositivo
                      );
                      if (nuevoSeleccionado) {
                        setDispositivoSeleccionadoRep(nuevoSeleccionado);
                      }
                    } else {
                      setDispositivoSeleccionadoRep(null);
                    }
                    // Actualizar el contador
                    setCountRep((prev) => Math.max(0, prev - 1));
                  }
                }}
              />
            ) : (
              <PresupuestosPanelTecnico
                presupuesto={presupuestoSeleccionado}
                currentUser={currentUser}
                onPresupuestoActualizado={() => cargarPresupuestos(currentUser?.id_usuario)}
                onCountChange={setCountPres}
              />
            )}
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default TecnicoDashboard;
