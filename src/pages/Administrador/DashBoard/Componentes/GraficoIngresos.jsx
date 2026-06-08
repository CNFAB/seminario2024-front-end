// pages/admin/Dashboard/componentes/GraficoIngresos.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp } from 'lucide-react';

export const GraficoIngresos = ({ datos }) => {
  // Si no hay datos, mostrar placeholder
  if (!datos || datos.length === 0) {
    return (
      <Card className="shadow-sm h-100">
        <Card.Header className="bg-white">
          <h5 className="mb-0">Ingresos Mensuales</h5>
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
          <p className="text-muted">No hay datos disponibles</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Ingresos Mensuales</h5>
        <TrendingUp size={20} className="text-primary" />
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={datos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
            <Legend />
            <Bar dataKey="ingresos" fill="#8884d8" name="Ingresos" />
          </BarChart>
        </ResponsiveContainer>
      </Card.Body>
    </Card>
  );
};