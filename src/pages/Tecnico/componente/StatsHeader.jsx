// components/tecnico/StatsHeader.jsx
import React from 'react';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { Wrench, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function StatsHeader({ totalDiagnosticos, enReparacion, completados }) {
  const fechaActual = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="border-0 shadow-sm mb-4">
      <Card.Body className="p-4">
        <Row className="align-items-center">
          <Col md={8}>
            <div className="d-flex align-items-center gap-3">
              <div className="bg-primary bg-opacity-10 p-3 rounded-3">
                <Wrench size={32} className="text-primary" />
              </div>
              <div>
                <h1 className="display-6 fw-bold mb-1">Panel de Técnicos</h1>
                <p className="text-muted mb-0 d-flex align-items-center gap-2">
                  <Clock size={16} />
                  {fechaActual}
                </p>
              </div>
            </div>
          </Col>
          <Col md={4}>
            <div className="d-flex justify-content-end gap-2 flex-wrap">
              <Badge bg="primary" className="p-2 px-3 rounded-pill">
                <Clipboard size={14} className="me-1" />
                {totalDiagnosticos} Diagnósticos
              </Badge>
              <Badge bg="warning" className="p-2 px-3 rounded-pill">
                <AlertCircle size={14} className="me-1" />
                {enReparacion} En reparación
              </Badge>
              <Badge bg="success" className="p-2 px-3 rounded-pill">
                <CheckCircle size={14} className="me-1" />
                {completados} Completados
              </Badge>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}