// src/pages/Tecnico/componente/ReclamosPanelTecnico.jsx
import React, { useState, useEffect } from 'react';
import { Card, Badge, Button, Spinner, Alert, Modal, Form, Table } from 'react-bootstrap';
import { Eye, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import reclamoGarantiaService from '../../../../services/reclamoGarantiaService';

const ReclamosPanelTecnico = ({ onCountChange }) => {
    const [reclamos, setReclamos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedReclamo, setSelectedReclamo] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [diagnostico, setDiagnostico] = useState('');
    const [estado, setEstado] = useState('');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        cargarReclamos();
    }, []);

    const cargarReclamos = async () => {
        setLoading(true);
        try {
            const response = await reclamoGarantiaService.obtenerMisReclamosAsignados();
             console.log('📦 Respuesta completa del backend:', response);
            if (response.success) {
                setReclamos(response.data || []);
                if (onCountChange) {
                    onCountChange(response.data?.length || 0);
                }
            } else {
                setError(response.message);
            }
        } catch (err) {
            console.error('Error al cargar reclamos:', err);
            setError('Error al cargar los reclamos');
        } finally {
            setLoading(false);
        }
    };

    const handleAbrirModal = (reclamo) => {
        setSelectedReclamo(reclamo);
        setDiagnostico(reclamo.diagnostico_tecnico || '');
        setEstado(reclamo.estado);
        setShowModal(true);
    };

    const handleActualizarReclamo = async () => {
        if (!selectedReclamo) return;
        
        setUpdating(true);
        try {
            const data = {};
            if (diagnostico !== selectedReclamo.diagnostico_tecnico) {
                data.diagnostico_tecnico = diagnostico;
            }
            if (estado !== selectedReclamo.estado) {
                data.estado = estado;
            }
            
            if (Object.keys(data).length > 0) {
                const response = await reclamoGarantiaService.actualizar(selectedReclamo.id_reclamo, data);
                if (response.success) {
                    await cargarReclamos();
                    setShowModal(false);
                } else {
                    setError(response.message);
                }
            } else {
                setShowModal(false);
            }
        } catch (err) {
            console.error('Error al actualizar:', err);
            setError('Error al actualizar el reclamo');
        } finally {
            setUpdating(false);
        }
    };

    const getEstadoBadge = (estado) => {
        const estados = {
            'PENDIENTE': { variant: 'secondary', icon: <Clock size={14} />, text: 'Pendiente' },
            'EN_REVISION': { variant: 'info', icon: <Eye size={14} />, text: 'En Revisión' },
            'APROBADO': { variant: 'success', icon: <CheckCircle size={14} />, text: 'Aprobado' },
            'RECHAZADO': { variant: 'danger', icon: <XCircle size={14} />, text: 'Rechazado' },
            'COMPLETADO': { variant: 'primary', icon: <CheckCircle size={14} />, text: 'Completado' }
        };
        const e = estados[estado] || { variant: 'secondary', text: estado };
        return (
            <Badge bg={e.variant} className="d-flex align-items-center gap-1" style={{ width: 'fit-content' }}>
                {e.icon} {e.text}
            </Badge>
        );
    };
    const getClienteNombre = (reclamo) => {
    if (reclamo.garantia?.reparacion?.diagnostico?.ingreso?.dispositivo?.cliente?.nombre) {
        return reclamo.garantia.reparacion.diagnostico.ingreso.dispositivo.cliente.nombre;
    }
    if (reclamo.garantia?.reparacion?.ingreso?.dispositivo?.cliente?.nombre) {
        return reclamo.garantia.reparacion.ingreso.dispositivo.cliente.nombre;
    }
    return 'N/A';
};
const getDispositivoNombre = (reclamo) => {
    // ✅ Primero intentar por diagnóstico (reparación con diagnóstico)
    if (reclamo.garantia?.reparacion?.diagnostico?.ingreso?.dispositivo?.modelo) {
        const marca = reclamo.garantia.reparacion.diagnostico.ingreso.dispositivo.modelo.marca?.marca || '';
        const modelo = reclamo.garantia.reparacion.diagnostico.ingreso.dispositivo.modelo.nombre_modelo || '';
        return `${marca} ${modelo}`.trim() || 'N/A';
    }
    // Si no, intentar por ingreso directo
    if (reclamo.garantia?.reparacion?.ingreso?.dispositivo?.modelo) {
        const marca = reclamo.garantia.reparacion.ingreso.dispositivo.modelo.marca?.marca || '';
        const modelo = reclamo.garantia.reparacion.ingreso.dispositivo.modelo.nombre_modelo || '';
        return `${marca} ${modelo}`.trim() || 'N/A';
    }
    return 'N/A';
};

    const formatearFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <Card className="border-0 shadow-sm">
                <Card.Body className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">Cargando reclamos...</p>
                </Card.Body>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                </Card.Body>
            </Card>
        );
    }

    return (
        <>
            <Card className="border-0 shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">
                            <FileText size={20} className="me-2" />
                            Reclamos de Garantía Asignados
                        </h5>
                        <Button variant="outline-primary" size="sm" onClick={cargarReclamos}>
                            Actualizar
                        </Button>
                    </div>

                    {reclamos.length === 0 ? (
                        <div className="text-center py-5 text-muted">
                            <FileText size={48} className="mb-3 opacity-50" />
                            <p>No tienes reclamos de garantía asignados</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <Table hover className="mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>ID</th>
                                        <th>Cliente</th>
                                        <th>Dispositivo</th>
                                        <th>Fecha</th>
                                        <th>Problema</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reclamos.map((reclamo) => (
                                        <tr key={reclamo.id_reclamo}>
                                            <td className="fw-medium">#{reclamo.id_reclamo}</td>
                                              <td>{getClienteNombre(reclamo)}</td> 
                                            <td>
                                                <small>
                                                   {getDispositivoNombre(reclamo)}
                                                </small>
                                            </td>
                                            <td>{formatearFecha(reclamo.fecha_reclamo)}</td>
                                            <td>
                                                <small className="text-muted">
                                                    {reclamo.descripcion_problema?.substring(0, 50)}
                                                    {reclamo.descripcion_problema?.length > 50 ? '...' : ''}
                                                </small>
                                            </td>
                                            <td>{getEstadoBadge(reclamo.estado)}</td>
                                            <td>
                                                <Button
                                                    variant="outline-primary"
                                                    size="sm"
                                                    onClick={() => handleAbrirModal(reclamo)}
                                                >
                                                    <Eye size={14} className="me-1" /> Ver
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Modal para ver/actualizar reclamo */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Reclamo de Garantía #{selectedReclamo?.id_reclamo}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReclamo && (
                        <>
                            <div className="mb-3">
                                <strong>Cliente:</strong> {selectedReclamo.garantia?.reparacion?.ingreso?.dispositivo?.cliente?.nombre || 'N/A'}
                            </div>
                            <div className="mb-3">
                                <strong>Dispositivo:</strong> {selectedReclamo.garantia?.reparacion?.ingreso?.dispositivo?.modelo?.marca?.marca || ''}{' '}
                                {selectedReclamo.garantia?.reparacion?.ingreso?.dispositivo?.modelo?.nombre_modelo || 'N/A'}
                            </div>
                            <div className="mb-3">
                                <strong>Fecha del reclamo:</strong> {formatearFecha(selectedReclamo.fecha_reclamo)}
                            </div>
                            <div className="mb-3">
                                <strong>Descripción del problema:</strong>
                                <p className="border rounded p-2 bg-light mt-1">{selectedReclamo.descripcion_problema}</p>
                            </div>
                            
                            {selectedReclamo.fotos && selectedReclamo.fotos.length > 0 && (
                                <div className="mb-3">
                                    <strong>Fotos adjuntas:</strong>
                                    <div className="d-flex gap-2 mt-2 flex-wrap">
                                        {selectedReclamo.fotos.map((foto, idx) => (
                                            <a key={idx} href={foto} target="_blank" rel="noopener noreferrer">
                                                <img src={foto} alt={`Foto ${idx + 1}`} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }} />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Diagnóstico técnico</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={diagnostico}
                                    onChange={(e) => setDiagnostico(e.target.value)}
                                    placeholder="Describe tu diagnóstico y solución propuesta..."
                                />
                            </Form.Group>
                            
                            <Form.Group className="mb-3">
                                <Form.Label>Estado del reclamo</Form.Label>
                                <Form.Select value={estado} onChange={(e) => setEstado(e.target.value)}>
                                    <option value="PENDIENTE"> Pendiente</option>
                                    <option value="EN_REVISION"> En Revisión</option>
                                    <option value="APROBADO"> Aprobado </option>
                                    <option value="RECHAZADO"> Rechazado (no cubre garantía)</option>
                                    <option value="COMPLETADO"> Completado</option>
                                </Form.Select>
                            </Form.Group>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleActualizarReclamo} disabled={updating}>
                        {updating ? <Spinner animation="border" size="sm" /> : 'Guardar cambios'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ReclamosPanelTecnico;