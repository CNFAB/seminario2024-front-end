// pages/admin/Dashboard/componentes/TarjetasResumen.jsx
import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { Package, DollarSign, Wrench, AlertCircle } from 'lucide-react';

export const TarjetasResumen = ({ resumen }) => {
  const tarjetas = [
    {
      titulo: 'Total Piezas',
      valor: resumen.total_piezas,
      icono: Package,
      color: 'primary',
      bg: 'bg-primary bg-opacity-10'
    },
    {
      titulo: 'Ingresos del Mes',
      valor: `$${resumen.ingresos_mes.toLocaleString()}`,
      icono: DollarSign,
      color: 'success',
      bg: 'bg-success bg-opacity-10'
    },
    {
      titulo: 'Reparaciones Hoy',
      valor: resumen.reparaciones_hoy,
      icono: Wrench,
      color: 'info',
      bg: 'bg-info bg-opacity-10'
    },
    {
      titulo: 'Stock Bajo',
      valor: resumen.stock_bajo,
      icono: AlertCircle,
      color: 'warning',
      bg: 'bg-warning bg-opacity-10'
    }
  ];

  return (
    <Row>
      {tarjetas.map((card, index) => {
        const Icono = card.icono;
        return (
          <Col key={index} md={3} className="mb-3">
            <Card className={`border-0 shadow-sm ${card.bg}`}>
              <Card.Body className="d-flex align-items-center">
                <div className={`rounded-circle p-3 me-3 bg-${card.color} bg-opacity-10`}>
                  <Icono size={24} className={`text-${card.color}`} />
                </div>
                <div>
                  <h3 className="fw-bold mb-0">{card.valor}</h3>
                  <small className="text-muted">{card.titulo}</small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
    </Row>
  );
};