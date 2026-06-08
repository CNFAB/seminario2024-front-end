// pages/admin/Dashboard/componentes/TopTecnicos.jsx
import React from 'react';
import { Card, Table, Badge } from 'react-bootstrap';
import { Award } from 'lucide-react';

export const TopTecnicos = ({ tecnicos }) => {
  const getMedalla = (index) => {
    switch(index) {
      case 0: return <Badge bg="warning" className="me-2">🥇</Badge>;
      case 1: return <Badge bg="secondary" className="me-2">🥈</Badge>;
      case 2: return <Badge bg="bronce" className="me-2" style={{background: '#cd7f32'}}>🥉</Badge>;
      default: return null;
    }
  };

  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="bg-white d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Top Técnicos</h5>
        <Award size={20} className="text-warning" />
      </Card.Header>
      <Card.Body>
        {tecnicos.length > 0 ? (
          <Table hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Técnico</th>
                <th className="text-center">Reparaciones</th>
              </tr>
            </thead>
            <tbody>
              {tecnicos.map((tecnico, index) => (
                <tr key={index}>
                  <td>{getMedalla(index) || index + 1}</td>
                  <td>
                    <strong>{tecnico.nombre} {tecnico.apellido}</strong>
                  </td>
                  <td className="text-center">
                    <Badge bg="primary" pill>
                      {tecnico.reparaciones || tecnico.total_reparaciones}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p className="text-muted text-center py-4">No hay datos de técnicos</p>
        )}
      </Card.Body>
    </Card>
  );
};