// src/pages/Administrador/Garantias/ControlCalidadGarantias.jsx
import React, { useState, useEffect, useRef } from 'react'; // ✅ Agregar useRef
import { Card, Row, Col, Spinner, Alert, Badge, Table } from 'react-bootstrap';
import BtnExportarPDF from '../Reporte/Componentes/BtnExportarPDF'; // ✅ IMPORTAR
import { exportarPDF } from '../Reporte/Componentes/exportarPDF'; // ✅ IMPORTAR
import {
  DollarSign,
  AlertCircle,
  TrendingDown,
  PieChart as PieChartIcon,
  Users,
  Smartphone,
  Wrench,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import garantiaService from '../../../services/garantiaService';
import './ControlCalidadGarantias.css';

const ControlCalidadGarantias = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportando, setExportando] = useState(false); // ✅ NUEVO
  const pdfRef = useRef(null); // ✅ NUEVO

  useEffect(() => {
    cargarData();
  }, []);

  const cargarData = async () => {
    try {
      setLoading(true);
      const response = await garantiaService.obtenerControlCalidad();
      const responseData = response.data?.data || response.data;
      setData(responseData);
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar datos de control de calidad');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NUEVA FUNCIÓN PARA EXPORTAR PDF
  const handleExportarPDF = async () => {
    setExportando(true);
    try {
      await exportarPDF(pdfRef, 'Control_Calidad_Garantias', 'Control de Calidad - Garantías');
    } catch (err) {
      console.error('Error al exportar PDF:', err);
      alert('No se pudo generar el PDF.');
    } finally {
      setExportando(false);
    }
  };

  // Colores para el gráfico de piezas
  const COLORS = [
    '#6366f1',
    '#f59e0b',
    '#ef4444',
    '#10b981',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#6b7280',
  ];

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Cargando datos de control de calidad...</p>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  if (!data) return null;

  const { resumen, costo_por_mes, piezas_mas_fallan, modelos_mas_fallan, clientes_reincidentes } =
    data;

  return (
    <div ref={pdfRef} className="control-calidad-container">
      {' '}
      {/* ✅ AGREGAR ref */}
      {/* Header con botón de exportación */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1"> Control de Calidad - Garantías</h2>
          <p className="text-muted mb-0">
            Análisis de costos, piezas más falladas y clientes reincidentes
          </p>
        </div>
        <BtnExportarPDF onClick={handleExportarPDF} exportando={exportando} disabled={!data} />
      </div>
      {/* Tarjetas de resumen */}
      <Row className="mb-4 g-3">
        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 calidad-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small"> Costo total perdido</p>
                  <h2 className="fw-bold mb-0 text-danger">
                    ${resumen?.costo_total_perdido?.toLocaleString() || 0}
                  </h2>
                  <small className="text-muted">en garantías</small>
                </div>
                <div className="calidad-icon bg-danger">
                  <DollarSign size={24} className="text-white" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 calidad-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small"> Promedio por garantía</p>
                  <h2 className="fw-bold mb-0 text-warning">
                    ${resumen?.costo_promedio_por_garantia?.toLocaleString() || 0}
                  </h2>
                  <small className="text-muted">costo promedio</small>
                </div>
                <div className="calidad-icon bg-warning">
                  <TrendingDown size={24} className="text-white" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 calidad-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small"> Total garantías</p>
                  <h2 className="fw-bold mb-0 text-primary">
                    {resumen?.total_reparaciones_garantia || 0}
                  </h2>
                  <small className="text-muted">reparaciones en garantía</small>
                </div>
                <div className="calidad-icon bg-primary">
                  <Wrench size={24} className="text-white" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="border-0 shadow-sm h-100 calidad-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <p className="text-muted mb-1 small"> Alta reincidencia</p>
                  <h2 className="fw-bold mb-0 text-danger">
                    {resumen?.clientes_con_alta_reincidencia || 0}
                  </h2>
                  <small className="text-muted">clientes con 3+ garantías</small>
                </div>
                <div className="calidad-icon bg-danger">
                  <Users size={24} className="text-white" />
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Gráfico de costo por mes */}
      <Row className="mb-4 g-3">
        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-3">
              <h6 className="fw-bold mb-0"> Evolución del costo por mes</h6>
            </Card.Header>
            <Card.Body>
              {costo_por_mes?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={costo_por_mes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                    <Bar dataKey="costo" name="Costo" fill="#ef4444" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">Sin datos</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-3">
              <h6 className="fw-bold mb-0"> Top 5 piezas que más fallan</h6>
            </Card.Header>
            <Card.Body>
              {piezas_mas_fallan?.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={piezas_mas_fallan.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="cantidad_fallas"
                      label={({ nombre_pieza, percent }) =>
                        `${nombre_pieza} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {piezas_mas_fallan.slice(0, 5).map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">Sin datos</div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Tabla de piezas que más fallan */}
      <Row className="mb-4 g-3">
        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3 border-0">
              <h6 className="fw-bold mb-0"> Piezas que más fallan</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Pieza</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Costo total</th>
                  </tr>
                </thead>
                <tbody>
                  {piezas_mas_fallan?.map((pieza, idx) => (
                    <tr key={pieza.id_pieza}>
                      <td>{idx + 1}</td>
                      <td className="fw-semibold">{pieza.nombre_pieza}</td>
                      <td>{pieza.categoria}</td>
                      <td>
                        <Badge bg="danger" className="rounded-pill">
                          {pieza.cantidad_fallas}
                        </Badge>
                      </td>
                      <td>${pieza.costo_total?.toLocaleString()}</td>
                    </tr>
                  ))}
                  {(!piezas_mas_fallan || piezas_mas_fallan.length === 0) && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        Sin datos
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white py-3 border-0">
              <h6 className="fw-bold mb-0"> Modelos que más fallan</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Marca</th>
                    <th>Modelo</th>
                    <th>Fallas</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {modelos_mas_fallan?.map((modelo, idx) => (
                    <tr key={modelo.id_modelo}>
                      <td>{idx + 1}</td>
                      <td>{modelo.marca}</td>
                      <td className="fw-semibold">{modelo.modelo}</td>
                      <td>
                        <Badge bg="warning" className="rounded-pill">
                          {modelo.cantidad_fallas}
                        </Badge>
                      </td>
                      <td>{modelo.porcentaje}%</td>
                    </tr>
                  ))}
                  {(!modelos_mas_fallan || modelos_mas_fallan.length === 0) && (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        Sin datos
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Tabla de clientes reincidentes */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3 border-0">
          <h6 className="fw-bold mb-0"> Clientes con más garantías (reincidencia)</h6>
        </Card.Header>
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Correo</th>
                <th>Teléfono</th>
                <th>Total garantías</th>
                <th>Nivel</th>
              </tr>
            </thead>
            <tbody>
              {clientes_reincidentes?.map((cliente, idx) => (
                <tr key={cliente.id_cliente}>
                  <td>{idx + 1}</td>
                  <td className="fw-semibold">
                    {cliente.nombre} {cliente.apellido}
                  </td>
                  <td>{cliente.correo}</td>
                  <td>{cliente.telefono}</td>
                  <td>
                    <Badge
                      bg={
                        cliente.total_garantias >= 3
                          ? 'danger'
                          : cliente.total_garantias >= 2
                            ? 'warning'
                            : 'secondary'
                      }
                      className="rounded-pill"
                    >
                      {cliente.total_garantias}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      bg={
                        cliente.nivel_reincidencia === 'ALTA'
                          ? 'danger'
                          : cliente.nivel_reincidencia === 'MEDIA'
                            ? 'warning'
                            : 'success'
                      }
                    >
                      {cliente.nivel_reincidencia}
                    </Badge>
                  </td>
                </tr>
              ))}
              {(!clientes_reincidentes || clientes_reincidentes.length === 0) && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    Sin datos
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ControlCalidadGarantias;
