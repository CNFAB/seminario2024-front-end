// pages/cliente/Componentes/EstadoActual.jsx
import React from 'react';
import { Card, Badge, ProgressBar, Button } from 'react-bootstrap';
import {
  Smartphone,
  Wrench,
  Clock,
  CheckCircle,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  XCircle,
} from 'lucide-react';

const getEstadoColor = (estado) => {
  const colores = {
    PENDIENTE: 'warning',
    EN_REPARACION: 'info',
    TERMINADO: 'success',
    CANCELADO: 'danger',
    ESPERANDO_PIEZA: 'secondary',
  };
  return colores[estado] || 'light';
};

const getEstadoIcon = (estado) => {
  switch (estado) {
    case 'EN_REPARACION':
      return <Wrench size={20} />;
    case 'TERMINADO':
      return <CheckCircle size={20} />;
    case 'ESPERANDO_PIEZA':
      return <Clock size={20} />;
    default:
      return <AlertCircle size={20} />;
  }
};

const getProgreso = (estado) => {
  const progreso = {
    PENDIENTE: 20,
    EN_REPARACION: 60,
    ESPERANDO_PIEZA: 40,
    TERMINADO: 100,
    CANCELADO: 100,
  };
  return progreso[estado] || 0;
};

export const EstadoActual = ({ dispositivo, onAceptar, onRechazar, onCancelar }) => {
  if (!dispositivo) return null;

  const nombreModelo = dispositivo.modelo?.nombre_modelo || 'Modelo desconocido';
  const nombreMarca = dispositivo.modelo?.marca?.marca || 'Marca desconocida';

  // Simular diagnóstico y reparación para demostración
  const tieneDiagnostico = true;
  const tieneReparacion = true;
  const diagnosticoId = 1;
  const reparacionId = 1;

  return (
    <div>
      <Card className="shadow-sm mb-4">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <Smartphone size={20} className="me-2" />
            {nombreMarca} {nombreModelo}
          </h5>
          <small>ID: {dispositivo.id_dispositivo}</small>
        </Card.Header>
        <Card.Body>
          <div className="d-flex align-items-center mb-4">
            <div
              className={`bg-${getEstadoColor(dispositivo.estado)} bg-opacity-10 p-3 rounded-3 me-3`}
            >
              {getEstadoIcon(dispositivo.estado)}
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-1">Estado actual</h6>
              <Badge bg={getEstadoColor(dispositivo.estado)} className="px-3 py-2">
                {dispositivo.estado || 'PENDIENTE'}
              </Badge>
            </div>
          </div>

          <ProgressBar
            now={getProgreso(dispositivo.estado)}
            variant={getEstadoColor(dispositivo.estado)}
            className="mb-4"
            style={{ height: '10px' }}
          />

          {tieneDiagnostico && (
            <Card className="bg-light border-0 mb-3">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Diagnóstico</h6>
                <div>
                  <Button
                    variant="outline-success"
                    size="sm"
                    className="me-1"
                    onClick={() => onAceptar(diagnosticoId)}
                  >
                    <ThumbsUp size={14} className="me-1" />
                    Aceptar
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onRechazar(diagnosticoId)}
                  >
                    <ThumbsDown size={14} className="me-1" />
                    Rechazar
                  </Button>
                </div>
              </Card.Header>
              <Card.Body>
                <p className="mb-2">
                  <strong>Problema detectado:</strong> Falla en la pantalla
                </p>
                <p className="mb-2">
                  <strong>Costo estimado:</strong> $120.50
                </p>
                <p className="mb-0">
                  <small className="text-muted">
                    Observaciones: Se requiere cambio de pantalla
                  </small>
                </p>
              </Card.Body>
            </Card>
          )}

          {tieneReparacion && (
            <Card className="bg-light border-0">
              <Card.Header className="bg-white d-flex justify-content-between align-items-center">
                <h6 className="mb-0">Reparación en curso</h6>
                <Button
                  variant="outline-warning"
                  size="sm"
                  onClick={() => onCancelar(reparacionId)}
                >
                  <XCircle size={14} className="me-1" />
                  Cancelar reparación
                </Button>
              </Card.Header>
              <Card.Body>
                <p>
                  <strong>Técnico:</strong> Juan Pérez
                </p>
                <p>
                  <strong>Fecha inicio:</strong> 25/02/2026
                </p>
                <p>
                  <strong>Piezas a usar:</strong>
                </p>
                <Badge bg="info" className="me-1">
                  Pantalla
                </Badge>
                <Badge bg="info">Batería</Badge>
              </Card.Body>
            </Card>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};
