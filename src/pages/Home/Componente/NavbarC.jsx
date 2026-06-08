// components/NavbarC.jsx
import React, { useState } from 'react';
import { Container, Navbar, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; // ← Importar Link y useNavigate
import LoginModal from './LoginModal';
import '../css/nabvarC.css';

const NavbarC = () => {
  const [showLogin, setShowLogin] = useState(false);
  const navigate = useNavigate();

  const scrollToTestimonios = () => {
    // Si estamos en home, hacer scroll a la sección
    if (window.location.pathname === '/home') {
      const testimoniosSection = document.getElementById('testimonios');
      if (testimoniosSection) {
        testimoniosSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Si no estamos en home, ir a home y luego hacer scroll
      navigate('/home');
      setTimeout(() => {
        const testimoniosSection = document.getElementById('testimonios');
        if (testimoniosSection) {
          testimoniosSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  return (
    <>
      <Navbar
        expand="lg"
        className="py-3 navbar-custom"
        style={{
          backgroundColor: '#000000',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          zIndex: 1000,
          borderBottom: '1px solid #333',
        }}
      >
        <Container>
          <Link to="/home" className="fw-bold fs-3 text-white text-decoration-none">
            Repara<span className="naranja">Tech</span>
          </Link>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className="bg-white" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mx-auto">
              <Link to="/About" className="mx-2 nav-link-custom text-white text-decoration-none">
                ¿ Quienes somos?
              </Link>
              {/*  <Link to="/precio" className="mx-2 nav-link-custom text-white text-decoration-none">
                Pricing
              </Link>*/}

              <Link
                to="/testimonios"
                className="mx-2 nav-link-custom text-white text-decoration-none"
              >
                Testimonios
              </Link>

              <Link to="/nuevo" className="mx-2 nav-link-custom text-white text-decoration-none">
                Noticias
              </Link>
              <Link to="/services" className="mx-2 nav-link-custom text-white text-decoration-none">
                Servicios
              </Link>
              <Link to="/contact" className="mx-2 nav-link-custom text-white text-decoration-none">
                Contactanos
              </Link>
            </Nav>
            <div className="d-flex gap-2">
              <Button
                variant="outline-light"
                className="rounded-pill px-4 btn-custom me-2"
                onClick={() => setShowLogin(true)}
              >
                Login
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <LoginModal show={showLogin} onHide={() => setShowLogin(false)} />
    </>
  );
};

export default NavbarC;
