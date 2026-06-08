// src/pages/Contact/Contact.jsx
import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Container, Row, Col, Button, Form, Alert } from 'react-bootstrap';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  MessageCircle,
  Facebook,
  Twitter,
  Instagram,
  CheckCircle,
} from 'lucide-react';
import NavbarC from './NavbarC';
import styles from './Contact.module.css';

function Contact() {
  const formRef = useRef();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
  });
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const EMAILJS_SERVICE_ID = 'service_ljls08d';
  const EMAILJS_TEMPLATE_ID = 'template_tois80a';
  const EMAILJS_PUBLIC_KEY = '404qej1lJI0ONMgi2';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const templateParams = {
      to_name: 'ReparaTech',
      to_email: 'youlost.end5@gmail.com',
      from_name: formData.nombre,
      from_email: formData.email,
      from_phone: formData.telefono,
      message: formData.mensaje,
      reply_to: formData.email,
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      setEnviado(true);
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
      setTimeout(() => setEnviado(false), 5000);
    } catch (err) {
      console.error('Error EmailJS:', err);
      setError('❌ Error al enviar. Intenta de nuevo o contáctanos directamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.contactPage}>
      {/* Hero Section */}
      <div className={styles.contactHeroWrapper}>
        <div className={styles.heroOverlay}></div>
        <NavbarC />

        <Container className={styles.contactHeroContent}>
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
                  PÓNGASE EN CONTACTO
                </span>
              </div>
              <h1 className="display-3 fw-bold mb-4" style={{ color: 'white' }}>
                ¿Hablamos de tu <span style={{ color: '#ff6b35' }}>dispositivo</span>?
              </h1>
              <p
                className="lead mb-4"
                style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem' }}
              >
                Estamos aquí para ayudarte. Contáctanos y te asesoraremos sin compromiso sobre la
                reparación de tu equipo.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Información de Contacto */}
      <Container className="py-5">
        <Row className="g-4 mb-5">
          <Col md={3} sm={6}>
            <div className={styles.contactInfoCard + ' text-center p-4'}>
              <div className={styles.contactIcon + ' mb-3'}>
                <Phone size={32} />
              </div>
              <h5 className="fw-bold mb-2">Teléfono</h5>
              <p className="mb-0">+34 900 123 456</p>
              <small style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Lunes a Viernes 9-18h</small>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className={styles.contactInfoCard + ' text-center p-4'}>
              <div className={styles.contactIcon + ' mb-3'}>
                <Mail size={32} />
              </div>
              <h5 className="fw-bold mb-2">Email</h5>
              <p className="mb-0">info@reparatech.com</p>
              <small style={{ color: 'rgba(255, 255, 255, 0.7)' }}>soporte@reparatech.com</small>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className={styles.contactInfoCard + ' text-center p-4'}>
              <div className={styles.contactIcon + ' mb-3'}>
                <MapPin size={32} />
              </div>
              <h5 className="fw-bold mb-2">Dirección</h5>
              <p className="mb-0">Calle Principal 123</p>
              <small style={{ color: 'rgba(255, 255, 255, 0.7)' }}>28001 Madrid, España</small>
            </div>
          </Col>
          <Col md={3} sm={6}>
            <div className={styles.contactInfoCard + ' text-center p-4'}>
              <div className={styles.contactIcon + ' mb-3'}>
                <Clock size={32} />
              </div>
              <h5 className="fw-bold mb-2">Horario</h5>
              <p className="mb-0">Lun-Vie: 9:00 - 19:00</p>
              <small style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Sáb: 10:00 - 14:00</small>
            </div>
          </Col>
        </Row>

        {/* Formulario y Mapa */}
        <Row className="g-5">
          <Col lg={6}>
            <div className={styles.contactFormCard + ' p-4'}>
              <h3 className="fw-bold mb-4">
                Envíanos un <span style={{ color: '#ff6b35' }}>mensaje</span>
              </h3>

              {enviado && (
                <Alert variant="success" className="d-flex align-items-center gap-2">
                  <CheckCircle size={18} />
                  <span>✓ ¡Mensaje enviado! Te contactaremos pronto.</span>
                </Alert>
              )}

              {error && (
                <Alert variant="danger" className="d-flex align-items-center gap-2">
                  <span>⚠️ {error}</span>
                </Alert>
              )}

              <Form ref={formRef} onSubmit={handleSubmit}>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Nombre completo *</Form.Label>
                      <Form.Control
                        type="text"
                        name="nombre"
                        value={formData.nombre}
                        onChange={handleChange}
                        required
                        placeholder="Tu nombre"
                        className={styles.contactInput}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>Email *</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="tu@email.com"
                        className={styles.contactInput}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Teléfono</Form.Label>
                      <Form.Control
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleChange}
                        placeholder="+34 600 000 000"
                        className={styles.contactInput}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label>Mensaje *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleChange}
                        required
                        placeholder="Cuéntanos qué dispositivo tienes y qué problema presenta..."
                        className={styles.contactInput}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Button
                      type="submit"
                      className={styles.contactSubmitBtn + ' w-100'}
                      disabled={loading}
                    >
                      {loading ? (
                        <>⏳ Enviando...</>
                      ) : (
                        <>
                          <Send size={18} className="me-2" />
                          Enviar mensaje
                        </>
                      )}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </Col>

          <Col lg={6}>
            <div className={styles.contactMapCard + ' p-4'}>
              <h3 className="fw-bold mb-4">
                Nuestra <span style={{ color: '#ff6b35' }}>ubicación</span>
              </h3>
              <div className={styles.mapContainer}>
                <iframe
                  title="UNSA - Sede Orán"
                  src="https://maps.google.com/maps?q=Universidad+Nacional+de+Salta+Or%C3%A1n&z=16&output=embed"
                  width="100%"
                  height="300"
                  style={{ border: 0, borderRadius: '12px' }}
                  allowFullScreen
                  loading="lazy"
                />
              </div>

              <div className={styles.contactDetails + ' mt-4'}>
                <div className={styles.addressHighlight + ' p-3 rounded-4 mb-3'}>
                  <div className="d-flex align-items-start gap-3">
                    <MapPin
                      size={24}
                      style={{ color: '#ff6b35', flexShrink: 0, marginTop: '4px' }}
                    />
                    <div>
                      <h5 className="fw-bold mb-1">🏛️ UNSA - San Ramón de la Nueva Orán</h5>
                      <p className="mb-0">Universidad Nacional de Salta</p>
                      <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Sede Orán
                      </p>
                      <p className="mb-0" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Salta, Argentina
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-center">
                  <Button
                    variant="outline-primary"
                    href="https://maps.google.com/?q=UNSA+Or%C3%A1n+Salta"
                    target="_blank"
                    className="rounded-pill"
                    style={{ borderColor: '#ff6b35', color: '#ff6b35' }}
                  >
                    <MapPin size={14} className="me-1" />
                    Abrir en Google Maps
                  </Button>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Container>

      {/* WhatsApp CTA */}
      <Container className="py-4">
        <div className={styles.whatsappCta + ' p-4 rounded-4 text-center'}>
          <Row className="align-items-center justify-content-between">
            <Col lg={8} className="text-center text-lg-start mb-3 mb-lg-0">
              <h4 className="fw-bold mb-2">¿Prefieres una respuesta rápida?</h4>
              <p className="mb-0">Escríbenos por WhatsApp y te atenderemos en minutos</p>
            </Col>
            <Col lg={4} className="text-center text-lg-end">
              <Button
                className={styles.whatsappBtn}
                href="https://wa.me/5493878254930?text=Hola,%20vengo%20de%20la%20web%20de%20ReparaTech,%20necesito%20ayuda%20con%20un%20dispositivo."
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle size={20} className="me-2" />
                WhatsApp +54 9 387 825-4930
              </Button>
            </Col>
          </Row>
        </div>
      </Container>

      {/* Redes Sociales */}
      <Container className="py-5">
        <div className={styles.socialSectionContact}>
          <div className={styles.socialHeaderContact}>
            <h2>Síguenos en redes sociales</h2>
            <div className={styles.socialHeaderDecorationContact}></div>
            <p className={styles.socialSubtitleContact}>Conoce nuestras promociones y novedades</p>
          </div>

          <div className={styles.socialGridContact}>
            <a
              href="https://www.facebook.com/ReparaTech"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCardContact}
            >
              <div className={styles.socialIconWrapperContact}>
                <div className={styles.socialIconContact}>
                  <Facebook size={32} />
                </div>
              </div>
              <h3>Facebook</h3>
              <p>/ReparaTech</p>
              <div className={styles.socialHoverEffectContact}></div>
            </a>

            <a
              href="https://twitter.com/ReparaTech"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCardContact}
            >
              <div className={styles.socialIconWrapperContact}>
                <div className={styles.socialIconContact}>
                  <Twitter size={32} />
                </div>
              </div>
              <h3>Twitter</h3>
              <p>@ReparaTech</p>
              <div className={styles.socialHoverEffectContact}></div>
            </a>

            <a
              href="https://www.instagram.com/ReparaTech"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCardContact}
            >
              <div className={styles.socialIconWrapperContact}>
                <div className={styles.socialIconContact}>
                  <Instagram size={32} />
                </div>
              </div>
              <h3>Instagram</h3>
              <p>@ReparaTech</p>
              <div className={styles.socialHoverEffectContact}></div>
            </a>
          </div>
        </div>
      </Container>

      {/* Footer */}
      <footer className="tech-footer mt-5 py-4">
        <Container>
          <Row className="align-items-center">
            <Col md={6} className="text-center text-md-start mb-3 mb-md-0">
              <span className="fw-bold" style={{ color: 'white' }}>
                ReparaTech
              </span>{' '}
              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                © 2026 - Donde la tecnología se encuentra con profesionales
              </span>
            </Col>
            <Col md={6} className="text-center text-md-end">
              <span className="me-3" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                Política de privacidad
              </span>
              <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Términos de uso</span>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
}

export default Contact;
