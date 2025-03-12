import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';

const Reception = () => {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container fluid>
        <Navbar.Brand href="#">Reparaciones</Navbar.Brand>
        <div className="d-flex align-items-center ms-auto">
          <span className="me-3 text-white">
            Cliente: <strong>Juan Pérez</strong>
          </span>
          <Button variant="danger" size="sm">Cerrar Sesión</Button>
        </div>
      </Container>
    </Navbar>
  );
};

export default Reception;


