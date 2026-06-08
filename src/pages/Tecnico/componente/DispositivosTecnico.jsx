// pages/tecnico/componentes/DispositivosTecnico.jsx
import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { Smartphone, ChevronRight } from 'lucide-react';

const getEstadoBadgeColor = (estado) => {
  const map = {
    APROBADO:'success',
    PENDIENTE: 'warning',
    EN_REPARACION: 'info',
    ESPERANDO_APROBACION:'info',
    TERMINADO: 'success',
    CANCELADO: 'danger',
    ESPERANDO_PIEZA: 'secondary',
    EN_REVISION:'secondary',
    LISTO_PARA_RETIRAR: 'success',
  };
  return map[estado] || 'grey';
};

const getEstadoTexto = (estado) => {
  const map = {
    PENDIENTE: 'Pendiente',
    EN_REPARACION: 'En reparación',
    TERMINADO: 'Completado',
    CANCELADO: 'Cancelado',
    ESPERANDO_PIEZA: 'Esperando pieza',
    LISTO_PARA_RETIRAR: 'Listo para retirar',
  };
  return map[estado] || estado;
};

export function DispositivosTecnico({ dispositivos, seleccionado, onSelect }) {
  return (
    <Card className="shadow-sm h-100">
      <Card.Header className="bg-white">
        <h5 className="mb-0">Dispositivos asignados</h5>
        <small className="text-muted">
          {dispositivos.length}{' '}
          {dispositivos.length === 1 ? 'dispositivo' : 'dispositivos'}
        </small>
      </Card.Header>

      <Card.Body className="p-0">
        <ListGroup variant="flush">
          {dispositivos.length > 0 ? (
            dispositivos.map((disp) => {
              // ── Extraer marca ──
              let nombreMarca = 'Marca desconocida';
              if (disp.modelo?.marca) {
                nombreMarca =
                  typeof disp.modelo.marca === 'object'
                    ? disp.modelo.marca.marca || 'Marca desconocida'
                    : disp.modelo.marca;
              } else if (disp.marca) {
                nombreMarca =
                  typeof disp.marca === 'object'
                    ? disp.marca.marca || 'Marca desconocida'
                    : disp.marca;
              }

              // ── Extraer modelo ──
              let nombreModelo = 'Modelo desconocido';
              if (disp.modelo) {
                nombreModelo =
                  typeof disp.modelo === 'object'
                    ? disp.modelo.nombre_modelo || 'Modelo desconocido'
                    : disp.modelo;
              }

              const estado = disp.estado_actual || disp.estado;
              const estadoColor = getEstadoBadgeColor(estado);
              const isSelected =
                seleccionado?.id_dispositivo === disp.id_dispositivo;

              return (
                <ListGroup.Item
                  key={disp.id_dispositivo}
                  action
                  active={isSelected}
                  onClick={() => onSelect(disp)}
                  className="d-flex justify-content-between align-items-center p-3"
                >
                  <div className="d-flex align-items-center">
                    <div
                      className={`bg-${estadoColor} bg-opacity-10 p-2 rounded-2 me-3`}
                    >
                      <Smartphone
                        size={20}
                        className={`text-${estadoColor}`}
                      />
                    </div>
                    <div>
                      <h6 className="fw-bold mb-1">
                        {nombreMarca} {nombreModelo}
                      </h6>
                      <small className="text-muted">
                        ID: {disp.id_dispositivo}
                        {disp.imei ? ` · IMEI: ${disp.imei}` : ''}
                      </small>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <Badge bg={estadoColor}>
                      {getEstadoTexto(estado)}
                    </Badge>
                    <ChevronRight size={16} className="text-muted" />
                  </div>
                </ListGroup.Item>
              );
            })
          ) : (
            <ListGroup.Item className="text-center py-4">
              <Smartphone size={32} className="text-muted mb-2" />
              <p className="text-muted mb-0">
                No hay dispositivos asignados
              </p>
            </ListGroup.Item>
          )}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}