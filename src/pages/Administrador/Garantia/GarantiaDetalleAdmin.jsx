// src/pages/Administrador/Garantias/GarantiaDetalleAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge, Spinner, Alert, ProgressBar, Form } from 'react-bootstrap';
import { ShieldCheck, ShieldAlert, Clock, Calendar, CheckCircle, XCircle, Save } from 'lucide-react';
import api from '../../../services/api';

const GarantiaDetalleAdmin = ({ show, onHide, idGarantia, onActualizado }) => {
    const [loading, setLoading] = useState(false);
    const [garantia, setGarantia] = useState(null);
    const [error, setError] = useState(null);
    const [estado, setEstado] = useState('');
    const [comentario, setComentario] = useState('');
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        if (show && idGarantia) {
            cargarGarantia();
        }
    }, [show, idGarantia]);
    
    const getDispositivoNombre = () => {
        if (!garantia?.reparacion) return 'N/A';
        
        // Intentar desde diagnóstico (reparaciones que vienen de diagnóstico)
        if (garantia.reparacion.diagnostico?.ingreso?.dispositivo?.modelo?.nombre_modelo) {
            return garantia.reparacion.diagnostico.ingreso.dispositivo.modelo.nombre_modelo;
        }
        
        // Intentar desde ingreso directo (reparaciones directas)
        if (garantia.reparacion.ingreso?.dispositivo?.modelo?.nombre_modelo) {
            return garantia.reparacion.ingreso.dispositivo.modelo.nombre_modelo;
        }
        
        return 'N/A';
    };
    const cargarGarantia = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/garantias/${idGarantia}`);
            const data = response.data?.data || response.data;
            setGarantia(data);
            setEstado(data.estado);
            setComentario(data.comentario || '');
        } catch (err) {
            setError('Error al cargar la garantía');
        } finally {
            setLoading(false);
        }
    };


    const actualizarGarantia = async () => {
        setGuardando(true);
        try {
            await api.put(`/garantias/${idGarantia}`, {
                estado: estado,
                comentario: comentario
            });
            alert('✅ Garantía actualizada correctamente');
            if (onActualizado) onActualizado();
            onHide();
        } catch (err) {
            alert('Error al actualizar la garantía');
        } finally {
            setGuardando(false);
        }
    };

    const getEstadoOptions = () => {
        return [
            { value: 'ACTIVA', label: 'Activa', color: 'success' },
            { value: 'RECLAMADA', label: 'Reclamada', color: 'warning' },
            { value: 'VENCIDA', label: 'Vencida', color: 'danger' },
            { value: 'ANULADA', label: 'Anulada', color: 'secondary' },
            { value: 'CUMPLIDA', label: 'Cumplida', color: 'info' }
        ];
    };

    const formatDate = (date) => {
        if (!date) return 'Sin fecha';
        return new Date(date).toLocaleDateString('es-AR');
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;
    if (error) return <Alert variant="danger">{error}</Alert>;
    if (!garantia) return null;

    return (
        <Modal show={show} onHide={onHide} size="lg" centered>
            <Modal.Header closeButton className="border-0 pb-0">
                <Modal.Title className="d-flex align-items-center gap-2">
                    <ShieldCheck size={24} className="text-primary" />
                    Gestionar Garantía #{garantia.id_garantia}
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                {/* Información general */}
                <div className="mb-4 p-3 rounded-3" style={{ background: '#f0f5ff' }}>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Calendar size={16} className="text-muted" />
                                <div>
                                    <small className="text-muted d-block">Fecha de inicio</small>
                                    <strong>{formatDate(garantia.fecha_inicio)}</strong>
                                </div>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="d-flex align-items-center gap-2 mb-2">
                                <Clock size={16} className="text-muted" />
                                <div>
                                    <small className="text-muted d-block">Fecha de vencimiento</small>
                                    <strong>{formatDate(garantia.fecha_fin)}</strong>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row mt-2">
                        <div className="col-md-6">
                            <small className="text-muted">Reparación</small>
                            <div><strong>#{garantia.id_reparacion}</strong></div>
                        </div>
                        <div className="col-md-6">
    <small className="text-muted">Dispositivo</small>
    <div><strong>{getDispositivoNombre()}</strong></div>
</div>
                    </div>
                </div>

                {/* Gestión de estado */}
                <div className="mb-4">
                    <h6 className="mb-3">📋 Gestión de Garantía</h6>
                    
                    <Form.Group className="mb-3">
                        <Form.Label>Estado de la garantía</Form.Label>
                        <Form.Select value={estado} onChange={(e) => setEstado(e.target.value)}>
                            {getEstadoOptions().map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Comentario / Observaciones</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            placeholder="Agregar notas sobre esta garantía..."
                        />
                    </Form.Group>

                    {estado === 'RECLAMADA' && (
                        <Alert variant="warning">
                            <ShieldAlert size={16} className="me-2" />
                            Esta garantía tiene un reclamo activo. Revisa la sección de reclamos.
                        </Alert>
                    )}
                </div>

                {/* Piezas cubiertas */}
                {garantia.garantia_piezas?.length > 0 && (
                    <div>
                        <h6 className="mb-3">🛡️ Piezas cubiertas</h6>
                        <div className="d-flex flex-column gap-2">
                            {garantia.garantia_piezas.map((pieza) => (
                                <div key={pieza.id_garantia_pieza} className="border rounded-3 p-3">
                                    <div className="d-flex justify-content-between">
                                        <div>
                                            <strong>{pieza.pieza?.nombre_pieza || 'Pieza'}</strong>
                                            <Badge bg="secondary" className="ms-2">
                                                {pieza.categoria?.categoria || 'Sin categoría'}
                                            </Badge>
                                        </div>
                                        <Badge bg={pieza.estado === 'ACTIVA' ? 'success' : 'secondary'}>
                                            {pieza.estado}
                                        </Badge>
                                    </div>
                                    <div className="row small mt-2">
                                        <div className="col-6">
                                            <span className="text-muted">Días de garantía:</span>
                                            <strong className="ms-2">{pieza.garantia_dias_asignados} días</strong>
                                        </div>
                                        <div className="col-6">
                                            <span className="text-muted">Vence:</span>
                                            <strong className="ms-2">{formatDate(pieza.fecha_fin)}</strong>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Modal.Body>
            
            <Modal.Footer className="border-0">
                <Button variant="secondary" onClick={onHide}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={actualizarGarantia} disabled={guardando}>
                    {guardando ? <Spinner size="sm" animation="border" className="me-2" /> : <Save size={16} className="me-2" />}
                    Guardar cambios
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default GarantiaDetalleAdmin;