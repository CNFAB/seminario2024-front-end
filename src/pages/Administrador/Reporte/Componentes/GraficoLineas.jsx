// pages/admin/Reportes/componentes/GraficoLineas.jsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const GraficoLineas = ({ datos }) => {
  if (!datos || datos.length === 0) {
    return (
      <div className="text-center py-4 text-muted">
        No hay datos para mostrar
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={datos} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="fecha" />
        <YAxis />
        <Tooltip formatter={(value) => value.toLocaleString()} />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="valor" 
          name={datos[0]?.etiqueta || 'Valor'} 
          stroke="#8884d8" 
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};