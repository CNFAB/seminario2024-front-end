// src/pages/Administrador/Garantias/ReclamosLista.jsx
import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { Eye, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';
import reclamoGarantiaService from '../../../services/reclamoGarantiaService';

const ReclamosLista = () => {
    const [reclamos, setReclamos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [reclamoSeleccionado, setReclamoSeleccionado] = useState(null);
    const [diagnostico, setDiagnostico] = useState('');
    const [estado, setEstado] = useState('');
    const [actualizando, setActualizando] = useState(false);

    useEffect(() => {
        cargarReclamos();
    }, []);

    // ← AGREGADOS
    const getCliente = (reclamo) =>
        reclamo.garantia?.reparacion?.ingreso?.dispositivo?.cliente?.nombre ||
        reclamo.garantia?.reparacion?.diagnostico?.ingreso?.dispositivo?.cliente?.nombre ||
        'N/A';

    const getModelo = (reclamo) =>
        reclamo.garantia?.reparacion?.ingreso?.dispositivo?.modelo?.nombre_modelo ||
        reclamo.garantia?.reparacion?.diagnostico?.ingreso?.dispositivo?.modelo?.nombre_modelo ||
        'N/A';

const cargarReclamos = async () => {
    setLoading(true);
    try {
        const response = await reclamoGarantiaService.obtenerTodos();
        console.log('Response completa:', response);
        console.log('response.data:', response.data);
        console.log('response.data.data:', response.data?.data);
        
        // Probar todas las posibles estructuras
        const data = response.data?.data || response.data || [];
        setReclamos(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        setLoading(false);
    }
};
    const actualizarReclamo = async () => {
        setActualizando(true);
        try {
            await reclamoGarantiaService.actualizar(reclamoSeleccionado.id_reclamo, {
                estado: estado,
                diagnostico_tecnico: diagnostico
            });
            setShowModal(false);
            cargarReclamos();
            alert('✅ Reclamo actualizado correctamente');
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar el reclamo');
        } finally {
            setActualizando(false);
        }
    };

    const getEstadoBadge = (estado) => {
        const config = {
            PENDIENTE: { bg: 'warning', text: 'Pendiente', icon: <Clock size={12} className="me-1" /> },
            EN_REVISION: { bg: 'info', text: 'En revisión', icon: <Eye size={12} className="me-1" /> },
            APROBADO: { bg: 'success', text: 'Aprobado', icon: <CheckCircle size={12} className="me-1" /> },
            RECHAZADO: { bg: 'danger', text: 'Rechazado', icon: <XCircle size={12} className="me-1" /> },
            COMPLETADO: { bg: 'secondary', text: 'Completado', icon: <CheckCircle size={12} className="me-1" /> }
        };
        const c = config[estado] || { bg: 'secondary', text: estado };
        return <Badge bg={c.bg}>{c.icon}{c.text}</Badge>;
    };

    // ← ACTUALIZADO
    const reclamosFiltrados = reclamos.filter(reclamo =>
        reclamo.descripcion_problema?.toLowerCase().includes(filtro.toLowerCase()) ||
        reclamo.id_reclamo?.toString().includes(filtro) ||
        getCliente(reclamo).toLowerCase().includes(filtro.toLowerCase()) ||
        getModelo(reclamo).toLowerCase().includes(filtro.toLowerCase())
    );

    if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

    return (
        <div className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Reclamos de Garantía</h2>
                <Button variant="outline-primary" onClick={cargarReclamos}>
                    <RefreshCw size={16} className="me-1" /> Refrescar
                </Button>
            </div>

            <div className="mb-3">
                <Form.Control
                    type="text"
                    placeholder="Buscar por ID, cliente, dispositivo o descripción..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    style={{ maxWidth: '300px' }}
                />
            </div>

            <div className="table-responsive">
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Garantía</th>
                            <th>Cliente</th>
                            <th>Dispositivo</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reclamosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center text-muted py-4">
                                    No hay reclamos registrados
                                </td>
                            </tr>
                        ) : (
                            reclamosFiltrados.map(reclamo => (
                                <tr key={reclamo.id_reclamo}>
                                    <td>{reclamo.id_reclamo}</td>
                                    <td>#{reclamo.id_garantia}</td>
                                   <td>{getCliente(reclamo)}</td>
                                    <td>{getModelo(reclamo)}</td>
                                    <td style={{ maxWidth: 250 }}>{reclamo.descripcion_problema?.substring(0, 80)}...</td>
                                    <td>{getEstadoBadge(reclamo.estado)}</td>
                                    <td>{new Date(reclamo.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={() => {
                                                setReclamoSeleccionado(reclamo);
                                                setEstado(reclamo.estado);
                                                setDiagnostico(reclamo.diagnostico_tecnico || '');
                                                setShowModal(true);
                                            }}
                                        >
                                            <Eye size={16} /> Gestionar
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Gestionar Reclamo #{reclamoSeleccionado?.id_reclamo}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {reclamoSeleccionado && (
                        <>
                            <div className="mb-3">
                                <strong>Cliente:</strong> {getCliente(reclamoSeleccionado)}
                            </div>
                            <div className="mb-3">
                                <strong>Dispositivo:</strong> {getModelo(reclamoSeleccionado)}
                            </div>
                            <div className="mb-3">
                                <strong>Descripción del cliente:</strong>
                                <p className="bg-light p-2 rounded mt-1">{reclamoSeleccionado.descripcion_problema}</p>
                            </div>

                            <Form.Group className="mb-3">
                                <Form.Label>Estado</Form.Label>
                                <Form.Select value={estado} onChange={(e) => setEstado(e.target.value)}>
                                    <option value="PENDIENTE">Pendiente</option>
                                    <option value="EN_REVISION">En revisión</option>
                                    <option value="APROBADO">Aprobado</option>
                                    <option value="RECHAZADO">Rechazado</option>
                                    <option value="COMPLETADO">Completado</option>
                                </Form.Select>
                            </Form.Group>

                            <Form.Group className="mb-3">
                                <Form.Label>Diagnóstico técnico</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    value={diagnostico}
                                    onChange={(e) => setDiagnostico(e.target.value)}
                                    placeholder="Describir el diagnóstico del técnico..."
                                />
                            </Form.Group>

                            {estado === 'APROBADO' && (
                                <Alert variant="success">
                                    <CheckCircle size={16} className="me-2" />
                                    Al aprobar este reclamo, se generará automáticamente una reparación con costo $0.
                                </Alert>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={actualizarReclamo} disabled={actualizando}>
                        {actualizando ? <Spinner size="sm" animation="border" /> : 'Guardar cambios'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default ReclamosLista;