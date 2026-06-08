// pages/admin/Dashboard/componentes/Cargando.jsx
import React from 'react';
import { Container, Spinner } from 'react-bootstrap';

export const Cargando = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="text-center">
        <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 text-muted">Cargando dashboard...</p>
      </div>
    </Container>
  );
};