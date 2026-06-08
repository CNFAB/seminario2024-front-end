// src/pages/Administrador/Garantias/GarantiasEstadisticas.jsx
import React, { useState, useEffect, useRef } from 'react';
import BtnExportarPDF from '../Reporte/Componentes/BtnExportarPDF';
import { exportarPDF } from '../Reporte/Componentes/exportarPDF';
import { Card, Row, Col, Spinner, Alert, Badge } from 'react-bootstrap';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  User,
  Smartphone,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import garantiaService from '../../../services/garantiaService';
import './GarantiasEstadisticas.module.css';

const GarantiasEstadisticas = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingTendencias, setLoadingTendencias] = useState(false);
  const [error, setError] = useState(null);
  const [garantiasPorVencer, setGarantiasPorVencer] = useState([]);
  const [filtroVencimiento, setFiltroVencimiento] = useState('7');
  const [tendencias, setTendencias] = useState([]);
  const [exportando, setExportando] = useState(false);
  const pdfRef = useRef(null);

  const [semestre, setSemestre] = useState('ene-jun');
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    cargarEstadisticas();
    cargarGarantiasPorVencer();
  }, []);

  useEffect(() => {
    cargarGarantiasPorVencer();
  }, [filtroVencimiento]);

  useEffect(() => {
    cargarTendencias();
  }, [semestre, year]);

  const cargarEstadisticas = async () => {
    try {
      const response = await garantiaService.obtenerResumen();
      const data = response.data?.data || response.data;
      setStats(data);
    } catch (err) {
      console.error('Error al cargar estadísticas:', err);
      setError('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const handleExportarPDF = async () => {
    setExportando(true);
    try {
      await exportarPDF(pdfRef, 'Reporte_Garantias', 'Reporte de Garantías');
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      alert('No se pudo generar el PDF.');
    } finally {
      setExportando(false);
    }
  };

  const cargarGarantiasPorVencer = async () => {
    try {
      const response = await garantiaService.obtenerPorVencer(filtroVencimiento);
      const data = response.data?.data || response.data;
      setGarantiasPorVencer(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar garantías por vencer:', err);
      setGarantiasPorVencer([]);
    }
  };

  const cargarTendencias = async () => {
    try {
      setLoadingTendencias(true);
      const response = await garantiaService.obtenerEvolucionMensual(semestre, year);
      const data = response.data?.data || response.data;
      setTendencias(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar tendencias:', err);
      setTendencias([]);
    } finally {
      setLoadingTendencias(false);
    }
  };

  const obtenerAñosDisponibles = () => {
    const años = [];
    const añoActual = new Date().getFullYear();
    for (let i = añoActual - 2; i <= añoActual + 1; i++) {
      años.push(i);
    }
    return años;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getDiasRestantes = (fechaFin) => {
    if (!fechaFin) return null;

    const hoy = new Date();
    const fin = new Date(fechaFin);

    // Comparar solo fechas, sin horas
    hoy.setHours(0, 0, 0, 0);
    fin.setHours(0, 0, 0, 0);

    const diffTime = fin - hoy;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Si la fecha ya pasó, retornar 0
    if (diffDays < 0) return 0;

    return diffDays;
  };

  const getBadgeColor = (diasRestantes) => {
    if (diasRestantes <= 0) return 'danger';
    if (diasRestantes <= 3) return 'danger';
    if (diasRestantes <= 7) return 'warning';
    if (diasRestantes <= 15) return 'info';
    return 'success';
  };

  const pieData = stats
    ? [
        { name: 'Activas', value: stats.activas || 0, color: '#10b981' },
        { name: 'Reclamadas', value: stats.reclamadas || 0, color: '#f59e0b' },
        { name: 'Vencidas', value: stats.vencidas || 0, color: '#ef4444' },
        { name: 'Anuladas', value: stats.anuladas || 0, color: '#6b7280' },
      ].filter((d) => d.value > 0)
    : [];

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Cargando estadísticas...</p>
      </div>
    );

  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div ref={pdfRef} className="garantias-estadisticas">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1"> Gestión de Garantías</h2>
          <p className="text-muted mb-0">
            Monitoreo y control de garantías activas y próximas a vencer
          </p>
        </div>
        <BtnExportarPDF
          onClick={handleExportarPDF}
          exportando={exportando}
          disabled={garantiasPorVencer.length === 0 && !stats}
        />
      </div>

      {/* KPIs con diseño moderno */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Total Garantías</p>
                  <h2 className="fw-bold mb-0">{stats?.total || 0}</h2>
                  <small className="text-muted">emitidas</small>
                </div>
                <div className="stats-icon bg-primary">
                  <ShieldCheck size={24} className="text-white" />
                </div>
              </div>
              <div className="mt-3">
                <div className="progress" style={{ height: '4px' }}>
                  <div className="progress-bar bg-primary" style={{ width: '100%' }}></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Activas</p>
                  <h2 className="fw-bold mb-0 text-success">{stats?.activas || 0}</h2>
                  <small className="text-muted">vigentes</small>
                </div>
                <div className="stats-icon bg-success">
                  <CheckCircle size={24} className="text-white" />
                </div>
              </div>
              <div className="mt-3">
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className="progress-bar bg-success"
                    style={{ width: `${(stats?.activas / stats?.total) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small"> Por vencer</p>
                  <h2 className="fw-bold mb-0 text-warning">{garantiasPorVencer.length}</h2>
                  <small className="text-muted">próximos {filtroVencimiento} días</small>
                </div>
                <div className="stats-icon bg-warning">
                  <Clock size={24} className="text-white" />
                </div>
              </div>
              <div className="mt-3">
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className="progress-bar bg-warning"
                    style={{
                      width: `${(garantiasPorVencer.length / (stats?.activas || 1)) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 stats-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small">Reclamos activos</p>
                  <h2 className="fw-bold mb-0 text-danger">{stats?.reclamadas || 0}</h2>
                  <small className="text-muted">en proceso</small>
                </div>
                <div className="stats-icon bg-danger">
                  <ShieldAlert size={24} className="text-white" />
                </div>
              </div>
              <div className="mt-3">
                <div className="progress" style={{ height: '4px' }}>
                  <div
                    className="progress-bar bg-danger"
                    style={{ width: `${(stats?.reclamadas / (stats?.activas || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Gráficos modernos */}
      <Row className="mb-4 g-3">
        <Col md={5}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-3">
              <h6 className="fw-bold mb-0"> Distribución de garantías</h6>
            </Card.Header>
            <Card.Body>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      formatter={(value) => <span className="small">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">Sin datos para mostrar</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={7}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-3">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h6 className="fw-bold mb-0"> Evolución mensual</h6>
                <div className="d-flex gap-2">
                  <button
                    className={`btn btn-sm ${semestre === 'ene-jun' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setSemestre('ene-jun')}
                  >
                    Ene - Jun
                  </button>
                  <button
                    className={`btn btn-sm ${semestre === 'jul-dic' ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setSemestre('jul-dic')}
                  >
                    Jul - Dic
                  </button>
                  <select
                    className="form-select form-select-sm w-auto"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    style={{ width: '80px' }}
                  >
                    {obtenerAñosDisponibles().map((año) => (
                      <option key={año} value={año}>
                        {año}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              {loadingTendencias ? (
                <div className="text-center py-5">
                  <Spinner animation="border" size="sm" />
                  <p className="mt-2 text-muted small">Cargando datos...</p>
                </div>
              ) : tendencias.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <TrendingUp size={48} className="mb-2 text-muted" />
                  <p>No hay datos para el período seleccionado</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={tendencias}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="emitidas" name="Emitidas" fill="#6366f1" radius={[6, 6, 0, 0]} />
                    <Bar
                      dataKey="reclamadas"
                      name="Reclamadas"
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar dataKey="vencidas" name="Vencidas" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de garantías por vencer */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3 border-0">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <AlertTriangle size={20} className="text-warning" />
              <h5 className="fw-bold mb-0"> Garantías por vencer</h5>
              <Badge bg="warning" className="ms-2">
                {garantiasPorVencer.length}
              </Badge>
            </div>

            <div className="d-flex gap-2">
              {['7', '15', '30'].map((dias) => (
                <button
                  key={dias}
                  className={`btn btn-sm ${filtroVencimiento === dias ? 'btn-primary' : 'btn-outline-secondary'}`}
                  onClick={() => setFiltroVencimiento(dias)}
                >
                  Próximos {dias} días
                </button>
              ))}
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {garantiasPorVencer.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <CheckCircle size={48} className="mb-2 text-success" />
              <p>No hay garantías por vencer en este período</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Cliente</th>
                    <th>Dispositivo</th>
                    <th>Fecha inicio</th>
                    <th>Fecha fin</th>
                    <th>Días restantes</th>
                  </tr>
                </thead>
                <tbody>
                  {garantiasPorVencer.map((garantia) => {
                    const diasRestantes = getDiasRestantes(garantia.fecha_fin);
                    const badgeColor = getBadgeColor(diasRestantes);

                    return (
                      <tr key={garantia.id_garantia}>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <User size={14} className="text-muted" />
                            <span>
                              {garantia.cliente_nombre} {garantia.cliente_apellido}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Smartphone size={14} className="text-muted" />
                            <span>{garantia.dispositivo_nombre}</span>
                          </div>
                        </td>
                        <td>{formatearFecha(garantia.fecha_inicio)}</td>
                        <td>{formatearFecha(garantia.fecha_fin)}</td>
                        <td>
                          <Badge bg={badgeColor}>
                            {diasRestantes <= 0 ? 'Vencida' : `${diasRestantes} días`}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default GarantiasEstadisticas;
