// Home.jsx
import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button } from 'react-bootstrap';
import celuImage from '../../assets/celu.jpeg';
import '../../style/themes.css';
import {
  Phone,
  Clock,
  Users,
  PlayCircle,
  ArrowRight,
  Wrench,
  Shield,
  Headphones,
  Calendar,
  Star,
  Award,
  Settings,
  CheckCircle,
} from 'lucide-react';
import NavbarC from '../Home/Componente/NavbarC';
import '../Home/css/Home.css';

function Home() {
  return (
    <div className="App">
      {/* Hero Section con imagen de fondo */}
      <div className="hero-wrapper">
        <div className="hero-overlay"></div>
        <NavbarC />
        {/*marcosmontolla@gmail.com*/}
        <Container className="hero-content py-5">
          <Row className="align-items-center min-vh-100">
            <Col lg={6} className="mb-5 mb-lg-0">
              <div className="mb-4">
                <span className="text-uppercase tech-text-white fw-semibold letter-spacing tech-bg-blur px-3 py-2 rounded-pill">
                  BIENVENIDO A ReparaTech
                </span>
              </div>

              <h1 className="display-3 fw-bold mb-4 tech-text-white">
                No lo demores,
                <br />
                <span className="tech-text-primary">repara hoy</span>
              </h1>

              <p className="lead mb-4 tech-text-muted">
                No dejes que los problemas técnicos te frenen. En ReparaTech, estamos aquí para dar
                nueva vida a tus dispositivos, rápida y eficientemente.
              </p>

              {/* Espacio para teléfono con estilo del tema */}
              <div className="tech-border-left tech-bg-blur p-3 rounded-3 mb-4 d-flex align-items-center">
                <div className="tech-stats-icon me-3">
                  <Phone size={24} />
                </div>
                <div>
                  <span className="tech-text-white small">LLÁMANOS AHORA</span>
                  <h3 className="mb-0 fw-bold tech-text-white">+34 900 123 456</h3>
                </div>
              </div>

              <Row className="mb-4">
                <Col xs={6} md={3} className="mb-3">
                  <div className="tech-stats-card text-center">
                    <Clock className="tech-card-light mb-2" size={24} />
                    <div className="fw-bold fs-4 tech-text-white">18:00</div>
                    <small className="tech-text-white">Lunes, 8 Nov</small>
                  </div>
                </Col>
                <Col xs={6} md={3} className="mb-3">
                  <div className="tech-stats-card text-center">
                    <Users className="tech-card-light mb-2" size={24} />
                    <div className="fw-bold fs-4 tech-text-white">34.5k+</div>
                    <small className="tech-text-white">CLIENTES EN NY</small>
                  </div>
                </Col>
              </Row>
            </Col>

            <Col lg={6} className="d-flex justify-content-end">
              <img
                src={celuImage}
                alt="Técnico reparando dispositivo"
                className="img-fluid rounded-4 tech-hover-scale"
                style={{
                  width: '90%',
                  maxWidth: '700px',
                  height: 'auto',
                  borderRadius: '20px',
                }}
              />
            </Col>
          </Row>
        </Container>
      </div>

      {/* Sección de características con estilo del tema */}
      <Container className="py-5">
        <Row className="mt-5 pt-4">
          <Col md={4} className="mb-4">
            <div className="tech-card-light d-flex align-items-center p-4">
              <div className="tech-stats-icon me-3">
                <Headphones size={24} />
              </div>
              <div>
                <h5 className="fw-bold mb-1" style={{ color: 'var(--primary-dark)' }}>
                  Soporte 24/7
                </h5>
                <p className="tech-text-muted-50 mb-0">Llámanos cualquier día</p>
              </div>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="tech-card-light d-flex align-items-center p-4">
              <div className="tech-stats-icon me-3">
                <Settings size={24} />
              </div>
              <div>
                <h5 className="fw-bold mb-1" style={{ color: 'var(--primary-dark)' }}>
                  Técnicos expertos
                </h5>
                <p className="tech-text-muted-50 mb-0">Certificados y experimentados</p>
              </div>
            </div>
          </Col>
          <Col md={4} className="mb-4">
            <div className="tech-card-light d-flex align-items-center p-4">
              <div className="tech-stats-icon me-3">
                <Shield size={24} />
              </div>
              <div>
                <h5 className="fw-bold mb-1" style={{ color: 'var(--primary-dark)' }}>
                  Garantía incluida
                </h5>
                <p className="tech-text-muted-50 mb-0">Todos nuestros servicios</p>
              </div>
            </div>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={6} className="mb-3">
            <div className="tech-stats-card d-flex align-items-center">
              <div className="tech-stats-icon me-3">
                <Award size={40} />
              </div>
              <div>
                <h4 className="fw-bold mb-1 tech-text-black">+5000</h4>
                <p className="tech-text-muted-50 mb-0 tech-text-black">Dispositivos reparados</p>
              </div>
            </div>
          </Col>
          <Col md={6} className="mb-3">
            <div className="tech-stats-card d-flex align-items-center">
              <div className="tech-stats-icon me-3">
                <Star size={40} />
              </div>
              <div>
                <h4 className="fw-bold mb-1 tech-text-black">98%</h4>
                <p className="tech-text-muted-50 mb-0 ">Clientes satisfechos</p>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Footer con estilo del tema */}
      <footer className="tech-footer mt-5 py-4">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
              <span className="fw-bold tech-text-black">ReparaTech</span>{' '}
              <span className="tech-text-muted">
                © 2026 - Donde la tecnología se encuentra con profesionales
              </span>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <span className="me-3 tech-text-muted">Política de privacidad</span>
              <span className="tech-text-muted">Términos de uso</span>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default Home;
