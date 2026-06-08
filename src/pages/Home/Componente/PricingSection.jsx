// src/pages/Home/Componentes/PricingSection.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Button, Spinner } from 'react-bootstrap';
import {
  CheckCircle,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  Smartphone,
  Battery,
  Plug,
  Wrench,
  Search,
  Phone,
  Apple,
  Award,
  ChevronRight,
} from 'lucide-react';
import { inventarioService } from '../../../services/inventarioService';
import '../css/PricngSection.css';

const PricingSection = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [piezas, setPiezas] = useState([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('todas');

  // Cargar datos del inventario
  useEffect(() => {
    const cargarPrecios = async () => {
      try {
        setLoading(true);
        const response = await inventarioService.obtenerTodas();
        const datos = response?.data ?? response ?? [];
        setPiezas(Array.isArray(datos) ? datos : []);
        setError(null);
      } catch (err) {
        console.error('Error cargando precios:', err);
        setError('No se pudieron cargar los precios actuales');
      } finally {
        setLoading(false);
      }
    };
    cargarPrecios();
  }, []);

  // Procesar datos para mostrar precios por tipo de reparación
  const reparacionesConfig = useMemo(() => {
    // Definir palabras clave para cada tipo de reparación
    const keywords = {
      pantalla: ['pantalla', 'display', 'lcd', 'oled', 'touch', 'screen', 'cristal', 'vidrio'],
      bateria: ['bateria', 'batería', 'battery', 'pilas'],
      carga: ['carga', 'puerto', 'conector', 'flex carga', 'cargador', 'charging'],
      camara: ['camara', 'cámara', 'camera', 'lente', 'foto'],
      botones: ['boton', 'botón', 'button', 'volumen', 'power', 'encendido'],
      placa: ['placa', 'mother', 'mainboard', 'logica', 'board', 'electronica'],
    };

    // Agrupar piezas por tipo de reparación y marca
    const agrupado = {
      pantalla: {
        nombre: 'Cambio de Pantalla',
        icono: '📱',
        reparaciones: [],
        preciosPorMarca: {},
      },
      bateria: { nombre: 'Cambio de Batería', icono: '🔋', reparaciones: [], preciosPorMarca: {} },
      carga: { nombre: 'Reparación de Carga', icono: '⚡', reparaciones: [], preciosPorMarca: {} },
      camara: {
        nombre: 'Reparación de Cámara',
        icono: '📸',
        reparaciones: [],
        preciosPorMarca: {},
      },
      botones: {
        nombre: 'Reparación de Botones',
        icono: '🔘',
        reparaciones: [],
        preciosPorMarca: {},
      },
      placa: { nombre: 'Reparación de Placa', icono: '🔧', reparaciones: [], preciosPorMarca: {} },
    };

    // Procesar cada pieza
    piezas.forEach((pieza) => {
      const nombrePieza = (pieza.nombre_pieza || pieza.nombre || '').toLowerCase();
      const marca = pieza.marca?.marca || pieza.marca || 'Otra';
      const precio = Number(pieza.precio) || 0;
      const stock = Number(pieza.stock) || 0;

      // Determinar qué tipo de reparación es
      for (const [tipo, keywordsList] of Object.entries(keywords)) {
        const esDeTipo = keywordsList.some((keyword) => nombrePieza.includes(keyword));
        if (esDeTipo && precio > 0 && stock > 0) {
          agrupado[tipo].reparaciones.push({
            id: pieza.id_pieza,
            nombre: pieza.nombre_pieza || pieza.nombre,
            marca,
            precio,
            stock,
          });

          // Guardar por marca
          if (!agrupado[tipo].preciosPorMarca[marca]) {
            agrupado[tipo].preciosPorMarca[marca] = [];
          }
          agrupado[tipo].preciosPorMarca[marca].push(precio);
          break;
        }
      }
    });

    // Calcular precio mínimo por marca para cada tipo
    const resultado = [];
    for (const [key, value] of Object.entries(agrupado)) {
      const marcasConPrecios = [];
      for (const [marca, precios] of Object.entries(value.preciosPorMarca)) {
        const precioMin = Math.min(...precios);
        marcasConPrecios.push({ marca, precioMin, cantidad: precios.length });
      }
      marcasConPrecios.sort((a, b) => a.precioMin - b.precioMin);

      if (value.reparaciones.length > 0) {
        resultado.push({
          ...value,
          key,
          marcas: marcasConPrecios.slice(0, 4), // Top 4 marcas
          precioDesde:
            marcasConPrecios.length > 0
              ? Math.min(...marcasConPrecios.map((m) => m.precioMin))
              : null,
          totalPiezas: value.reparaciones.length,
        });
      }
    }

    return resultado;
  }, [piezas]);

  // Obtener marcas únicas disponibles
  const marcasDisponibles = useMemo(() => {
    const marcas = new Set();
    reparacionesConfig.forEach((rep) => {
      rep.marcas.forEach((m) => marcas.add(m.marca));
    });
    return Array.from(marcas).sort();
  }, [reparacionesConfig]);

  // Filtrar reparaciones por marca
  const reparacionesFiltradas = useMemo(() => {
    if (marcaSeleccionada === 'todas') return reparacionesConfig;
    return reparacionesConfig
      .map((rep) => ({
        ...rep,
        marcas: rep.marcas.filter((m) => m.marca === marcaSeleccionada),
        precioDesde: rep.marcas.find((m) => m.marca === marcaSeleccionada)?.precioMin || null,
      }))
      .filter((rep) => rep.marcas.length > 0);
  }, [reparacionesConfig, marcaSeleccionada]);

  if (loading) {
    return (
      <section className="pricing-section" id="pricing">
        <Container className="text-center py-5">
          <div className="pricing-loading">
            <Spinner animation="border" variant="warning" />
            <p>Cargando precios actualizados...</p>
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pricing-section" id="pricing">
        <Container className="text-center py-5">
          <div className="pricing-error">
            <Zap size={48} color="#ff6b35" />
            <h3>No pudimos cargar los precios</h3>
            <p>{error}</p>
            <Button variant="outline-light" onClick={() => window.location.reload()}>
              Reintentar
            </Button>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="pricing-section" id="pricing">
      <Container>
        {/* Header */}
        <div className="pricing-header text-center">
          <span className="pricing-badge">
            <Zap size={16} />
            PRECIOS DE REPARACIONES
          </span>
          <h2 className="pricing-title">Soluciones rápidas a precios justos</h2>
          <p className="pricing-subtitle">
            Precios actualizados según nuestro inventario · Sin sorpresas
          </p>

          {/* Filtro por marca */}
          {marcasDisponibles.length > 0 && (
            <div className="pricing-marca-filter">
              <button
                className={`marca-filter-btn ${marcaSeleccionada === 'todas' ? 'active' : ''}`}
                onClick={() => setMarcaSeleccionada('todas')}
              >
                <Smartphone size={14} />
                Todas
              </button>
              {marcasDisponibles.map((marca) => (
                <button
                  key={marca}
                  className={`marca-filter-btn ${marcaSeleccionada === marca ? 'active' : ''}`}
                  onClick={() => setMarcaSeleccionada(marca)}
                >
                  {marca === 'Apple' || marca === 'iPhone' ? (
                    <Apple size={14} />
                  ) : (
                    <Phone size={14} />
                  )}
                  {marca}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grid de reparaciones */}
        <Row className="g-4">
          {reparacionesFiltradas.map((reparacion, idx) => (
            <Col lg={4} md={6} key={reparacion.key}>
              <div className={`pricing-card ${idx === 0 ? 'destacado' : ''}`}>
                {idx === 0 && (
                  <div className="pricing-popular">
                    <Star size={14} />
                    Más solicitado
                  </div>
                )}

                <div className="pricing-card-header">
                  <div className="pricing-plan-icon">{reparacion.icono}</div>
                  <h3 className="pricing-plan-name">{reparacion.nombre}</h3>

                  {reparacion.precioDesde && (
                    <div className="pricing-price">
                      <span className="pricing-currency">$</span>
                      <span className="pricing-amount">
                        {reparacion.precioDesde.toLocaleString('es-AR')}
                      </span>
                      <span className="pricing-period">desde</span>
                    </div>
                  )}

                  <div className="pricing-stock-info">
                    {reparacion.totalPiezas} piezas disponibles
                  </div>
                </div>

                <div className="pricing-card-body">
                  <p className="pricing-descripcion">
                    {reparacion.key === 'pantalla' && 'Reemplazo de display con garantía incluida'}
                    {reparacion.key === 'bateria' && 'Batería original o de alta calidad'}
                    {reparacion.key === 'carga' && 'Diagnóstico y reparación del sistema de carga'}
                    {reparacion.key === 'camara' && 'Reparación o reemplazo de módulo de cámara'}
                    {reparacion.key === 'botones' && 'Reparación de botones y flexes'}
                    {reparacion.key === 'placa' && 'Reparación electrónica avanzada'}
                  </p>

                  <div className="pricing-marcas">
                    <div className="pricing-marcas-header">
                      <span>Precios por marca</span>
                      <span className="pricing-marcas-sub">(mano de obra incluida)</span>
                    </div>
                    {reparacion.marcas.map((m, i) => (
                      <div key={m.marca} className="pricing-marca-item">
                        <span className="marca-nombre">{m.marca}</span>
                        <span className="marca-precio">${m.precioMin.toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                    {reparacion.marcas.length === 0 && (
                      <div className="pricing-sin-precios">Consultar disponibilidad</div>
                    )}
                  </div>
                </div>

                <div className="pricing-card-footer">
                  <Button
                    className={`pricing-btn ${idx === 0 ? 'pricing-btn-primary' : 'pricing-btn-outline'}`}
                  >
                    Solicitar presupuesto
                    <ChevronRight size={16} className="ms-2" />
                  </Button>
                  <p className="pricing-note">Diagnóstico gratuito sin compromiso</p>
                </div>
              </div>
            </Col>
          ))}
        </Row>

        {/* Características adicionales */}
        <div className="pricing-features-grid">
          <Row className="g-4">
            <Col md={3} sm={6}>
              <div className="pricing-feature-item">
                <div className="pricing-feature-icon-wrapper">
                  <Shield size={24} />
                </div>
                <h4>Garantía 90 días</h4>
                <p>En todas nuestras reparaciones</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="pricing-feature-item">
                <div className="pricing-feature-icon-wrapper">
                  <Clock size={24} />
                </div>
                <h4>Rápida entrega</h4>
                <p>En promedio 24-48 horas</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="pricing-feature-item">
                <div className="pricing-feature-icon-wrapper">
                  <Award size={24} />
                </div>
                <h4>Piezas certificadas</h4>
                <p>Calidad garantizada</p>
              </div>
            </Col>
            <Col md={3} sm={6}>
              <div className="pricing-feature-item">
                <div className="pricing-feature-icon-wrapper">
                  <Search size={24} />
                </div>
                <h4>Diagnóstico gratis</h4>
                <p>Sin cargo ni obligación</p>
              </div>
            </Col>
          </Row>
        </div>

        {/* CTA final */}
        <div className="pricing-cta-final text-center">
          <h3>¿No encontraste tu modelo?</h3>
          <p>Contactanos y te daremos un presupuesto personalizado</p>
          <Button className="pricing-btn-secondary">
            Hablar con un asesor
            <Wrench size={16} className="ms-2" />
          </Button>
        </div>
      </Container>
    </section>
  );
};

export default PricingSection;
