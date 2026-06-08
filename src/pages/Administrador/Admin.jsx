import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Admin.css';
import Inventario from './inventario/Inventario';
import Personal from './Personal/Personal';
import AdminDispositivo from './dispositvos/AdminDispositivo';
import Sidebar from '../../components/Sidebar';
import PerfilAdmin from './PerfilAdmin/PerfilAdmin';
import Dashboard from './Dashboard/Dashboard';
import Marcas from './Marca/Marca';
import Modelos from './modelo/Modelo';
import Compatibilidad from './Compatibilidad/Compatibilidad';
import Categoria from './Categoria/Categoria';
import Reportes from './Reporte/Reportes';
import ReporteRecepcion from './Reporte/Recepcionista/ReporteRecepcion';
import ReporteDiagnosticos from './Reporte/Tecnico/ReporteDiagnosticos';
import ReporteReparaciones from './Reporte/Tecnico/ReporteReparaciones';
import TestimoniosAdmin from './Testimonios/TestimoniosAdmin';
import ControlCalidadGarantias from './Garantia/ControlCalidadGarantias';
import ReportePiezas from './Reporte/Piezas/ReportePiezas';
import GananciasGenerales from './Reporte/GananciasGenerales/GananciasGenerales';
import EstadisticasGlobales from './Reporte/EstadisticasGlobales/EstadisticasGlobales';

import Header from '../../components/header/Header';
import ReasignacionDiagnostico from './ReasignacionTecnica/ReasignacionDiagnostico';
import ReasignacionReparacion from './ReasignacionTecnica/ReasignacionReparacion';
import GarantiasLista from './Garantia/GarantiasLista';
import ReclamosLista from './Garantia/ReclamosLista';
import GarantiasEstadisticas from './Garantia/GarantiasEstadisticas';
import authService from '../../services/AuthService'; // Importar authService

const Admin = () => {
  const navigate = useNavigate();
  const [seccionActiva, setSeccionActiva] = useState('dashboard'); // Cambiado a dashboard por defecto
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const titulos = {
    personal: 'Gestión de Personal',
    dispositivos: 'Dispositivos',
    inventario: 'Inventario',
    reportes: 'Reportes',
    configuracion: 'Configuración',
    marcas: 'Marcas',
    modelos: 'Modelos',
    categoria: 'Categoría',
    dashboard: 'Dashboard',
    compatibilidad: 'Compatibilidad',
    reasignacionarDiagnostico: 'Reasignar Diagnósticos',
    reasignacionReparacion: 'Reasignar Reparaciones',
    garantiasLista: 'Lista de Garantías',
    reclamosLista: 'Reclamos de Garantía',
    garantiasEstadisticas: 'Estadísticas de Garantías',
    controlCalidad: 'Control de Calidad - Garantías',
    reportesRecepcion: 'Reporte de Atenciones',
    reportesDiagnosticos: 'Reporte de Diagnósticos',
    reportesReparaciones: 'Reporte de Reparaciones',
    testimoniosAdmin: 'Moderar Testimonios',
    reportesPiezas: 'Reporte de Piezas',
    gananciasGenerales: 'Ganancias Generales',
    estadisticasGlobales: ' Estadísticas Globales - Comparativas de Reparaciones',
  };

  // Cargar datos del usuario desde localStorage al iniciar
  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const usuario = authService.getCurrentUser();

        if (!usuario) {
          // No hay usuario logueado, redirigir al login
          navigate('/home');
          return;
        }

        // Verificar si tiene rol de administrador
        if (!usuario.roles?.es_administrador) {
          // Si no es admin, redirigir según su rol
          if (usuario.roles?.es_tecnico) {
            navigate('/tecnico');
          } else if (usuario.roles?.es_recepcionista) {
            navigate('/recepcionista');
          } else {
            navigate('/cliente');
          }
          return;
        }

        setUserData(usuario);
      } catch (error) {
        console.error('Error al cargar usuario:', error);
        navigate('Home');
      } finally {
        setLoading(false);
      }
    };

    cargarUsuario();
  }, [navigate]);

  // Función para cerrar sesión
  const handleLogout = () => {
    authService.logout(); // Usar el método logout del servicio
    navigate('Home');
  };

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'personal':
        return <Personal />;
      case 'inventario':
        return <Inventario />;
      case 'dispositivos':
        return <AdminDispositivo />;
      case 'dashboard':
        return <Dashboard />;
      case 'reportes':
        return <Reportes />;
      case 'reportesRecepcion':
        return <ReporteRecepcion />;
      case 'reportesDiagnosticos':
        return <ReporteDiagnosticos />;
      case 'reportesReparaciones':
        return <ReporteReparaciones />;
      case 'marcas':
        return <Marcas />;
      case 'modelos':
        return <Modelos />;
      case 'categoria':
        return <Categoria />;
      case 'compatibilidad':
        return <Compatibilidad />;
      case 'reasignacionDiagnostico':
        return <ReasignacionDiagnostico />;
      case 'reasignacionReparacion':
        return <ReasignacionReparacion />;
      case 'garantias-lista':
        return <GarantiasLista />;
      case 'reclamos-lista':
        return <ReclamosLista />;
      case 'control-calidad':
        return <ControlCalidadGarantias />;
      case 'garantias-estadisticas':
        return <GarantiasEstadisticas />;
      case 'testimoniosAdmin':
        return <TestimoniosAdmin />;
      case 'reportes-piezas':
        return <ReportePiezas />;
      case 'gananciasGenerales':
        return <GananciasGenerales />;
      case 'estadisticasGlobales':
        return <EstadisticasGlobales />;

      default:
        return <Dashboard />;
    }
  };

  // Mostrar loading mientras se carga
  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p style={{ marginTop: 12, color: '#6C757D' }}>Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  // Si no hay datos de usuario, no renderizar nada (ya debería haber redirigido)
  if (!userData) return null;

  return (
    <div className="admin-shell">
      <div className="admin-sidebar">
        <Sidebar seccionActiva={seccionActiva} setSeccionActiva={setSeccionActiva} />
      </div>
      <div className="admin-right">
        {/* Header con datos reales del usuario */}
        <Header
          user={{
            nombre: userData.nombre,
            apellido: userData.apellido,
            correo: userData.correo,
            roles: userData.roles,
          }}
          rolKey="es_administrador"
          onLogout={handleLogout}
          profilePath="/perfil" // Ajusta según tu ruta de perfil
        />

        <div className="admin-content">{renderSeccion()}</div>
      </div>
    </div>
  );
};

export default Admin;
