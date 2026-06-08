// src/components/Home/Componentes/EstadisticasEstrellas.jsx
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import testimonioService from '../../../../services/testimonioService';

import '../Carrusel/css/EstadisticasEstrellas.css';
import '../Carrusel/css/Testimonios.css'

const EstadisticasEstrellas = () => {
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    promedio: 0,
    porcentajeRecomiendan: 0,
    distribucion: {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

const cargarEstadisticas = async () => {
  try {
    setLoading(true);
    const response = await testimonioService.obtenerEstadisticas();
    console.log('Respuesta estadísticas:', response);
    
    // ✅ Corregido: extraer los datos correctamente
    let datos = null;
    
    // Si response tiene success y data
    if (response && response.success === true && response.data) {
      datos = response.data;
    } 
    // Si response ya es el objeto con total, promedio, etc.
    else if (response && response.total !== undefined) {
      datos = response;
    }
    
    if (datos) {
      setEstadisticas({
        total: datos.total || 0,
        promedio: datos.promedio || 0,
        porcentajeRecomiendan: datos.porcentajeRecomiendan || 0,
        distribucion: datos.distribucion || { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      });
    }
  } catch (error) {
    console.error('Error al cargar estadísticas:', error);
  } finally {
    setLoading(false);
  }
};
  const getMaxValue = () => {
    const valores = Object.values(estadisticas.distribucion);
    return Math.max(...valores, 1);
  };

  const maxValue = getMaxValue();

  if (loading) {
    return (
      <div className="estadisticas-loading">
        <div className="estadisticas-spinner"></div>
      </div>
    );
  }

  if (estadisticas.total === 0) {
    return null;
  }

  return (
    <div className="estadisticas-container">
      <h3 className="estadisticas-titulo">Distribución de calificaciones</h3>
      
      <div className="estadisticas-barras">
        {[5, 4, 3, 2, 1].map((estrellas) => {
          const cantidad = estadisticas.distribucion[estrellas];
          const porcentaje = estadisticas.total > 0 
            ? (cantidad / estadisticas.total) * 100 
            : 0;
          const width = (cantidad / maxValue) * 100;
          
          return (
            <div key={estrellas} className="estadistica-barra-item">
              <div className="estadistica-label">
                <div className="estadistica-estrellas">
                  {[...Array(estrellas)].map((_, i) => (
                    <Star key={i} size={14} className="estrella-pequena filled" />
                  ))}
                  {[...Array(5 - estrellas)].map((_, i) => (
                    <Star key={i} size={14} className="estrella-pequena empty" />
                  ))}
                </div>
                <span className="estadistica-cantidad">({cantidad})</span>
              </div>
              <div className="estadistica-barra-fondo">
                <div 
                  className="estadistica-barra-lleno"
                  style={{ width: `${width}%` }}
                />
              </div>
              <span className="estadistica-porcentaje">{Math.round(porcentaje)}%</span>
            </div>
          );
        })}
      </div>

      <div className="estadisticas-resumen">
        <div className="resumen-item">
          <span className="resumen-label">Total calificaciones</span>
          <span className="resumen-valor">{estadisticas.total}</span>
        </div>
        <div className="resumen-item">
          <span className="resumen-label">Promedio</span>
          <span className="resumen-valor promedio">
            {estadisticas.promedio.toFixed(1)} ⭐
          </span>
        </div>
        <div className="resumen-item">
          <span className="resumen-label">Recomiendan</span>
          <span className="resumen-valor recomendacion">
            {Math.round(estadisticas.porcentajeRecomiendan)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default EstadisticasEstrellas;