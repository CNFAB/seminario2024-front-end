// src/pages/Testimonios/TestimoniosPage.jsx
import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import {
  ChevronLeft,
  ChevronRight,
  Quote,
  Star,
  MessageCircle,
  Mail,
  Users,
  Award,
  ThumbsUp,
} from 'lucide-react';
import testimonioService from '../../../../services/testimonioService';
import NavbarC from '../NavbarC';
import styles from './css/Testimonios.module.css';

const TestimoniosPage = () => {
  const [testimonios, setTestimonios] = useState([]);
  const [indexActual, setIndexActual] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTestimonios();
  }, []);

  const cargarTestimonios = async () => {
    try {
      setLoading(true);
      const response = await testimonioService.obtenerAprobados();

      if (Array.isArray(response)) {
        setTestimonios(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setTestimonios(response.data);
      } else if (response && Array.isArray(response)) {
        setTestimonios(response);
      } else {
        setTestimonios([]);
      }
    } catch (error) {
      console.error('Error al cargar testimonios:', error);
      setTestimonios([]);
    } finally {
      setLoading(false);
    }
  };

  const testimonioAnterior = () => {
    setIndexActual((prev) => (prev === 0 ? testimonios.length - 1 : prev - 1));
  };

  const testimonioSiguiente = () => {
    setIndexActual((prev) => (prev === testimonios.length - 1 ? 0 : prev + 1));
  };

  const renderStars = (calificacion) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={18}
          className={`${styles.testimonioStar} ${i <= calificacion ? styles.filled : styles.empty}`}
          fill={i <= calificacion ? '#f59e0b' : 'none'}
        />
      );
    }
    return stars;
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Recientemente';
    const fechaObj = new Date(fecha);
    const ahora = new Date();
    const diffDias = Math.floor((ahora - fechaObj) / (1000 * 60 * 60 * 24));

    if (diffDias === 0) return 'Hoy';
    if (diffDias === 1) return 'Hace 1 día';
    return `Hace ${diffDias} días`;
  };

  const estadisticas = {
    total: testimonios.length,
    promedio:
      testimonios.length > 0
        ? (
            testimonios.reduce((acc, t) => acc + (t.calificacion || 5), 0) / testimonios.length
          ).toFixed(1)
        : 0,
    cincoEstrellas: testimonios.filter((t) => (t.calificacion || 5) === 5).length,
    cuatroEstrellas: testimonios.filter((t) => (t.calificacion || 5) === 4).length,
  };

  if (loading) {
    return (
      <div className={styles.testimoniosPage}>
        <NavbarC />
        <div className={styles.testimoniosLoading}>
          <div className={styles.testimoniosSpinner}></div>
          <p>Cargando opiniones de clientes...</p>
        </div>
      </div>
    );
  }

  if (testimonios.length === 0) {
    return (
      <div className={styles.testimoniosPage}>
        <NavbarC />
        <div className={styles.testimoniosHeroWrapper}>
          <div className={styles.heroOverlay}></div>
          <Container className={styles.testimoniosHeroContent}>
            <Row className="align-items-center min-vh-50">
              <Col lg={8} className="mx-auto text-center">
                <div className="mb-4">
                  <span
                    className="text-uppercase fw-semibold letter-spacing px-3 py-2 rounded-pill"
                    style={{
                      background: 'rgba(255, 107, 53, 0.15)',
                      border: '1px solid rgba(255, 107, 53, 0.3)',
                      color: '#ff6b35',
                    }}
                  >
                    OPINIONEsSasdfasdf
                  </span>
                </div>
                <h1 className="display-3 fw-bold mb-4 tech-text-white">
                  Opiniones de <span className="tech-text-primary">nuestros clientes</span>
                </h1>
                <p className="lead mb-4 tech-text-muted">
                  Pronto encontrarás las experiencias de quienes confiaron en ReparaTech
                </p>
              </Col>
            </Row>
          </Container>
        </div>
      </div>
    );
  }

  const testimonioActual = testimonios[indexActual];

  return (
    <div className={styles.testimoniosPage}>
      <NavbarC />

      {/* Hero Section */}
      <div className={styles.testimoniosHeroWrapper}>
        <div className={styles.heroOverlay}></div>
        <Container className={styles.testimoniosHeroContent}>
          <Row className="align-items-center min-vh-40">
            <Col lg={8} className="mx-auto text-center">
              <div className="mb-4">
                <span
                  className="text-uppercase fw-semibold letter-spacing px-3 py-2 rounded-pill"
                  style={{
                    background: 'rgba(255, 107, 53, 0.15)',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    color: '#ff6b35',
                  }}
                >
                  OPINIONES
                </span>
              </div>
              <h1 className="display-3 fw-bold mb-4 tech-text-white">
                Lo que dicen <span className="tech-text-primary">nuestros clientes</span>
              </h1>
              <p className="lead mb-4 tech-text-muted">
                Experiencias reales de personas que confiaron en ReparaTech
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Estadísticas */}
      <Container className="py-5">
        <Row className="g-4 text-center">
          <Col md={3} sm={6}>
            <div className={styles.testimonioStatsCard}>
              <div className={styles.statsIcon}>
                <Star size={36} fill="#f59e0b" stroke="#f59e0b" />
              </div>
              <h2 className={styles.statsValue}>{estadisticas.promedio}</h2>
              <p className={styles.statsLabel}>Calificación promedio</p>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className={styles.testimonioStatsCard}>
              <div className={styles.statsIcon}>
                <Users size={36} />
              </div>
              <h2 className={styles.statsValue}>{estadisticas.total}</h2>
              <p className={styles.statsLabel}>Clientes satisfechos</p>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className={styles.testimonioStatsCard}>
              <div className={styles.statsIcon}>
                <Award size={36} />
              </div>
              <h2 className={styles.statsValue}>{estadisticas.cincoEstrellas}</h2>
              <p className={styles.statsLabel}>Calificaciones 5 estrellas</p>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className={styles.testimonioStatsCard}>
              <div className={styles.statsIcon}>
                <ThumbsUp size={36} />
              </div>
              <h2 className={styles.statsValue}>100%</h2>
              <p className={styles.statsLabel}>Recomiendan nuestro servicio</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Carrusel de Testimonios */}
      <Container className="py-4">
        <div className={styles.testimoniosCarruselWrapper}>
          <button
            className={styles.carruselNavBtn}
            onClick={testimonioAnterior}
            aria-label="Anterior"
          >
            <ChevronLeft size={28} />
          </button>

          <div className={styles.testimoniosCarruselContent}>
            <div className={styles.testimonioCard}>
              <div className={styles.testimonioQuoteIcon}>
                <Quote size={48} />
              </div>

              <div className={styles.testimonioStars}>
                {renderStars(testimonioActual.calificacion || 5)}
              </div>

              <p className={styles.testimonioComentario}>
                "{testimonioActual.comentario || 'Excelente servicio, muy recomendable.'}"
              </p>

              <div className={styles.testimonioCliente}>
                <strong>{testimonioActual.cliente_nombre || 'Cliente'}</strong>
                <div className={styles.testimonioDispositivo}>
                  📱 {testimonioActual.dispositivo || 'Dispositivo reparado'}
                </div>
                <div className={styles.testimonioFecha}>
                  {formatearFecha(testimonioActual.fecha)}
                </div>
              </div>
            </div>
          </div>

          <button
            className={styles.carruselNavBtn}
            onClick={testimonioSiguiente}
            aria-label="Siguiente"
          >
            <ChevronRight size={28} />
          </button>
        </div>

        <div className={styles.testimoniosIndicadores}>
          {testimonios.map((_, idx) => (
            <button
              key={idx}
              className={`${styles.testimonioDot} ${idx === indexActual ? styles.testimonioDotActive : ''}`}
              onClick={() => setIndexActual(idx)}
            />
          ))}
        </div>

        <div className={styles.testimoniosCounter}>
          {indexActual + 1} de {testimonios.length}
        </div>
      </Container>

      {/* CTA Final */}
      <Container className="py-5">
        <div className={styles.testimoniosCta}>
          <h3>¿Ya usaste nuestros servicios?</h3>
          <p>Compartí tu experiencia y ayudanos a seguir mejorando</p>
          <div className={styles.testimoniosCtaButtons}>
            <a
              href="https://wa.me/5493878254930?text=Hola!%20Quiero%20dejar%20mi%20opinión%20sobre%20ReparaTech"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.testimonioBtnWhatsapp}
            >
              <MessageCircle size={18} />
              Dejar opinión en WhatsApp
            </a>
            <a
              href="mailto:reparatech@tudominio.com?subject=Opinión%20sobre%20ReparaTech"
              className={styles.testimonioBtnEmail}
            >
              <Mail size={18} />
              Enviar por email
            </a>
          </div>
        </div>
      </Container>

      {/* Footer */}
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
};

export default TestimoniosPage;
