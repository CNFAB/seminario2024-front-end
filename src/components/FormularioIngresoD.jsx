import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Form, Button, Container, Row, Col, Alert, Badge, Spinner } from 'react-bootstrap';
import { Check, User, Wrench, AlertCircle } from 'lucide-react';
import { ingresoService } from '../services/ingresoService';
import { dispositivoService } from '../services/dispositivoService';
import { diagnosticoService } from '../services/diagnosticoService';
import reparacionService from '../services/ReparacionService'; // ← IMPORTANTE: Agregar esta importación

const FormularioIngresoD = ({ onComplete, user, dispositivoId }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const [fotoFrontal, setFotoFrontal] = useState(null);
  const [fotoTrasera, setFotoTrasera] = useState(null);
  const [dispositivo, setDispositivo] = useState(null);
  const [dispositivoInfo, setDispositivoInfo] = useState(null);
  const [fotoFrontalPreview, setFotoFrontalPreview] = useState(null);
  const [fotoTraseraPreview, setFotoTraseraPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [tecnicos, setTecnicos] = useState([]);
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(null);
  const [loadingTecnicos, setLoadingTecnicos] = useState(true);

  useEffect(() => {
    if (dispositivoId) {
      // Si viene por prop
      const cargar = async () => {
        try {
          const result = await dispositivoService.obtenerPorId(dispositivoId);
          console.log('📦 Resultado completo:', result); // ← AGREGAR
          const disp = result?.data || result;
          setDispositivo(disp?.id_dispositivo);
          setDispositivoInfo(disp); // ← Guardar info
        } catch (e) {
          console.error('Error', e);
        }
      };
      cargar();
      return;
    }

    const fetch = async () => {
      try {
        const result = await dispositivoService.obtenerUltimo();
        console.log('📦 Resultado completo:', result); // ← AGREGAR
        let disp = null;
        if (result?.id_dispositivo) disp = result;
        else if (result?.data?.id_dispositivo) disp = result.data;

        if (disp) {
          setDispositivo(disp.id_dispositivo);
          setDispositivoInfo(disp); // ← Guardar info
        }
      } catch (e) {
        console.error('Error dispositivo', e);
      }
    };
    fetch();
  }, [dispositivoId]);

  useEffect(() => {
    const fetchTecnicos = async () => {
      setLoadingTecnicos(true);
      try {
        const response = await diagnosticoService.obtenerCargaTecnicos();
        let tecnicosData = [];
        if (response && response.success && response.data) {
          tecnicosData = response.data;
        } else if (Array.isArray(response)) {
          tecnicosData = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          tecnicosData = response.data;
        }
        setTecnicos(tecnicosData);
        if (tecnicosData.length > 0) {
          setTecnicoSeleccionado(tecnicosData[0].id_usuario);
        }
      } catch (e) {
        console.error('Error carga técnicos', e);
        setMessage('Error al cargar técnicos disponibles');
        setMessageType('danger');
      } finally {
        setLoadingTecnicos(false);
      }
    };
    fetchTecnicos();
  }, []);

  const getBadgeBg = (totalActivo, enLinea) => {
    if (enLinea) return 'secondary';
    if (totalActivo === 0) return 'success';
    if (totalActivo <= 2) return 'warning';
    return 'danger';
  };

  const getBadgeLabel = (totalActivo, enLinea) => {
    if (!enLinea) return '⚫ Sin conexión';
    if (totalActivo === 0) return '🟢 Disponible';
    if (totalActivo <= 2) return '🟡 Ocupado';
    return '🔴 Saturado';
  };

  const getCardStyle = (seleccionado) => ({
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: seleccionado ? '2px solid #0d6efd' : '1px solid #dee2e6',
    backgroundColor: seleccionado ? '#e7f0ff' : '#fff',
    borderRadius: '12px',
    padding: '15px',
  });

  const handleFotoFrontal = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoFrontalPreview(URL.createObjectURL(file));
      setFotoFrontal(file);
    }
  };

  const handleFotoTrasera = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoTraseraPreview(URL.createObjectURL(file));
      setFotoTrasera(file);
    }
  };

  const onSubmit = async (data) => {
    if (!dispositivo) {
      setMessage('No se encontró información del dispositivo');
      setMessageType('danger');
      return;
    }
    const recepcionistaId = user?.id_usuario;
    if (!user?.id_usuario) {
      setMessage('No se encontró información del recepcionista');
      setMessageType('danger');
      return;
    }
    if (!tecnicoSeleccionado) {
      setMessage('Debe seleccionar un técnico');
      setMessageType('danger');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const ingresoData = {
        id_dispositivo: dispositivo,
        id_usuario: recepcionistaId,
        comentario_cliente: data.observacion || '',
        estado_del_ingreso: data.estado_del_ingreso || '',
        sim: data.sim === 'true' ? 1 : 0,
        memoria_sd: data.memoria_sd === 'true' ? 1 : 0,
        revision_tecnica: data.revision_tecnica === 'true' ? 1 : 0,
        foto_frontal: fotoFrontal,
        foto_trasera: fotoTrasera,
      };

      const result = await ingresoService.registrar(ingresoData);

      if (!result.success) {
        setMessage(result.message || 'Error al registrar el ingreso');
        setMessageType('danger');
        setLoading(false);
        return;
      }

      const idIngreso =
        result.data?.id_ingreso ?? result.data?.ingreso?.id_ingreso ?? result.id_ingreso;

      if (data.revision_tecnica === 'true') {
        // ============================================
        // CASO 1: Cliente QUIERE diagnóstico
        // ============================================
        try {
          await diagnosticoService.crearAutomaticoConTecnico(
            idIngreso,
            tecnicoSeleccionado,
            data.observacion || ''
          );
          setMessage(' Ingreso y diagnóstico registrados correctamente');
          setMessageType('success');
        } catch (diagError) {
          console.warn('Falló diagnóstico automático:', diagError);
          setMessage('Ingreso registrado, pero hubo un error al crear el diagnóstico.');
          setMessageType('warning');
          setLoading(false);
          return;
        }
      } else {
        // ============================================
        // CASO 2: Cliente NO quiere diagnóstico
        // Crear REPARACIÓN DIRECTA (no presupuesto)
        // ============================================
        try {
          await reparacionService.crear({
            id_ingreso: idIngreso,
            id_usuario: tecnicoSeleccionado,
            id_diagnostico: null, // ← Importante: null para reparación directa
            comentario: data.observacion || 'Reparación directa solicitada por el cliente',
            estado_general: 'PENDIENTE',
          });

          setMessage(
            '✅ Ingreso y reparación directa creados. El técnico podrá agregar las piezas.'
          );
          setMessageType('success');
        } catch (repError) {
          console.error('Error al crear reparación directa:', repError);
          setMessage('⚠️ Ingreso creado, pero hubo un error al crear la reparación directa');
          setMessageType('warning');
        }
      }

      reset();
      setFotoFrontal(null);
      setFotoTrasera(null);
      setFotoFrontalPreview(null);
      setFotoTraseraPreview(null);

      if (onComplete) {
        const tecnico = tecnicos.find((t) => t.id_usuario === tecnicoSeleccionado);
        const tecnicoNombre = tecnico ? `${tecnico.nombre} ${tecnico.apellido}` : 'No asignado';

        onComplete({
          sim: data.sim,
          memoria_sd: data.memoria_sd,
          revision_tecnica: data.revision_tecnica,
          observacion: data.observacion || '',
          estado_del_ingreso: data.estado_del_ingreso || '',
          tecnicoNombre,
          tipo: data.revision_tecnica === 'true' ? 'diagnostico' : 'reparacion_directa',
        });
      }
    } catch (error) {
      console.error('Error al registrar ingreso:', error);
      setMessage('❌ Error al registrar el ingreso');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Form onSubmit={handleSubmit(onSubmit)} className="p-3">
        <h4 className="mb-4"> Ingreso de Dispositivo</h4>

        {message && (
          <Alert
            variant={
              messageType === 'success'
                ? 'success'
                : messageType === 'warning'
                  ? 'warning'
                  : 'danger'
            }
          >
            {message}
          </Alert>
        )}

        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-bold"> Recepcionista</Form.Label>
              <div className="d-flex align-items-center gap-2 p-2 bg-light border rounded">
                <div className="bg-primary bg-opacity-10 p-2 rounded-circle">
                  <User size={16} className="text-primary" />
                </div>
                <div>
                  <strong className="d-block">
                    {user?.nombre} {user?.apellido}
                  </strong>
                  <small className="text-muted">{user?.correo}</small>
                </div>
              </div>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label className="fw-bold"> Dispositivo</Form.Label>
              <h5 className="fw-bold text-primary mt-1">
                {dispositivoInfo
                  ? `${dispositivoInfo.modelo?.marca?.marca || ''} ${dispositivoInfo.modelo?.nombre_modelo || ''}`
                  : 'Cargando...'}
              </h5>
            </Form.Group>
          </Col>
        </Row>

        <div className="mb-4">
          <Form.Label className="fw-bold d-flex align-items-center gap-2 mb-3">
            <Wrench size={18} />
            Asignar técnico *
          </Form.Label>

          {loadingTecnicos ? (
            <div className="d-flex align-items-center gap-2 text-muted p-3 border rounded bg-light">
              <Spinner animation="border" size="sm" />
              <span>Cargando técnicos disponibles...</span>
            </div>
          ) : tecnicos.length === 0 ? (
            <Alert variant="warning" className="d-flex align-items-center gap-2 py-2 mb-0">
              <AlertCircle size={16} />
              No hay técnicos disponibles en este momento.
            </Alert>
          ) : (
            <Row className="g-3">
              {tecnicos.map((tec) => {
                const seleccionado = tecnicoSeleccionado === tec.id_usuario;
                return (
                  <Col xs={12} sm={6} md={4} key={tec.id_usuario}>
                    <div
                      style={getCardStyle(seleccionado)}
                      onClick={() => setTecnicoSeleccionado(tec.id_usuario)}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <strong style={{ fontSize: '1rem' }}>
                          {tec.nombre} {tec.apellido}
                        </strong>
                        {seleccionado && <Check size={18} className="text-primary flex-shrink-0" />}
                      </div>

                      <Badge bg={getBadgeBg(tec.total_activo, tec.en_linea)} className="mb-3">
                        {getBadgeLabel(tec.total_activo, tec.en_linea)}
                      </Badge>

                      <div className="d-flex justify-content-around mt-2 mb-2">
                        <div className="text-center">
                          <div className="fw-bold text-warning">{tec.diagnosticos_pendientes}</div>
                          <small className="text-muted">📋 Diag.</small>
                        </div>
                        <div className="text-center">
                          <div className="fw-bold text-info">{tec.reparaciones_pendientes}</div>
                          <small className="text-muted">⏰ Rep.</small>
                        </div>
                        <div className="text-center">
                          <div className="fw-bold text-success">{tec.reparaciones_activas}</div>
                          <small className="text-muted">⚙️ Curso</small>
                        </div>
                      </div>

                      <div className="text-center mt-2 pt-2 border-top">
                        <small className="text-muted">📧 {tec.correo}</small>
                      </div>
                    </div>
                  </Col>
                );
              })}
            </Row>
          )}
        </div>

        <Row className="mb-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label> Tiene SIM *</Form.Label>
              <Form.Select
                {...register('sim', { required: 'Debe seleccionar una opción' })}
                isInvalid={errors.sim}
              >
                <option value="">Seleccione una opción</option>
                <option value="true"> Sí</option>
                <option value="false">No</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errors.sim?.message}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label> Memoria SD *</Form.Label>
              <Form.Select
                {...register('memoria_sd', { required: 'Debe seleccionar una opción' })}
                isInvalid={errors.memoria_sd}
              >
                <option value="">Seleccione una opción</option>
                <option value="true"> Sí</option>
                <option value="false"> No</option>
              </Form.Select>
              <Form.Control.Feedback type="invalid">
                {errors.memoria_sd?.message}
              </Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3">
          <Form.Label> Revisión técnica *</Form.Label>
          <Form.Select
            {...register('revision_tecnica', { required: 'Debe seleccionar una opción' })}
            isInvalid={errors.revision_tecnica}
          >
            <option value="">Seleccione una opción</option>
            <option value="true">Sí - Quiero diagnóstico</option>
            <option value="false">No - Reparación directa</option> {/* ← Cambiar texto */}
          </Form.Select>
          <Form.Control.Feedback type="invalid">
            {errors.revision_tecnica?.message}
          </Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label> Comentario del cliente</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Ingrese observaciones del cliente o las piezas que desea reparar..."
            {...register('observacion')}
            isInvalid={errors.observacion}
          />
          <Form.Text className="text-muted">
            Si seleccionó "No - Presupuesto directo", especifique aquí las piezas que quiere reparar
          </Form.Text>
          <Form.Control.Feedback type="invalid">
            {errors.observacion?.message}
          </Form.Control.Feedback>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label> Observaciones técnicas</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            placeholder="Ingrese observaciones técnicas..."
            {...register('estado_del_ingreso')}
          />
        </Form.Group>

        <Row className="mb-4">
          <Col md={6}>
            <Form.Group>
              <Form.Label> Foto frontal</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleFotoFrontal} />
              {fotoFrontalPreview && (
                <img
                  src={fotoFrontalPreview}
                  alt="Foto Frontal"
                  style={{
                    width: '150px',
                    height: 'auto',
                    display: 'block',
                    margin: '10px auto',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                  }}
                />
              )}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label> Foto trasera</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={handleFotoTrasera} />
              {fotoTraseraPreview && (
                <img
                  src={fotoTraseraPreview}
                  alt="Foto Trasera"
                  style={{
                    width: '150px',
                    height: 'auto',
                    display: 'block',
                    margin: '10px auto',
                    borderRadius: '5px',
                    border: '1px solid #ddd',
                  }}
                />
              )}
            </Form.Group>
          </Col>
        </Row>

        <Button type="submit" variant="primary" className="w-100" disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Registrando...
            </>
          ) : (
            <>
              <Check size={20} className="me-2" /> Registrar Ingreso
            </>
          )}
        </Button>

        <div className="mt-3 text-center">
          <small className="text-muted">* Campos obligatorios</small>
        </div>
      </Form>
    </Container>
  );
};

export default FormularioIngresoD;
