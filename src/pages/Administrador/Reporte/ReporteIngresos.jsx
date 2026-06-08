
import React, { useState } from 'react';
import { 
  Card, Form, Row, Col, Button, 
  Table, Alert, Spinner, Badge 
} from 'react-bootstrap';
import { 
  Download, TrendingUp, DollarSign, 
  Users, Activity, Calendar 
} from 'lucide-react';
import { reporteService } from '../../../services/reporteService';
import { GraficoLineas } from './componentes/GraficoLineas';

export const ReporteIngresos = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reporte, setReporte] = useState(null);

  // Fechas por defecto (últimos 30 días)
  const hoy = new Date();
  const hace30Dias = new Date();
  hace30Dias.setDate(hoy.getDate() - 30);

  const [fechas, setFechas] = useState({
    fecha_inicio: hace30Dias.toISOString().split('T')[0],
    fecha_fin: hoy.toISOString().split('T')[0]
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFechas(prev => ({ ...prev, [name]: value }));
    setReporte(null);
    setError(null);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!fechas.fecha_inicio || !fechas.fecha_fin) {
    setError('Debe seleccionar ambas fechas');
    return;
  }

  setLoading(true);
  setError(null);
  
  try {
    const response = await reporteService.obtenerReporteIngresos(fechas);
    console.log('📦 Respuesta completa:', response);
    
    // ✅ VERSIÓN FLEXIBLE - Acepta diferentes formatos de respuesta
    if (response && response.data) {
      // Si viene { data: {...} } sin success
      setReporte(response.data);
    } else if (response && response.success === true && response.data) {
      // Si viene { success: true, data: {...} }
      setReporte(response.data);
    } else if (response && typeof response === 'object' && response.periodo) {
      // Si viene directamente el objeto de datos
      setReporte(response);
    } else {
      console.error('Formato de respuesta no reconocido:', response);
      setError('Error al procesar la respuesta del servidor');
    }
  } catch (err) {
    console.error('❌ Error completo:', err);
    setError(err.response?.data?.message || err.message || 'Error de conexión');
  } finally {
    setLoading(false);
  }
};

  const handleExportPDF = () => {
    alert('Función de exportación PDF próximamente');
  };

  return (
    <div>
      {/* Filtros */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="align-items-end">
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="fw-bold">Fecha inicio</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_inicio"
                    value={fechas.fecha_inicio}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={5}>
                <Form.Group>
                  <Form.Label className="fw-bold">Fecha fin</Form.Label>
                  <Form.Control
                    type="date"
                    name="fecha_fin"
                    value={fechas.fecha_fin}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100"
                  disabled={loading}
                >
                  {loading ? 'Generando...' : 'Generar'}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Error */}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Resultados */}
      {reporte && (
        <>
          {/* Botón exportar */}
          <div className="d-flex justify-content-end mb-3">
            <Button variant="success" onClick={handleExportPDF}>
              <Download size={16} className="me-1" />
              Exportar PDF
            </Button>
          </div>

          {/* Información del período */}
          <Card className="shadow-sm mb-4">
            <Card.Body className="bg-light">
              <div className="d-flex align-items-center">
                <Calendar size={20} className="text-primary me-2" />
                <span className="fw-bold">
                  Período: {reporte.periodo.inicio} al {reporte.periodo.fin} ({reporte.periodo.dias} días)
                </span>
              </div>
            </Card.Body>
          </Card>

          {/* Cards de resumen */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="shadow-sm border-0 bg-primary bg-opacity-10">
                <Card.Body className="d-flex align-items-center">
                  <DollarSign size={32} className="text-primary me-3" />
                  <div>
                    <h4 className="fw-bold mb-0">
                      {reporteService.formatearMoneda(reporte.resumen.total_ingresos)}
                    </h4>
                    <small className="text-muted">Total ingresos</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm border-0 bg-success bg-opacity-10">
                <Card.Body className="d-flex align-items-center">
                  <Activity size={32} className="text-success me-3" />
                  <div>
                    <h4 className="fw-bold mb-0">{reporte.resumen.total_reparaciones}</h4>
                    <small className="text-muted">Reparaciones</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm border-0 bg-info bg-opacity-10">
                <Card.Body className="d-flex align-items-center">
                  <TrendingUp size={32} className="text-info me-3" />
                  <div>
                    <h4 className="fw-bold mb-0">
                      {reporteService.formatearMoneda(reporte.resumen.promedio_por_reparacion)}
                    </h4>
                    <small className="text-muted">Promedio x reparación</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="shadow-sm border-0 bg-warning bg-opacity-10">
                <Card.Body className="d-flex align-items-center">
                  <Users size={32} className="text-warning me-3" />
                  <div>
                    <h4 className="fw-bold mb-0">{reporte.resumen.tecnicos_activos}</h4>
                    <small className="text-muted">Técnicos activos</small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Gráfica de ingresos por día */}
          {reporte.ingresos_por_dia && reporte.ingresos_por_dia.length > 0 && (
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-white">
                <h6 className="mb-0">Ingresos diarios</h6>
              </Card.Header>
              <Card.Body>
                <GraficoLineas 
                  datos={reporte.ingresos_por_dia.map(d => ({
                    fecha: d.fecha,
                    valor: d.total,
                    etiqueta: 'Ingresos'
                  }))}
                />
              </Card.Body>
            </Card>
          )}

          {/* Tabla de ingresos por técnico */}
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-white">
              <h6 className="mb-0">Ingresos por Técnico</h6>
            </Card.Header>
            <Card.Body>
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Técnico</th>
                    <th className="text-center">Reparaciones</th>
                    <th className="text-end">Total ingresos</th>
                    <th className="text-end">Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {reporte.ingresos_por_tecnico.length > 0 ? (
                    reporte.ingresos_por_tecnico.map((tecnico, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{tecnico.nombre} {tecnico.apellido}</strong>
                        </td>
                        <td className="text-center">
                          <Badge bg="info" pill>
                            {tecnico.total_reparaciones}
                          </Badge>
                        </td>
                        <td className="text-end fw-bold text-success">
                          {reporteService.formatearMoneda(tecnico.total_ingresos)}
                        </td>
                        <td className="text-end text-muted">
                          {reporteService.formatearMoneda(tecnico.promedio)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-3">
                        No hay datos de técnicos en este período
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* Comparativa con período anterior */}
          {reporte.comparativa && (
            <Card className="shadow-sm">
              <Card.Header className="bg-white">
                <h6 className="mb-0">Comparativa con período anterior</h6>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <h6>Período anterior</h6>
                      <p className="mb-1">
                        <small>
                          {reporte.comparativa.periodo_anterior.inicio} al {reporte.comparativa.periodo_anterior.fin}
                        </small>
                      </p>
                      <p className="mb-0 fw-bold">
                        Ingresos: {reporteService.formatearMoneda(reporte.comparativa.periodo_anterior.ingresos)}
                      </p>
                      <p className="mb-0 text-muted small">
                        Reparaciones: {reporte.comparativa.periodo_anterior.reparaciones}
                      </p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="p-3 bg-light rounded">
                      <h6>Variación</h6>
                      <p className={`mb-0 fw-bold fs-4 ${reporte.comparativa.variacion > 0 ? 'text-success' : 'text-danger'}`}>
                        {reporte.comparativa.variacion > 0 ? '↑' : '↓'} {Math.abs(reporte.comparativa.variacion)}%
                      </p>
                      <small className="text-muted">
                        Tendencia {reporte.comparativa.tendencia}
                      </small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}
        </>
      )}
    </div>
  );
};