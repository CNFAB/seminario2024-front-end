// src/components/Home/Componentes/TestimoniosCarrusel.jsx
import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import testimonioService from '../../../../services/testimonioService';
import '../Carrusel/css/TestimoniosCarrusel.css';
import '../Carrusel/css/Testimonios.css';
const TestimoniosCarrusel = () => {
  const [testimonios, setTestimonios] = useState([]);
  const [indexActual, setIndexActual] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarTestimonios();
  }, []);

// Cambia la llamada para usar la estructura correcta
   const cargarTestimonios = async () => {
      try {
        setLoading(true);
        const response = await testimonioService.obtenerAprobados();
        console.log("testimonios aprobados", response);
        
        // ✅ Corregido: response ya es el array de testimonios
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
          className={`carrusel-star ${i <= calificacion ? 'filled' : 'empty'}`}
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

  if (loading) {
    return (
      <div className="carrusel-loading">
        <div className="carrusel-spinner"></div>
        <p>Cargando experiencias...</p>
      </div>
    );
  }

  if (testimonios.length === 0) {
    return null;
  }

  const testimonioActual = testimonios[indexActual];

  return (
    <div className="testimonios-carrusel-container pt-4">
      <div className="carrusel-header">
        <h2 className="carrusel-titulo">Lo que dicen nuestros clientes</h2>
        <p className="carrusel-subtitulo">
          Opiniones reales de personas que confiaron en nosotros
        </p>
      </div>

      <div className="carrusel-wrapper">
        <button 
          className="carrusel-btn carrusel-btn-prev"
          onClick={testimonioAnterior}
          aria-label="Testimonio anterior"
        >
          <ChevronLeft size={28} />
        </button>

        <div className="carrusel-content">
          <div className="carrusel-card">
            <div className="carrusel-quote-icon">
              <Quote size={40} />
            </div>
            
            <div className="carrusel-stars">
              {renderStars(testimonioActual.calificacion || 5)}
            </div>
            
            <p className="carrusel-comentario">
              "{testimonioActual.comentario || 'Excelente servicio, muy recomendable.'}"
            </p>
            
            <div className="carrusel-cliente">
              <strong>{testimonioActual.cliente_nombre || 'Cliente'}</strong>
              <div className="carrusel-dispositivo">
                📱 {testimonioActual.dispositivo || 'Dispositivo reparado'}
              </div>
              <div className="carrusel-fecha">
                {formatearFecha(testimonioActual.fecha)}
              </div>
            </div>
          </div>
        </div>

        <button 
          className="carrusel-btn carrusel-btn-next"
          onClick={testimonioSiguiente}
          aria-label="Testimonio siguiente"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      <div className="carrusel-indicadores">
        {testimonios.map((_, idx) => (
          <button
            key={idx}
            className={`carrusel-dot ${idx === indexActual ? 'active' : ''}`}
            onClick={() => setIndexActual(idx)}
          />
        ))}
      </div>
      
      <div className="carrusel-counter">
        {indexActual + 1} de {testimonios.length}
      </div>
    </div>
  );
};

export default TestimoniosCarrusel;