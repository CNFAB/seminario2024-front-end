// src/pages/Services/Services.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import {
  Smartphone,
  Battery,
  Plug,
  Camera,
  Wifi,
  Lock,
  Database,
  Shield,
  Brush,
  PhoneCall,
  ChevronRight,
  CheckCircle,
  Wrench,
  HardDrive,
  Home,
  RefreshCw,
  Cpu,
  Eye,
  Fingerprint,
  Search,
  Clock,
  Star,
  Zap,
  Headphones,
  Mail,
  X,
  MessageCircle,
  Send,
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import NavbarC from './NavbarC';
import styles from '../css/ServicesSection.module.css';

const Services = () => {
  const [categoriaActiva, setCategoriaActiva] = useState('hardware');
  const [showModal, setShowModal] = useState(false);
  const [servicioSeleccionado, setServicioSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    dispositivo: '',
    mensaje: '',
  });
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const EMAILJS_SERVICE_ID = 'service_ljls08d';
  const EMAILJS_TEMPLATE_ID = 'template_tois80a';
  const EMAILJS_PUBLIC_KEY = '404qej1lJI0ONMgi2';
  const WHATSAPP_NUMBER = '5493878254930';

  const servicios = {
    hardware: {
      nombre: 'Reparaciones de Hardware',
      icono: <Wrench size={20} />,
      descripcion: 'Soluciones para problemas físicos de tu dispositivo',
      items: [
        {
          id: 1,
          nombre: 'Cambio de Pantalla',
          icono: <Smartphone size={20} />,
          descripcion: 'Pantallas rotas, táctil no responde, líneas, manchas',
          tiempo: '2-4 horas',
          garantia: '90 días',
          precioDesde: 25000,
        },
        {
          id: 2,
          nombre: 'Cambio de Batería',
          icono: <Battery size={20} />,
          descripcion: 'No retiene carga, se apaga solo, batería inflada',
          tiempo: '1-2 horas',
          garantia: '90 días',
          precioDesde: 18000,
        },
        {
          id: 3,
          nombre: 'Reparación de Carga',
          icono: <Plug size={20} />,
          descripcion: 'Puerto dañado, no carga, carga lenta/intermitente',
          tiempo: '1-2 horas',
          garantia: '60 días',
          precioDesde: 15000,
        },
        {
          id: 4,
          nombre: 'Reparación de Cámara',
          icono: <Camera size={20} />,
          descripcion: 'Fotos borrosas, cámara no abre, lentes rotos',
          tiempo: '1-3 horas',
          garantia: '60 días',
          precioDesde: 20000,
        },
        {
          id: 5,
          nombre: 'Reparación de Audio',
          icono: <Headphones size={20} />,
          descripcion: 'Altavoz roto, micrófono no funciona, auriculares',
          tiempo: '1-3 horas',
          garantia: '60 días',
          precioDesde: 12000,
        },
        {
          id: 6,
          nombre: 'Reparación de Señal',
          icono: <Wifi size={20} />,
          descripcion: 'No agarra señal, WiFi/bluetooth no funciona',
          tiempo: '2-4 horas',
          garantia: '60 días',
          precioDesde: 22000,
        },
        {
          id: 7,
          nombre: 'Reparación de Botones',
          icono: <Fingerprint size={20} />,
          descripcion: 'Botones de volumen, power, home dañados',
          tiempo: '1-2 horas',
          garantia: '60 días',
          precioDesde: 10000,
        },
        {
          id: 8,
          nombre: 'Reparación de Placa',
          icono: <Cpu size={20} />,
          descripcion: 'No prende, reinicia solo, sobrecalienta',
          tiempo: '24-48 horas',
          garantia: '90 días',
          precioDesde: 35000,
        },
      ],
    },
    software: {
      nombre: 'Servicios de Software',
      icono: <RefreshCw size={20} />,
      descripcion: 'Soluciones para problemas lógicos y de sistema',
      items: [
        {
          id: 9,
          nombre: 'Desbloqueo de Pantalla',
          icono: <Lock size={20} />,
          descripcion: 'Patrón, PIN, huella, reconocimiento facial',
          tiempo: '1-2 horas',
          garantia: '30 días',
          precioDesde: 15000,
        },
        {
          id: 10,
          nombre: 'Eliminación de Cuenta',
          icono: <Shield size={20} />,
          descripcion: 'Cuenta Google (FRP) o iCloud',
          tiempo: '2-4 horas',
          garantia: '30 días',
          precioDesde: 20000,
        },
        {
          id: 11,
          nombre: 'Recuperación de Datos',
          icono: <Database size={20} />,
          descripcion: 'Fotos, contactos, mensajes, WhatsApp',
          tiempo: '24-48 horas',
          garantia: 'Sin garantía',
          precioDesde: 30000,
        },
        {
          id: 12,
          nombre: 'Actualización de Sistema',
          icono: <RefreshCw size={20} />,
          descripcion: 'iOS, Android, actualización o downgrade',
          tiempo: '1-3 horas',
          garantia: '30 días',
          precioDesde: 10000,
        },
        {
          id: 13,
          nombre: 'Limpieza de Virus',
          icono: <Shield size={20} />,
          descripcion: 'Eliminación de malware, publicidad no deseada',
          tiempo: '2-4 horas',
          garantia: '30 días',
          precioDesde: 12000,
        },
        {
          id: 14,
          nombre: 'Optimización',
          icono: <Zap size={20} />,
          descripcion: 'Limpieza de archivos, mejora rendimiento',
          tiempo: '1-2 horas',
          garantia: '30 días',
          precioDesde: 8000,
        },
      ],
    },
  };

  const categorias = [
    { id: 'hardware', nombre: 'Hardware', icono: <Wrench size={16} /> },
    { id: 'software', nombre: 'Software', icono: <RefreshCw size={16} /> },
  ];

  const serviciosActuales = servicios[categoriaActiva];

  const abrirModal = (servicio) => {
    setServicioSeleccionado(servicio);
    setShowModal(true);
  };

  const handleModalChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleWhatsApp = () => {
    const mensaje = `Hola! Me interesa el servicio de *${servicioSeleccionado?.nombre}*.
    
📱 Dispositivo: ${formData.dispositivo || 'No especificado'}
📝 Detalle: ${formData.mensaje || 'Sin detalles adicionales'}

👤 Cliente: ${formData.nombre || 'Anónimo'}
📞 Teléfono: ${formData.telefono || 'No proporcionado'}`;

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
    setShowModal(false);
    setFormData({ nombre: '', email: '', telefono: '', dispositivo: '', mensaje: '' });
  };

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const templateParams = {
      to_name: 'ReparaTech',
      to_email: 'youlost.end5@gmail.com',
      from_name: formData.nombre,
      from_email: formData.email,
      from_phone: formData.telefono,
      message: `Servicio: ${servicioSeleccionado?.nombre}\nDispositivo: ${formData.dispositivo}\n\n${formData.mensaje}`,
      reply_to: formData.email,
      source: `Desde Services - ${servicioSeleccionado?.nombre}`,
    };

    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );
      setEnviado(true);
      setFormData({ nombre: '', email: '', telefono: '', dispositivo: '', mensaje: '' });
      setTimeout(() => {
        setEnviado(false);
        setShowModal(false);
      }, 2000);
    } catch (err) {
      console.error('Error EmailJS:', err);
      setError('❌ Error al enviar. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.servicesPage}>
      <NavbarC />

      {/* Hero Section */}
      <div className={styles.servicesHeroWrapper}>
        <div className={styles.heroOverlay}></div>
        <Container className={styles.servicesHeroContent}>
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
                  SERVICIOS TÉCNICOS
                </span>
              </div>
              <h1 className="display-3 fw-bold mb-4" style={{ color: 'white' }}>
                Todo lo que necesitas para tu <span style={{ color: '#ff6b35' }}>dispositivo</span>
              </h1>
              <p
                className="lead mb-4"
                style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.2rem' }}
              >
                Más de 20 servicios especializados · Técnicos certificados · Garantía incluida
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Tabs de categorías */}
      <Container className="py-4">
        <div className={styles.servicesTabsPage}>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.servicesTabBtnPage} ${categoriaActiva === cat.id ? styles.active : ''}`}
              onClick={() => setCategoriaActiva(cat.id)}
            >
              {cat.icono}
              {cat.nombre}
            </button>
          ))}
        </div>
      </Container>

      {/* Descripción de categoría */}
      <Container className="py-2">
        <div className={styles.servicesCategoryDesc}>
          <p>{serviciosActuales.descripcion}</p>
        </div>
      </Container>

      {/* Grid de servicios */}
      <Container className="py-4">
        <Row className="g-4">
          {serviciosActuales.items.map((servicio, idx) => (
            <Col lg={4} md={6} key={servicio.id}>
              <div
                className={`${styles.serviceCardPage} ${idx < 3 && categoriaActiva === 'hardware' ? styles.destacado : ''}`}
              >
                {idx < 3 && categoriaActiva === 'hardware' && (
                  <div className={styles.servicePopularPage}>
                    <Star size={12} />
                    Más solicitado
                  </div>
                )}

                <div className={styles.serviceIconPage}>{servicio.icono}</div>

                <h3 className={styles.serviceNamePage}>{servicio.nombre}</h3>

                <p className={styles.serviceDescriptionPage}>{servicio.descripcion}</p>

                {servicio.precioDesde && (
                  <div className={styles.servicePricePage}>
                    <span className={styles.priceFrom}>Desde</span>
                    <span className={styles.priceValue}>
                      ${servicio.precioDesde.toLocaleString('es-AR')}
                    </span>
                  </div>
                )}

                <div className={styles.serviceMetaPage}>
                  <div className={styles.serviceTimePage}>
                    <Clock size={14} />
                    <span>{servicio.tiempo}</span>
                  </div>
                  <div className={styles.serviceGarantiaPage}>
                    <Shield size={14} />
                    <span>{servicio.garantia}</span>
                  </div>
                </div>

                <button className={styles.serviceBtnPage} onClick={() => abrirModal(servicio)}>
                  Consultar precio
                  <ChevronRight size={16} />
                </button>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Beneficios */}
      <Container className="py-5">
        <div className={styles.servicesBenefitsPage}>
          <h2 className="text-center mb-4">¿Por qué elegirnos?</h2>
          <Row className="g-4">
            <Col md={3} sm={6}>
              <div className={styles.benefitItemPage}>
                <div className={styles.benefitIconPage}>
                  <CheckCircle size={24} />
                </div>
                <h4>Garantía asegurada</h4>
                <p>Hasta 90 días en todas las reparaciones</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className={styles.benefitItemPage}>
                <div className={styles.benefitIconPage}>
                  <Clock size={24} />
                </div>
                <h4>Reparación express</h4>
                <p>La mayoría en menos de 24 horas</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className={styles.benefitItemPage}>
                <div className={styles.benefitIconPage}>
                  <Shield size={24} />
                </div>
                <h4>Piezas certificadas</h4>
                <p>Originales y alta calidad</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className={styles.benefitItemPage}>
                <div className={styles.benefitIconPage}>
                  <Search size={24} />
                </div>
                <h4>Diagnóstico gratis</h4>
                <p>Sin costo ni compromiso</p>
              </div>
            </Col>
          </Row>
        </div>
      </Container>

      {/* CTA Final */}
      <Container className="py-5">
        <div className={styles.servicesCtaPage}>
          <h3>¿Necesitas un servicio que no está en la lista?</h3>
          <p>Contactanos y evaluamos tu caso sin compromiso</p>
          <div className={styles.servicesCtaButtonsPage}>
            <Button
              className={styles.ctaWhatsapp}
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hola,%20necesito%20un%20presupuesto%20personalizado`}
              target="_blank"
            >
              <MessageCircle size={18} />
              WhatsApp
            </Button>
            <Button
              variant="outline-light"
              className={styles.ctaEmail}
              onClick={() => {
                setServicioSeleccionado({ nombre: 'Consulta general' });
                setShowModal(true);
              }}
            >
              <Mail size={18} />
              Enviar email
            </Button>
          </div>
        </div>
      </Container>

      {/* Modal de contacto */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeaderCustom}>
              <h3>
                <Mail size={22} />
                Consultar - {servicioSeleccionado?.nombre}
              </h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBodyCustom}>
              {enviado ? (
                <div className={styles.modalSuccess}>
                  <CheckCircle size={48} style={{ color: '#10b981' }} />
                  <h5>¡Consulta enviada!</h5>
                  <p>Te contactaremos pronto.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitEmail}>
                  {error && <div className={styles.modalError}>⚠️ {error}</div>}

                  <input
                    type="text"
                    name="nombre"
                    placeholder=" Tu nombre completo"
                    className={styles.modalInput}
                    value={formData.nombre}
                    onChange={handleModalChange}
                    required
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder=" tu@email.com"
                    className={styles.modalInput}
                    value={formData.email}
                    onChange={handleModalChange}
                    required
                  />

                  <input
                    type="tel"
                    name="telefono"
                    placeholder=" Teléfono (opcional)"
                    className={styles.modalInput}
                    value={formData.telefono}
                    onChange={handleModalChange}
                  />

                  <input
                    type="text"
                    name="dispositivo"
                    placeholder=" Modelo de dispositivo"
                    className={styles.modalInput}
                    value={formData.dispositivo}
                    onChange={handleModalChange}
                  />

                  <textarea
                    name="mensaje"
                    placeholder=" Contanos qué problema tiene tu dispositivo..."
                    className={styles.modalTextarea}
                    rows={4}
                    value={formData.mensaje}
                    onChange={handleModalChange}
                    required
                  />

                  <div className={styles.modalButtons}>
                    <button type="button" onClick={() => setShowModal(false)}>
                      Cancelar
                    </button>
                    <button type="button" onClick={handleWhatsApp} className="whatsapp-btn">
                      <MessageCircle size={16} />
                      WhatsApp
                    </button>
                    <button type="submit" disabled={loading}>
                      {loading ? ' Enviando...' : ' Enviar'}
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
};

export default Services;
