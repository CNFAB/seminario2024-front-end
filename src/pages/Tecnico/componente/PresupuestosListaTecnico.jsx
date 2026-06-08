// pages/Tecnico/componente/PresupuestosListaTecnico.jsx
import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { DollarSign, Clock } from 'lucide-react';

export const PresupuestosListaTecnico = ({ presupuestos, seleccionado, onSelect }) => {
  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'PENDIENTE':
        return <Badge bg="warning"><Clock size={12} /> Pendiente</Badge>;
      case 'APROBADO':
        return <Badge bg="success">Aprobado</Badge>;
      case 'RECHAZADO':
        return <Badge bg="danger">Rechazado</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-white border-0 pt-4 pb-2">
        <h5 className="mb-0">💰 Presupuestos Pendientes</h5>
        <small className="text-muted">{presupuestos.length} presupuesto(s)</small>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="list-group list-group-flush">
          {presupuestos.map((pres) => (
            <button
              key={pres.id_presupuesto}
              className={`list-group-item list-group-item-action border-0 p-3 ${
                seleccionado?.id_presupuesto === pres.id_presupuesto ? 'bg-primary bg-opacity-10' : ''
              }`}
              onClick={() => onSelect(pres)}
            >
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <strong className="d-block">
                    {pres.ingreso?.dispositivo?.modelo?.marca?.marca} {pres.ingreso?.dispositivo?.modelo?.nombre_modelo}
                  </ strong>
                  <small className="text-muted">
                  </small>
                </div>
                {getEstadoBadge(pres.estado)}
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <small className="text-muted">
                  {pres.ingreso?.dispositivo?.cliente?.nombre} {pres.ingreso?.dispositivo?.cliente?.apellido}
                </small>
                <strong className="text-primary">${parseFloat(pres.total_estimado).toFixed(2)}</strong>
              </div>
              {pres.comentario_cliente && (
                <div className="mt-2 p-2 bg-light rounded">
                  <small className="text-muted">
                    <strong>📝 Cliente dice:</strong> {pres.comentario_cliente}
                  </small>
                </div>
              )}
            </button>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
};