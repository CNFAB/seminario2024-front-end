// components/layout/Header.jsx
import React, { useState, useEffect } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Menu, X, Wrench, User, LogOut } from 'lucide-react';

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ============================================
  // DETECTAR SCROLL PARA CAMBIAR ESTILOS
  // ============================================
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // ============================================
  // FUNCIÓN PARA CERRAR SESIÓN
  // ============================================
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <>
      <Navbar 
        expand="lg" 
        fixed="top"
        className={`
          transition-all duration-300 py-3
          ${scrolled 
            ? 'bg-white shadow-lg py-2' 
            : 'bg-primary'  // ← Color de fondo cuando no hay scroll
          }
        `}
        style={{
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
        }}
      >
        <Container fluid className="px-4">
          {/* LOGO - Siempre visible */}
          <Navbar.Brand href="/" className="d-flex align-items-center">
            <Wrench 
              size={28} 
              className={scrolled ? 'text-primary' : 'text-white'} 
            />
            <span 
              className={`ms-2 fw-bold fs-4 ${
                scrolled ? 'text-dark' : 'text-white'
              }`}
            >
              ReparaTech
            </span>
          </Navbar.Brand>

          {/* BOTÓN MENÚ MÓVIL */}
          <Navbar.Toggle 
            aria-controls="basic-navbar-nav"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="border-0"
          >
            {mobileMenuOpen ? (
              <X size={24} className={scrolled ? 'text-dark' : 'text-white'} />
            ) : (
              <Menu size={24} className={scrolled ? 'text-dark' : 'text-white'} />
            )}
          </Navbar.Toggle>

          {/* MENÚ DE NAVEGACIÓN - Siempre visible en desktop */}
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              {/* LINKS DE NAVEGACIÓN - Siempre visibles */}
              <Nav.Link 
                href="/dashboard" 
                className={`mx-2 fw-medium ${
                  scrolled ? 'text-dark' : 'text-white'
                } hover-opacity`}
              >
                Dashboard
              </Nav.Link>
              
              <Nav.Link 
                href="/reparaciones" 
                className={`mx-2 fw-medium ${
                  scrolled ? 'text-dark' : 'text-white'
                } hover-opacity`}
              >
                Reparaciones
              </Nav.Link>
              
              <Nav.Link 
                href="/clientes" 
                className={`mx-2 fw-medium ${
                  scrolled ? 'text-dark' : 'text-white'
                } hover-opacity`}
              >
                Clientes
              </Nav.Link>

              {/* BOTONES DE USUARIO - Con ancho fijo para que no se muevan */}
              <div className="d-flex flex-column flex-lg-row align-items-stretch align-items-lg-center gap-2 mt-2 mt-lg-0 ms-lg-4">
                <Button
                  variant={scrolled ? "outline-primary" : "outline-light"}
                  size="sm"
                  className="d-flex align-items-center justify-content-center px-3"
                  style={{ minWidth: '110px' }} // Ancho fijo
                >
                  <User size={16} className="me-1" />
                  <span>Mi Cuenta</span>
                </Button>
                
                <Button
                  variant={scrolled ? "outline-danger" : "outline-light"}
                  size="sm"
                  className="d-flex align-items-center justify-content-center px-3"
                  onClick={handleLogout}
                  style={{ minWidth: '90px' }} // Ancho fijo
                >
                  <LogOut size={16} className="me-1" />
                  <span>Salir</span>
                </Button>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* ESPACIADOR PARA COMPENSAR EL HEADER FIJO */}
      <div style={{ height: '80px' }} />

      {/* ESTILOS ADICIONALES */}
      <style>{`
        .hover-opacity {
          transition: opacity 0.3s ease;
        }
        .hover-opacity:hover {
          opacity: 0.8;
        }
        
        /* Transición suave del navbar */
        .navbar {
          transition: all 0.3s ease;
          border-bottom: ${scrolled ? '1px solid rgba(0,0,0,0.1)' : 'none'};
        }
        
        /* Estilos para móvil */
        @media (max-width: 991px) {
          .navbar-collapse {
            background: white;
            padding: 1rem;
            border-radius: 12px;
            margin-top: 1rem;
            box-shadow: 0 8px 20px rgba(0,0,0,0.15);
          }
          
          .navbar-collapse .nav-link {
            color: #333 !important;
            padding: 0.75rem 1rem;
            border-radius: 8px;
            transition: background 0.2s;
          }
          
          .navbar-collapse .nav-link:hover {
            background: #f8f9fa;
          }
          
          /* Botones en móvil con ancho completo */
          .d-flex.flex-column {
            margin-top: 0.5rem;
            gap: 0.5rem;
          }
          
          .d-flex.flex-column .btn {
            width: 100% !important;
            min-width: 100% !important;
            justify-content: center;
          }
        }

        /* Efecto de sombra al hacer scroll */
        .bg-white.shadow-lg {
          box-shadow: 0 4px 20px rgba(0,0,0,0.1) !important;
        }
      `}</style>
    </>
  );
};