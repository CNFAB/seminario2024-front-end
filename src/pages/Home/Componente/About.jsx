// pages/About/About.jsx
import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button } from 'react-bootstrap';
import {
  Shield,
  Users,
  Trophy,
  Clock,
  CheckCircle,
  Heart,
  Mail,
  Wrench,
  Headphones,
  Settings,
  MessageCircle,
  X,
  Send,
} from 'lucide-react';
import NavbarC from './NavbarC';
import '../../../style/themes.css'; // ← Estilos globales (tech-text-white, etc.)
import styles from './About.module.css'; // ← Estilos propios de About

function About() {
  // ... (todo el estado del modal igual que antes)
  const [showModal, setShowModal] = useState(false);
  const [modalFormData, setModalFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
  });
  const [modalEnviado, setModalEnviado] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');

  const EMAILJS_SERVICE_ID = 'service_ljls08d';
  const EMAILJS_TEMPLATE_ID = 'template_tois80a';
  const EMAILJS_PUBLIC_KEY = '404qej1lJI0ONMgi2';

  const handleModalChange = (e) => {
    setModalFormData({ ...modalFormData, [e.target.name]: e.target.value });
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError('');

    const templateParams = {
      to_name: 'ReparaTech',
      to_email: 'youlost.end5@gmail.com',
      from_name: modalFormData.nombre,
      from_email: modalFormData.email,
      from_phone: modalFormData.telefono,
      message: modalFormData.mensaje,
      reply_to: modalFormData.email,
      source: 'Desde modal en Sobre Nosotros',
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setModalEnviado(true);
      setModalFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
      setTimeout(() => {
        setModalEnviado(false);
        setShowModal(false);
      }, 2000);
    } catch (err) {
      console.error('Error EmailJS:', err);
      setModalError('❌ Error al enviar. Intenta de nuevo.');
    } finally {
      setModalLoading(false);
    }
  };

  const abrirModal = () => {
    setModalFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
    setModalError('');
    setModalEnviado(false);
    setShowModal(true);
  };

  return (
    <div className={styles.aboutPage}>
      {/* Hero Section */}
      <div className={styles.aboutHeroWrapper}>
        <div className={styles.heroOverlay}></div>
        <NavbarC />

        <Container className={styles.aboutHeroContent}>
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
                  CONOCE NUESTRA HISTORIA
                </span>
              </div>

              <h1 className="display-3 fw-bold mb-4 tech-text-white">
                Sobre <span className="tech-text-primary">ReparaTech</span>
              </h1>

              <p className="lead mb-4 tech-text-muted" style={{ fontSize: '1.2rem' }}>
                Somos una empresa dedicada a la reparación de dispositivos tecnológicos,
                comprometidos con la excelencia y la satisfacción de nuestros clientes.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Misión y Visión */}
      <Container className="py-5">
        <Row className="g-4">
          <Col md={6}>
            <div className={`${styles.missionCard} text-center p-4 h-100`}>
              <div className={`${styles.missionIcon} mb-3`}>
                <Shield size={48} className="tech-text-white" />
              </div>
              <h3 className="tech-text-white mb-3">Nuestra Misión</h3>
              <p className="tech-text-white">
                Brindar servicios de reparación tecnológica de alta calidad, con rapidez y
                eficiencia, garantizando la satisfacción total de nuestros clientes y la
                recuperación óptima de sus dispositivos.
              </p>
            </div>
          </Col>
          <Col md={6}>
            <div className={`${styles.visionCard} text-center p-4 h-100`}>
              <div className={`${styles.visionIcon} mb-3`}>
                <Trophy size={48} className="tech-text-white" />
              </div>
              <h3 className="tech-text-white mb-3">Nuestra Visión</h3>
              <p className="tech-text-muted">
                Ser líderes en el mercado de reparación tecnológica, reconocidos por nuestra
                innovación, calidad de servicio y compromiso con el medio ambiente a través del
                reciclaje responsable de dispositivos.
              </p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Valores */}
      <section className={styles.valuesSection}>
        <Container className="py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-info mb-3">
              Nuestros <span className={styles.naranja}>Valores</span>
            </h2>
            <p className="tech-text-muted">Los principios que nos guían cada día</p>
          </div>

          <Row className="g-4">
            <Col md={3} sm={6}>
              <div className={`${styles.valueCard} text-center p-4`}>
                <div className={`${styles.valueIcon} mb-3`}>
                  <Heart size={40} className="tech-text-white" />
                </div>
                <h5 className="text-info mb-2">Compromiso</h5>
                <p className="small tech-text-muted">Con nuestros clientes y la calidad</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className={`${styles.valueCard} text-center p-4`}>
                <div className={`${styles.valueIcon} mb-3`}>
                  <Clock size={40} className="tech-text-white" />
                </div>
                <h5 className="text-info mb-2">Rapidez</h5>
                <p className="small tech-text-muted">Entregas en tiempo récord</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className={`${styles.valueCard} text-center p-4`}>
                <div className={`${styles.valueIcon} mb-3`}>
                  <Shield size={40} className="tech-text-white" />
                </div>
                <h5 className="text-info mb-2">Confianza</h5>
                <p className="small tech-text-muted">Servicios garantizados</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className={`${styles.valueCard} text-center p-4`}>
                <div className={`${styles.valueIcon} mb-3`}>
                  <Users size={40} className="tech-text-white" />
                </div>
                <h5 className="text-info mb-2">Profesionalismo</h5>
                <p className="small tech-text-muted">Técnicos certificados</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Estadísticas */}
      <Container className="py-5">
        <Row className="g-4 text-center">
          <Col md={3} sm={6}>
            <div className={`${styles.statsCard} p-4`}>
              <h2 className="display-4 fw-bold tech-text-white">+5000</h2>
              <p className="text-info mb-0">Dispositivos Reparados</p>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className={`${styles.statsCard} p-4`}>
              <h2 className="display-4 fw-bold tech-text-white">+10</h2>
              <p className="text-info mb-0">Años de Experiencia</p>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className={`${styles.statsCard} p-4`}>
              <h2 className="display-4 fw-bold tech-text-white">98%</h2>
              <p className="text-info mb-0">Clientes Satisfechos</p>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className={`${styles.statsCard} p-4`}>
              <h2 className="display-4 fw-bold tech-text-white">+15</h2>
              <p className="text-info mb-0">Técnicos Expertos</p>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Equipo */}
      <section className={styles.teamSection}>
        <Container className="py-5">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold text-info mb-3">
              Nuestro <span className={styles.naranja}>Equipo</span>
            </h2>
            <p className="tech-text-muted">Profesionales apasionados por la tecnología</p>
          </div>

          <Row className="g-4">
            <Col lg={3} md={6}>
              <div className={`${styles.teamCard} text-center p-4`}>
                <div className={styles.teamAvatar + ' mb-3'}>
                  <div className={styles.avatarCircle}>
                    <Users size={48} />
                  </div>
                </div>
                <h5 className="fw-bold mb-1 tech-text-muted">Carlos Rodríguez</h5>
                <p className="text-info mb-2">Director Técnico</p>
                <p className="small tech-text-muted">+10 años en reparación de dispositivos</p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className={`${styles.teamCard} text-center p-4`}>
                <div className={styles.teamAvatar + ' mb-3'}>
                  <div className={styles.avatarCircle}>
                    <Wrench size={48} />
                  </div>
                </div>
                <h5 className="fw-bold mb-1 tech-text-muted">Ana Martínez</h5>
                <p className="text-info mb-2">Jefa de Servicio Técnico</p>
                <p className="small tech-text-muted">Especialista en móviles y tablets</p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className={`${styles.teamCard} text-center p-4`}>
                <div className={styles.teamAvatar + ' mb-3'}>
                  <div className={styles.avatarCircle}>
                    <Settings size={48} />
                  </div>
                </div>
                <h5 className="fw-bold mb-1 tech-text-muted">Luis Fernández</h5>
                <p className="text-info mb-2">Técnico Especializado</p>
                <p className="small tech-text-muted">Reparación de PCs y laptops</p>
              </div>
            </Col>
            <Col lg={3} md={6}>
              <div className={`${styles.teamCard} text-center p-4`}>
                <div className={styles.teamAvatar + ' mb-3'}>
                  <div className={styles.avatarCircle}>
                    <Headphones size={48} />
                  </div>
                </div>
                <h5 className="fw-bold mb-1 tech-text-muted">María González</h5>
                <p className="text-info mb-2">Atención al Cliente</p>
                <p className="small tech-text-muted">Soporte y seguimiento</p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <Container className="py-5">
        <div className={`${styles.contactCta} p-5 rounded-4 text-center`}>
          <h2 className="display-6 fw-bold mb-3">¿Necesitas ayuda con tus dispositivos?</h2>
          <p className="mb-4">Contáctanos y te ayudaremos a resolver tus problemas técnicos</p>
          <Row className="justify-content-center g-3">
            <Col md="auto">
              <Button
                className="d-flex align-items-center gap-2"
                href="https://wa.me/5493878254930?text=Hola,%20vengo%20de%20la%20web%20de%20ReparaTech,%20necesito%20ayuda%20con%20un%20dispositivo."
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#25D366',
                  borderColor: '#25D366',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                }}
              >
                <MessageCircle size={18} />
                WhatsApp
              </Button>
            </Col>
            <Col md="auto">
              <Button
                variant="outline-light"
                className="d-flex align-items-center gap-2"
                onClick={abrirModal}
              >
                <Mail size={18} />
                Enviar correo
              </Button>
            </Col>
          </Row>
        </div>
      </Container>

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                <Mail size={22} />
                Envíanos un mensaje
              </h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <p className={styles.modalDescription}>
                Completa el formulario y te responderemos a la brevedad.
              </p>

              {modalEnviado ? (
                <div className={styles.modalSuccess}>
                  <CheckCircle size={48} style={{ color: '#10b981' }} />
                  <h5>¡Mensaje enviado!</h5>
                  <p>Te contactaremos pronto.</p>
                </div>
              ) : (
                <form onSubmit={handleModalSubmit}>
                  {modalError && <div className={styles.modalError}>⚠️ {modalError}</div>}

                  <div className={styles.formGroup}>
                    <label>👤 Nombre completo *</label>
                    <input
                      type="text"
                      name="nombre"
                      className={styles.modalInput}
                      value={modalFormData.nombre}
                      onChange={handleModalChange}
                      required
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>📧 Email *</label>
                    <input
                      type="email"
                      name="email"
                      className={styles.modalInput}
                      value={modalFormData.email}
                      onChange={handleModalChange}
                      required
                      placeholder="tu@email.com"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>📱 Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      className={styles.modalInput}
                      value={modalFormData.telefono}
                      onChange={handleModalChange}
                      placeholder="+54 9 387 825-4930"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>💬 Mensaje *</label>
                    <textarea
                      name="mensaje"
                      className={styles.modalTextarea}
                      rows={4}
                      value={modalFormData.mensaje}
                      onChange={handleModalChange}
                      required
                      placeholder="Contanos tu consulta..."
                    />
                  </div>

                  <div className={styles.modalButtons}>
                    <button
                      type="button"
                      className={styles.modalBtnCancel}
                      onClick={() => setShowModal(false)}
                    >
                      Cancelar
                    </button>
                    <button type="submit" className={styles.modalBtnSend} disabled={modalLoading}>
                      {modalLoading ? '⏳ Enviando...' : <>📧 Enviar mensaje</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

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
}

export default About;
