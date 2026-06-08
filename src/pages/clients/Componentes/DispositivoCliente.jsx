// pages/cliente/Componentes/DispositivoCliente.jsx
import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { Smartphone, ChevronRight } from 'lucide-react';

const getEstadoColor = (estado) => {
  const colores = {
    'PENDIENTE': 'warning',
    'EN_REPARACION': 'info',
    'TERMINADO': 'success',
    'CANCELADO': 'danger',
    'ESPERANDO_PIEZA': 'secondary'
  };
  return colores[estado] || 'light';
};

const getEstadoTexto = (estado) => {
  const textos = {
    'PENDIENTE': 'Pendiente',
    'EN_REPARACION': 'En reparación',
    'TERMINADO': 'Completado',
    'CANCELADO': 'Cancelado',
    'ESPERANDO_PIEZA': 'Esperando pieza'
  };
  return textos[estado] || estado;
};

export const DispositivosCliente = ({ dispositivos, seleccionado, onSelect }) => {
  return (
    <Card className="shadow-sm">
      <Card.Header className="bg-white">
        <h5 className="mb-0">Dispositivos</h5>
        <small className="text-muted">
          {dispositivos.length} {dispositivos.length === 1 ? 'dispositivo' : 'dispositivos'}
        </small>
      </Card.Header>
      <Card.Body className="p-0">
        <ListGroup variant="flush">
          {dispositivos.length > 0 ? (
            dispositivos.map((disp) => {
              // ✅ CORREGIDO: Manejar correctamente cuando modelo es un objeto
              // Extraer nombre del modelo
              let nombreModelo = 'Modelo desconocido';
              if (disp.modelo) {
                if (typeof disp.modelo === 'object') {
                  nombreModelo = disp.modelo.nombre_modelo || 'Modelo desconocido';
                } else {
                  nombreModelo = disp.modelo;
                }
              }
              
              // Extraer nombre de la marca
              let nombreMarca = 'Marca desconocida';
              
              // Primero intentar desde disp.modelo?.marca
              if (disp.modelo?.marca) {
                if (typeof disp.modelo.marca === 'object') {
                  nombreMarca = disp.modelo.marca.marca || 'Marca desconocida';
                } else {
                  nombreMarca = disp.modelo.marca;
                }
              } 
              // Luego intentar desde disp.marca directamente
              else if (disp.marca) {
                if (typeof disp.marca === 'object') {
                  nombreMarca = disp.marca.marca || 'Marca desconocida';
                } else {
                  nombreMarca = disp.marca;
                }
              }
              
              return (
                <ListGroup.Item
                  key={disp.id_dispositivo}
                  action
                  active={seleccionado?.id_dispositivo === disp.id_dispositivo}
                  onClick={() => onSelect(disp)}
                  className="d-flex justify-content-between align-items-center p-3"
                >
                  <div className="d-flex align-items-center">
                    <div className={`bg-${getEstadoColor(disp.estado)} bg-opacity-10 p-2 rounded-2 me-3`}>
                      <Smartphone size={20} className={`text-${getEstadoColor(disp.estado)}`} />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">
                        {nombreMarca} {nombreModelo}
                      </h6>
                      <small className="text-muted">
                        ID: {disp.id_dispositivo}
                      </small>
                    </div>
                  </div>
                  <div className="d-flex align-items-center">
                    <Badge bg={getEstadoColor(disp.estado)} className="me-2">
                      {getEstadoTexto(disp.estado)}
                    </Badge>
                    <ChevronRight size={16} className="text-muted" />
                  </div>
                </ListGroup.Item>
              );
            })
          ) : (
            <ListGroup.Item className="text-center py-4">
              <Smartphone size={32} className="text-muted mb-2" />
              <p className="text-muted mb-0">No hay dispositivos registrados</p>
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};