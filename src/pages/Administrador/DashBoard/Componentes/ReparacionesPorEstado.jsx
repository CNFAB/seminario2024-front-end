// pages/admin/Dashboard/componentes/ReparacionesPorEstado.jsx
import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Activity } from 'lucide-react';

const COLORS = {
  'PENDIENTE': '#ffc107',
  'EN_REPARACION': '#0dcaf0',
  'TERMINADO': '#198754',
  'CANCELADO': '#dc3545',
  'ESPERANDO_PIEZA': '#6c757d'
};

const getEstadoLabel = (estado) => {
  const labels = {
    'PENDIENTE': 'Pendiente',
    'EN_REPARACION': 'En reparación',
    'TERMINADO': 'Terminado',
    'CANCELADO': 'Cancelado',
    'ESPERANDO_PIEZA': 'Esperando pieza'
  };
  return labels[estado] || estado;
};

export const ReparacionesPorEstado = ({ datos }) => {
  // Si no hay datos, mostrar placeholder
  if (!datos || datos.length === 0) {
    return (
      <Card className="shadow-sm h-100">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Reparaciones por Estado</h5>
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <p className="text-muted">No hay datos disponibles</p>
        </Card.Body>
      </Card>
    );
  }

  const total = datos.reduce((acc, item) => acc + (item.total || 0), 0);

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Reparaciones por Estado</h5>
        <Activity size={20} className="text-info" />
      </Card.Header>
      <Card.Body>
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={datos}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="total"
                nameKey="estado"
                label={({ estado, percent }) => `${getEstadoLabel(estado)} ${(percent * 100).toFixed(0)}%`}
              >
                {datos.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.estado] || '#8884d8'} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => [`${value} reparaciones`, 'Cantidad']}
                labelFormatter={(label) => getEstadoLabel(label)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ListGroup variant="flush" className="mt-3">
          {datos.map((item, index) => (
            <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center px-0">
              <div className="d-flex align-items-center">
                <div 
                  style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: COLORS[item.estado] || '#8884d8',
                    borderRadius: '50%',
                    marginRight: '8px'
                  }} 
                />
                <span>{getEstadoLabel(item.estado)}</span>
              </div>
              <div>
                <Badge bg="secondary" pill className="me-2">
                  {item.total}
                </Badge>
                <small className="text-muted">
                  {((item.total / total) * 100).toFixed(1)}%
                </small>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};