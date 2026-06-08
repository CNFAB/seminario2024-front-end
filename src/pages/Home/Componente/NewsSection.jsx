// src/pages/News/News.jsx
import React, { useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import {
  Newspaper,
  Calendar,
  User,
  ChevronRight,
  Clock,
  TrendingUp,
  Smartphone,
  Battery,
  Shield,
  Wrench,
  Zap,
  Eye,
  MessageCircle,
  Mail,
  X,
  CheckCircle,
  Send,
  Facebook,
  Twitter,
  Instagram,
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import NavbarC from './NavbarC';
import styles from '../css/NewsSection.module.css';

const NewsSection = () => {
  const [categoriaActiva, setCategoriaActiva] = useState('todas');
  const [showModal, setShowModal] = useState(false);
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

  const noticias = [
    {
      id: 1,
      titulo: 'Cómo detectar si tu batería está por fallar',
      descripcion:
        '5 señales claras de que tu batería necesita reemplazo urgente antes de que dañe tu dispositivo. Aprende a identificar los síntomas tempranos.',
      categoria: 'tips',
      icono: <Battery size={20} />,
      fecha: '15 Mayo 2024',
      autor: 'Carlos Técnico',
      lectura: '5 min',
      destacado: true,
      contenidoCompleto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    },
    {
      id: 2,
      titulo: 'Llegaron los repuestos del iPhone 15',
      descripcion:
        'Ya tenemos disponibles pantallas, baterías y módulos de carga para toda la línea iPhone 15. Reparaciones con repuestos originales.',
      categoria: 'novedades',
      icono: <Smartphone size={20} />,
      fecha: '10 Mayo 2024',
      autor: 'Equipo ReparaTech',
      lectura: '3 min',
      destacado: true,
      contenidoCompleto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    },
    {
      id: 3,
      titulo: 'Promoción: 20% off en cambio de pantalla',
      descripcion:
        'Durante todo Mayo, 20% de descuento en cambio de pantalla para cualquier modelo. ¡Agendá tu turno! Válido hasta fin de mes.',
      categoria: 'promociones',
      icono: <Zap size={20} />,
      fecha: '1 Mayo 2024',
      autor: 'Marketing',
      lectura: '2 min',
      destacado: true,
      contenidoCompleto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    },
    {
      id: 4,
      titulo: '¿Vale la pena reparar o comprar nuevo?',
      descripcion:
        'Análisis completo: cuándo conviene reparar y cuándo es mejor invertir en un equipo nuevo. Factores a considerar.',
      categoria: 'tips',
      icono: <TrendingUp size={20} />,
      fecha: '25 Abril 2024',
      autor: 'María Asesora',
      lectura: '8 min',
      destacado: false,
      contenidoCompleto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    },
    {
      id: 5,
      titulo: 'Nuevo servicio: reparación de placa madre',
      descripcion:
        'Ahora reparamos fallas en placa madre que otros talleres descartan. Consultanos sin compromiso.',
      categoria: 'novedades',
      icono: <Wrench size={20} />,
      fecha: '20 Abril 2024',
      autor: 'Equipo Técnico',
      lectura: '4 min',
      destacado: false,
      contenidoCompleto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    },
    {
      id: 6,
      titulo: 'Cómo proteger tu celular del sobrecalentamiento',
      descripcion:
        'Consejos prácticos para evitar que tu dispositivo se dañe por altas temperaturas. Especial para verano.',
      categoria: 'tips',
      icono: <Shield size={20} />,
      fecha: '15 Abril 2024',
      autor: 'Carlos Técnico',
      lectura: '6 min',
      destacado: false,
      contenidoCompleto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    },
    {
      id: 7,
      titulo: 'Liquidación de accesorios',
      descripcion:
        'Fundas, vidrios templados y cargadores con hasta 50% off. Stock limitado. ¡Aprovechá!',
      categoria: 'promociones',
      icono: <Eye size={20} />,
      fecha: '10 Abril 2024',
      autor: 'Ventas',
      lectura: '2 min',
      destacado: false,
      contenidoCompleto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    },
    {
      id: 8,
      titulo: 'Todo sobre el nuevo iOS 18',
      descripcion:
        'Compatibilidad, novedades y problemas comunes al actualizar. Lo que necesitas saber antes de actualizar.',
      categoria: 'tips',
      icono: <Smartphone size={20} />,
      fecha: '5 Abril 2024',
      autor: 'Sofía Dev',
      lectura: '7 min',
      destacado: false,
      contenidoCompleto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    },
    {
      id: 9,
      titulo: 'Nueva sucursal en Palermo',
      descripcion: 'Ahora también te atendemos en Palermo. Más cerca de vos para tus reparaciones.',
      categoria: 'novedades',
      icono: <TrendingUp size={20} />,
      fecha: '1 Abril 2024',
      autor: 'Administración',
      lectura: '2 min',
      destacado: false,
      contenidoCompleto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    },
    {
      id: 10,
      titulo: 'Tips para cuidar la batería de tu notebook',
      descripcion: 'Extendé la vida útil de tu batería con estos simples consejos.',
      categoria: 'tips',
      icono: <Battery size={20} />,
      fecha: '28 Marzo 2024',
      autor: 'Carlos Técnico',
      lectura: '5 min',
      destacado: false,
      contenidoCompleto: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit...',
    },
  ];

  const categorias = [
    { id: 'todas', nombre: 'Todas', icono: <Newspaper size={16} /> },
    { id: 'tips', nombre: 'Tips', icono: <Battery size={16} /> },
    { id: 'novedades', nombre: 'Novedades', icono: <TrendingUp size={16} /> },
    { id: 'promociones', nombre: 'Promociones', icono: <Zap size={16} /> },
  ];

  const noticiasFiltradas =
    categoriaActiva === 'todas'
      ? noticias
      : noticias.filter((n) => n.categoria === categoriaActiva);

  const noticiasDestacadas = noticias.filter((n) => n.destacado);
  const noticiasNormales = noticiasFiltradas.filter((n) => !n.destacado);

  const handleModalChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleModalSubmit = async (e) => {
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
      source: 'Desde News - Consulta',
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
    <div className={styles.newsPage}>
      <NavbarC />

      {/* Hero Section */}
      <div className={styles.newsHeroWrapper}>
        <div className={styles.heroOverlay}></div>
        <Container className={styles.newsHeroContent}>
          <Row className="align-items-center min-vh-50">
            <Col lg={8} className="mx-auto text-center">
              <div className="mb-4 ">
                <span
                  className="text-uppercase fw-semibold letter-spacing px-3 py-2 rounded-pill"
                  style={{
                    background: 'rgba(255, 107, 53, 0.15)',
                    border: '1px solid rgba(255, 107, 53, 0.3)',
                    color: '#ff6b35',
                  }}
                >
                  NOTICIAS Y CONSEJOS
                </span>
              </div>
              <h1 className="display-3 fw-bold mb-4 tech-text-white">
                Blog de <span className="tech-text-primary">ReparaTech</span>
              </h1>
              <p className="lead mb-4 tech-text-muted" style={{ fontSize: '1.2rem' }}>
                Consejos útiles, novedades del sector y promociones exclusivas para mantener tus
                dispositivos como nuevos.
              </p>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Filtros */}
      <Container className="py-4">
        <div className={styles.newsFilters}>
          {categorias.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.newsFilterBtn} ${categoriaActiva === cat.id ? styles.active : ''}`}
              onClick={() => setCategoriaActiva(cat.id)}
            >
              {cat.icono}
              {cat.nombre}
            </button>
          ))}
        </div>
      </Container>

      {/* Noticias Destacadas */}
      {categoriaActiva === 'todas' && (
        <Container className="py-4">
          <h2 className={styles.newsSectionTitle}>
            <TrendingUp size={24} />
            Destacadas
          </h2>
          <Row className="g-4">
            {noticiasDestacadas.map((noticia) => (
              <Col lg={4} md={6} key={noticia.id}>
                <div className={`${styles.newsCard} ${styles.featured}`}>
                  <div className={styles.newsCardBadge}>{noticia.categoria}</div>
                  <div className={styles.newsIconLarge}>{noticia.icono}</div>
                  <h3 className={styles.newsCardTitle}>{noticia.titulo}</h3>
                  <p className={styles.newsCardDescription}>{noticia.descripcion}</p>
                  <div className={styles.newsCardMeta}>
                    <span>
                      <Calendar size={14} /> {noticia.fecha}
                    </span>
                    <span>
                      <User size={14} /> {noticia.autor}
                    </span>
                    <span>
                      <Clock size={14} /> {noticia.lectura}
                    </span>
                  </div>
                  <button className={styles.newsBtn}>
                    Leer más
                    <ChevronRight size={16} />
                  </button>
                </div>
              </Col>
            ))}
          </Row>
        </Container>
      )}

      {/* Listado de noticias */}
      <Container className="py-4">
        {categoriaActiva !== 'todas' && (
          <h2 className={styles.newsSectionTitle}>
            {categorias.find((c) => c.id === categoriaActiva)?.icono}
            {categorias.find((c) => c.id === categoriaActiva)?.nombre}
          </h2>
        )}
        <Row className="g-4">
          {noticiasNormales.map((noticia) => (
            <Col lg={6} key={noticia.id}>
              <div className={styles.newsCardHorizontal}>
                <div className={styles.newsCardIcon}>{noticia.icono}</div>
                <div className={styles.newsCardContent}>
                  <div className={styles.newsCardTag}>{noticia.categoria}</div>
                  <h4 className={styles.newsCardTitleH}>{noticia.titulo}</h4>
                  <p className={styles.newsCardDescriptionH}>{noticia.descripcion}</p>
                  <div className={styles.newsCardMetaH}>
                    <span>
                      <Calendar size={12} /> {noticia.fecha}
                    </span>
                    <span>
                      <Clock size={12} /> {noticia.lectura}
                    </span>
                  </div>
                  <button className={styles.newsBtnSmall}>
                    Leer más
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Redes Sociales */}
      <Container className="py-5">
        <div className={styles.socialSection}>
          <div className={styles.socialHeader}>
            <h2>Síguenos en redes sociales</h2>
            <div className={styles.socialHeaderDecoration}></div>
            <p className={styles.socialSubtitle}>Conoce nuestras promociones y novedades</p>
          </div>

          <div className={styles.socialGrid}>
            <a
              href="https://www.facebook.com/ReparaTech"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCard}
            >
              <div className={styles.socialIconWrapper}>
                <div className={styles.socialIcon}>
                  <Facebook size={32} />
                </div>
              </div>
              <h3>Facebook</h3>
              <p>@ReparaTech</p>
              <div className={styles.socialHoverEffect}></div>
            </a>

            <a
              href="https://twitter.com/ReparaTech"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCard}
            >
              <div className={styles.socialIconWrapper}>
                <div className={styles.socialIcon}>
                  <Twitter size={32} />
                </div>
              </div>
              <h3>Twitter</h3>
              <p>@ReparaTech</p>
              <div className={styles.socialHoverEffect}></div>
            </a>

            <a
              href="https://www.instagram.com/ReparaTech"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialCard}
            >
              <div className={styles.socialIconWrapper}>
                <div className={styles.socialIcon}>
                  <Instagram size={32} />
                </div>
              </div>
              <h3>Instagram</h3>
              <p>@ReparaTech</p>
              <div className={styles.socialHoverEffect}></div>
            </a>
          </div>
        </div>
      </Container>

      {/* CTA Contacto */}
      <Container className="py-4">
        <div className={styles.newsContactCta}>
          <h3>¿Tenés alguna consulta?</h3>
          <p>Escríbenos y te responderemos a la brevedad</p>
          <div className={styles.newsContactButtons}>
            <Button
              className={styles.contactBtnWhatsapp}
              href="https://wa.me/5493878254930?text=Hola,%20vengo%20del%20blog%20de%20ReparaTech,%20tengo%20una%20consulta."
              target="_blank"
            >
              <MessageCircle size={18} />
              WhatsApp
            </Button>
            <Button
              variant="outline-light"
              className={styles.contactBtnEmail}
              onClick={() => setShowModal(true)}
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
                <Mail size={22} /> Envíanos un mensaje
              </h3>
              <button className={styles.modalClose} onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBodyCustom}>
              {enviado ? (
                <div className={styles.modalSuccess}>
                  <CheckCircle size={48} style={{ color: '#10b981' }} />
                  <h5>¡Mensaje enviado!</h5>
                  <p>Te contactaremos pronto.</p>
                </div>
              ) : (
                <form onSubmit={handleModalSubmit}>
                  {error && <div className={styles.modalError}>⚠️ {error}</div>}

                  <input
                    type="text"
                    name="nombre"
                    placeholder="👤 Tu nombre completo"
                    className={styles.modalInput}
                    value={formData.nombre}
                    onChange={handleModalChange}
                    required
                  />

                  <input
                    type="email"
                    name="email"
                    placeholder="📧 tu@email.com"
                    className={styles.modalInput}
                    value={formData.email}
                    onChange={handleModalChange}
                    required
                  />

                  <input
                    type="tel"
                    name="telefono"
                    placeholder="📱 Teléfono (opcional)"
                    className={styles.modalInput}
                    value={formData.telefono}
                    onChange={handleModalChange}
                  />

                  <textarea
                    name="mensaje"
                    placeholder="💬 Escribí tu mensaje..."
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
                    <button type="submit" disabled={loading}>
                      {loading ? '⏳ Enviando...' : '📧 Enviar mensaje'}
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
};

export default NewsSection;
