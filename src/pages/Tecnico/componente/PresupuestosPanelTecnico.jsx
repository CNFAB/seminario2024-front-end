// pages/Tecnico/componente/PresupuestosPanelTecnico.jsx
import React, { useState, useEffect } from 'react';
import { Card, Button, Form, Table, Alert, Badge } from 'react-bootstrap';
import { Save, DollarSign, Plus, Trash2, Lock, CheckCircle } from 'lucide-react';
import PresupuestoService from '../../../services/PresupuestoService.jsx';
import PresupuestoDetalleService from '../../../services/PresupuestoDetalleService';
import { ModalCalculadorPrecio } from './ModalCalculadorPrecio';

export const PresupuestosPanelTecnico = ({ presupuesto, currentUser, onPresupuestoActualizado, onCountChange }) => {
  const [piezas, setPiezas]                     = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [message, setMessage]                   = useState(null);
  const [detallesExistentes, setDetallesExistentes] = useState([]);
  const [showCalculador, setShowCalculador]     = useState(false);
  const [estadoActual, setEstadoActual]         = useState(presupuesto?.estado);

  // Actualizar estado cuando cambia el presupuesto
  useEffect(() => {
    if (presupuesto) {
      setEstadoActual(presupuesto.estado);
      cargarDetallesExistentes();
    }
  }, [presupuesto]);

  const cargarDetallesExistentes = async () => {
    try {
      const result = await PresupuestoDetalleService.getDetallesByPresupuesto(presupuesto.id_presupuesto);
      if (result.success && result.data?.detalles) {
        setDetallesExistentes(result.data.detalles);
      }
    } catch (error) {
      console.error('Error cargando detalles:', error);
    }
  };

  // ✅ Verificar si el presupuesto está calculado (no modificable)
  const estaCalculado = () => {
    return estadoActual === 'CALCULADO' || estadoActual === 'APROBADO' || estadoActual === 'RECHAZADO';
  };

  const estaPendiente = () => {
    return estadoActual === 'PENDIENTE';
  };

  const agregarPieza = () => {
    if (!estaPendiente()) {
      setMessage({ type: 'warning', text: '⚠️ No se pueden agregar piezas a un presupuesto ya calculado' });
      return;
    }
    setPiezas([...piezas, { id_pieza: '', descripcion: '', costo: 0, temporal: true }]);
  };

  const actualizarPieza = (index, campo, valor) => {
    if (!estaPendiente()) return;
    const nuevasPiezas = [...piezas];
    nuevasPiezas[index][campo] = valor;
    setPiezas(nuevasPiezas);
  };

  const eliminarPieza = (index) => {
    if (!estaPendiente()) return;
    setPiezas(piezas.filter((_, i) => i !== index));
  };

  const handleAceptarCalculador = ({ precioTotal, piezaId, nombrePieza }) => {
    if (!estaPendiente()) {
      setMessage({ type: 'warning', text: '⚠️ No se pueden agregar piezas a un presupuesto ya calculado' });
      return;
    }
    setPiezas(prev => [...prev, {
      id_pieza:    piezaId    || '',
      descripcion: nombrePieza || '',
      costo:       precioTotal || 0,
      temporal:    true
    }]);
  };

  // ✅ MODIFICADO: Guardar y cambiar estado a CALCULADO
  const guardarPresupuesto = async () => {
    const piezasValidas = piezas.filter(p => p.id_pieza && p.descripcion && p.costo > 0);

    if (piezasValidas.length === 0 && detallesExistentes.length === 0) {
      setMessage({ type: 'danger', text: 'Debe agregar al menos una pieza válida' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // 1. Guardar las nuevas piezas
      for (const pieza of piezasValidas) {
        await PresupuestoDetalleService.crearDetalle({
          id_presupuesto: presupuesto.id_presupuesto,
          id_pieza:       pieza.id_pieza,
          descripcion:    pieza.descripcion,
          costo:          parseFloat(pieza.costo),
          aprobado:       false
        });
      }

      // 2. ✅ LLAMAR AL ENDPOINT PARA CALCULAR (cambiar estado a CALCULADO)
      const resultadoCalculo = await PresupuestoService.calcularPresupuesto(presupuesto.id_presupuesto);
      
      if (resultadoCalculo.success) {
        setEstadoActual('CALCULADO');
        setMessage({ type: 'success', text: '✅ Presupuesto calculado y finalizado correctamente. Ya no se puede modificar.' });
        setPiezas([]);
        await cargarDetallesExistentes();

        if (onPresupuestoActualizado) onPresupuestoActualizado();
        if (onCountChange) onCountChange(prev => prev - 1);
      } else {
        throw new Error(resultadoCalculo.message || 'Error al calcular presupuesto');
      }
      
    } catch (error) {
      console.error('Error guardando presupuesto:', error);
      setMessage({ type: 'danger', text: error.response?.data?.message || 'Error al guardar el presupuesto' });
    } finally {
      setLoading(false);
    }
  };

  const total = [...detallesExistentes, ...piezas]
    .reduce((sum, p) => sum + (parseFloat(p.costo) || 0), 0);

  // ✅ Renderizar badge según estado
  const renderEstadoBadge = () => {
    switch (estadoActual) {
      case 'PENDIENTE':
        return <Badge bg="warning" className="p-2"><DollarSign size={16} /> PENDIENTE  </Badge>;
      case 'CALCULADO':
        return <Badge bg="info" className="p-2"><CheckCircle size={16} /> CALCULADO </Badge>;
      case 'APROBADO':
        return <Badge bg="success" className="p-2">APROBADO</Badge>;
      case 'RECHAZADO':
        return <Badge bg="danger" className="p-2">RECHAZADO</Badge>;
      default:
        return <Badge bg="secondary">{estadoActual}</Badge>;
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-white border-0 pt-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h4 className="mb-1">
              {presupuesto?.ingreso?.dispositivo?.modelo?.marca?.marca} {presupuesto?.ingreso?.dispositivo?.modelo?.nombre_modelo}
            </h4>
            <small className="text-muted d-block">
              Cliente: {presupuesto?.ingreso?.dispositivo?.cliente?.nombre} {presupuesto?.ingreso?.dispositivo?.cliente?.apellido}
            </small>
          </div>
          {renderEstadoBadge()}
        </div>
      </Card.Header>

      <Card.Body>
        {message && (
          <Alert variant={message.type} onClose={() => setMessage(null)} dismissible>
            {message.text}
          </Alert>
        )}

        {/* ✅ Mostrar alerta si está calculado */}
        {!estaPendiente() && (
          <Alert variant="info" className="mb-4">
            <Lock size={18} className="me-2" />
            <strong>Presupuesto finalizado:</strong> Este presupuesto ya fue calculado y no acepta modificaciones.
            {estadoActual === 'CALCULADO' && (
              <div className="mt-2 small">
                El cliente debe aprobar o rechazar este presupuesto para continuar.
              </div>
            )}
          </Alert>
        )}

        {/* Comentario del cliente */}
        <div className="mb-4 p-3 bg-light rounded">
          <strong>📝 Solicitud del cliente:</strong>
          <p className="mt-2 mb-0">{presupuesto?.ingreso?.comentario_cliente || 'Sin comentarios'}</p>
        </div>

        {/* Piezas existentes */}
        {detallesExistentes.length > 0 && (
          <>
            <h5 className="mb-3">Piezas agregadas</h5>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>ID Pieza</th>
                  <th>Descripción</th>
                  <th className="text-end">Costo</th>
                </tr>
              </thead>
              <tbody>
                {detallesExistentes.map((detalle, idx) => (
                  <tr key={idx}>
                    <td>#{detalle.id_pieza}</td>
                    <td>{detalle.descripcion}</td>
                    <td className="text-end">${parseFloat(detalle.costo).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        )}

        {/* ✅ Solo mostrar sección de agregar piezas si está PENDIENTE */}
        {estaPendiente() && (
          <>
            <h5 className="mb-3 mt-4">Agregar nuevas piezas</h5>
            {piezas.map((pieza, index) => (
              <div key={index} className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <strong>Pieza #{index + 1}</strong>
                  <Button variant="danger" size="sm" onClick={() => eliminarPieza(index)}>
                    <Trash2 size={16} />
                  </Button>
                </div>
                <div className="row">
                  <div className="col-md-3">
                    <Form.Control
                      type="text"
                      placeholder="ID Pieza"
                      value={pieza.id_pieza}
                      onChange={(e) => actualizarPieza(index, 'id_pieza', e.target.value)}
                    />
                  </div>
                  <div className="col-md-6">
                    <Form.Control
                      type="text"
                      placeholder="Descripción (ej: Pantalla iPhone 12)"
                      value={pieza.descripcion}
                      onChange={(e) => actualizarPieza(index, 'descripcion', e.target.value)}
                    />
                  </div>
                  <div className="col-md-3">
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="Costo"
                      value={pieza.costo}
                      onChange={(e) => actualizarPieza(index, 'costo', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="d-flex gap-2 mb-3">
              <Button variant="outline-primary" size="sm" onClick={agregarPieza}>
                <Plus size={16} className="me-1" /> Agregar pieza manual
              </Button>
              <Button variant="outline-success" size="sm" onClick={() => setShowCalculador(true)}>
                <DollarSign size={16} className="me-1" /> Usar calculador
              </Button>
            </div>
          </>
        )}

        {/* Total */}
        <div className={`mt-3 p-3 rounded text-end ${!estaPendiente() ? 'bg-secondary' : 'bg-primary'} text-white`}>
          <h5 className="mb-0">Total del presupuesto: ${total.toFixed(2)}</h5>
        </div>

        {/* ✅ Botón Guardar - Solo visible si está PENDIENTE */}
        {estaPendiente() && (
          <div className="mt-4 text-end">
            <Button
              variant="success"
              onClick={guardarPresupuesto}
              disabled={loading || (piezas.length === 0 && detallesExistentes.length === 0)}
            >
              <Save size={18} className="me-2" />
              {loading ? 'Guardando...' : 'Guardar Presupuesto'}
            </Button>
          </div>
        )}

        {/* ✅ Mostrar mensaje si está calculado */}
        {!estaPendiente() && (
          <div className="mt-4 text-center p-3 bg-light rounded">
            <Lock size={20} className="text-muted mb-2" />
            <p className="mb-0 text-muted">
              <strong>Presupuesto {estadoActual}</strong><br />
              {estadoActual === 'CALCULADO' && 'Esperando aprobación del cliente'}
              {estadoActual === 'APROBADO' && 'Presupuesto aprobado - Proceder con la reparación'}
              {estadoActual === 'RECHAZADO' && 'Presupuesto rechazado por el cliente'}
            </p>
          </div>
        )}
      </Card.Body>

      <ModalCalculadorPrecio
        show={showCalculador && estaPendiente()}
        onHide={() => setShowCalculador(false)}
        onAceptar={handleAceptarCalculador}
      />
    </Card>
  );
};