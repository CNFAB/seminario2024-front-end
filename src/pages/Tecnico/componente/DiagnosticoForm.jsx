
import React, { useState } from 'react';
import { Form, Row, Col, Button,Badge } from 'react-bootstrap';
import { Calculator } from 'lucide-react';
import {
  ESTADOS_DIAGNOSTICO,
  GRAVEDAD_OPTIONS,
  getEstadoLabel
} from '../../../constant/estados';
import { ModalCalculadorPrecio } from './ModalCalculadorPrecio';

export function DiagnosticoForm({
  formData,
  onChange,
  modo = 'edicion',
  readOnly = false
}) {
  const [showCalculador, setShowCalculador] = useState(false);

  const handleChange = (field, value) => {
    if (onChange) onChange(field, value);
  };
  const estadoColor = {
  ESPERANDO_DIAGNOSTICO: 'warning'};


  return (
    <>
      <Form>
        <Row className="g-3">

          {/* GRAVEDAD */}
          <Col md={modo === 'creacion' ? 6 : 4}>
            <Form.Group>
              <Form.Label className="text-muted small fw-bold">
                GRAVEDAD
              </Form.Label>
              <div className="d-flex gap-2 flex-wrap">
                {GRAVEDAD_OPTIONS.map(({ value, label, color }) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={formData.gravedad === value ? color : 'outline-secondary'}
                    onClick={() => !readOnly && handleChange('gravedad', value)}
                    disabled={readOnly}
                    className="px-3"
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </Form.Group>
          </Col>

          {/* ESTADO */}
          <Col md={modo === 'creacion' ? 6 : 4}>
            <Form.Group>
                <Form.Label className="text-muted small fw-bold">
                  ESTADO
                </Form.Label>

                <div>
                  <Badge bg={estadoColor[formData.estado] || 'secondary'}>
                    {getEstadoLabel(formData.estado)}
                  </Badge>
                </div>
              </Form.Group>
          </Col>


          {/* FECHA EXPIRACIÓN — solo en creación */}
          {modo === 'creacion' && (
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-muted small fw-bold">
                  FECHA EXPIRACIÓN
                </Form.Label>
                <Form.Control
                  type="date"
                  size="sm"
                  value={formData.fecha_expiracion || ''}
                  onChange={(e) => handleChange('fecha_expiracion', e.target.value)}
                  disabled={readOnly}
                />
              </Form.Group>
            </Col>
          )}

          {/* CAUSA DETECTADA */}
          <Col md={12}>
            <Form.Group>
              <Form.Label className="text-muted small fw-bold">
                CAUSA DETECTADA
              </Form.Label>
              <Form.Control
                type="text"
                size="sm"
                value={formData.causa_detectada || ''}
                onChange={(e) => handleChange('causa_detectada', e.target.value)}
                disabled={readOnly}
                placeholder="Describe la causa del problema..."
              />
            </Form.Group>
          </Col>

          {/* SOLUCIÓN PROPUESTA */}
          <Col md={12}>
            <Form.Group>
              <Form.Label className="text-muted small fw-bold">
                SOLUCIÓN PROPUESTA
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                size="sm"
                value={formData.solucion || ''}
                onChange={(e) => handleChange('solucion', e.target.value)}
                disabled={readOnly}
                placeholder="Describe la solución..."
              />
            </Form.Group>
          </Col>

          {/* OBSERVACIONES */}
          <Col md={12}>
            <Form.Group>
              <Form.Label className="text-muted small fw-bold">
                OBSERVACIONES
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                size="sm"
                value={formData.observacion || ''}
                onChange={(e) => handleChange('observacion', e.target.value)}
                disabled={readOnly}
                placeholder="Observaciones adicionales..."
              />
            </Form.Group>
          </Col>

        </Row>
      </Form>

      {/* MODAL CALCULADOR — fuera del Form para evitar conflictos */}
      <ModalCalculadorPrecio
        show={showCalculador}
        onHide={() => setShowCalculador(false)}
        onAceptar={(resultado) => {
        // Compatible con string (legado) y objeto (nuevo)
        if (typeof resultado === 'object') {
          handleChange('costo', resultado.precioTotal);
          if (resultado.piezaId) handleChange('id_pieza', resultado.piezaId);
        } else {
          handleChange('costo', resultado);
        }
        setShowCalculador(false);
      }}
      />
    </>
  );
}