// pages/admin/Dashboard/componentes/PiezasMasUsadas.jsx
import React from 'react';
import { Card, Table, Badge, ProgressBar } from 'react-bootstrap';
import { Package } from 'lucide-react';

export const PiezasMasUsadas = ({ piezas }) => {
  // Encontrar el máximo para las barras de progreso
  const maxUsos = piezas.length > 0 
    ? Math.max(...piezas.map(p => p.veces_usada || p.usos || 0)) 
    : 0;

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Piezas Más Usadas</h5>
        <Package size={20} className="text-success" />
      </Card.Header>
      <Card.Body>
        {piezas.length > 0 ? (
          <Table hover>
            <thead>
              <tr>
                <th>Pieza</th>
                <th>Categoría</th>
                <th className="text-center">Usos</th>
              </tr>
            </thead>
            <tbody>
              {piezas.map((pieza, index) => {
                const usos = pieza.veces_usada || pieza.usos || 0;
                const porcentaje = maxUsos > 0 ? (usos / maxUsos) * 100 : 0;
                
                return (
                  <tr key={index}>
                    <td>
                      <strong>{pieza.nombre_pieza}</strong>
                    </td>
                    <td>
                      <Badge bg="secondary">
                        {pieza.categoria || 'General'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="me-2" style={{ minWidth: '40px' }}>
                          {usos}
                        </div>
                        <ProgressBar 
                          now={porcentaje} 
                          variant="success" 
                          style={{ height: '8px', width: '100px' }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <p className="text-muted text-center py-4">No hay datos de piezas</p>
        )}
      </Card.Body>
    </Card>
  );
};