// pages/tecnico/componentes/AgregarPiezaForm.jsx
import React, { useState, useRef } from 'react';
import { Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Plus, Calculator, X, Package, CheckCircle } from 'lucide-react';
import { diagnosticoService } from '../../../services/DiagnosticoService';
import { ModalCalculadorPrecio } from './ModalCalculadorPrecio';

export function AgregarPiezaForm({ diagnosticoId, onPiezaAgregada, onClose }) {
  const [idPieza, setIdPieza] = useState('');
  const [nombrePieza, setNombrePieza] = useState('');
  const [costo, setCosto] = useState('0.00');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCalculador, setShowCalculador] = useState(false); // ← Cambiar a false
  const [mensajeExito, setMensajeExito] = useState('');
  const [mostrarFormularioPieza, setMostrarFormularioPieza] = useState(false);

  const piezaSeleccionadaRef = useRef(false);

  // Abrir calculador manualmente
  const abrirCalculador = () => {
    setShowCalculador(true);
  };

  const handleCalculadorResultado = (resultado) => {
    console.log('🎯 Resultado del calculador:', resultado);

    if (resultado.piezaId) {
      setIdPieza(resultado.piezaId);
      setNombrePieza(resultado.nombrePieza || 'Pieza seleccionada');
      setCosto(resultado.precioTotal);
      piezaSeleccionadaRef.current = true;
      setMostrarFormularioPieza(true); // Mostrar formulario
    }
    setShowCalculador(false);
  };

  const handleSubmit = async () => {
    if (!idPieza) {
      alert('Primero seleccione una pieza');
      return;
    }

    if (!comentario.trim()) {
      alert('Por favor, agregue un comentario sobre la pieza');
      return;
    }

    setLoading(true);
    try {
      await diagnosticoService.agregarPieza(diagnosticoId, {
        id_pieza: parseInt(idPieza),
        costo: parseFloat(costo),
        comentario: comentario,
      });

      setMensajeExito(`✓ ${nombrePieza} agregada correctamente`);
      onPiezaAgregada();

      // Resetear para agregar otra pieza
      setTimeout(() => {
        setIdPieza('');
        setNombrePieza('');
        setCosto('0.00');
        setComentario('');
        setMensajeExito('');
        setMostrarFormularioPieza(false);
        piezaSeleccionadaRef.current = false;
      }, 1500);
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar la pieza');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Modal del calculador - solo se abre cuando el usuario hace click */}
      <ModalCalculadorPrecio
        show={showCalculador}
        onHide={() => {
          setShowCalculador(false);
          if (!piezaSeleccionadaRef.current && !idPieza) {
            onClose();
          }
        }}
        onAceptar={handleCalculadorResultado}
      />

      {/* Formulario principal - muestra el botón para abrir calculador */}
      <div className="border rounded p-3 mb-3 bg-white">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0 fw-bold d-flex align-items-center gap-2">
            <Package size={16} className="text-primary" />
            Agregar pieza al diagnóstico
          </h6>
          <Button variant="link" size="sm" onClick={onClose} className="p-0 text-danger">
            <X size={18} />
          </Button>
        </div>

        {/* Si no hay pieza seleccionada, mostrar botón para seleccionar */}
        {!mostrarFormularioPieza && !idPieza && (
          <div className="text-center py-4">
            <Button
              variant="primary"
              onClick={abrirCalculador}
              className="d-flex align-items-center gap-2 mx-auto"
            >
              <Calculator size={16} />
              Seleccionar pieza con calculador
            </Button>
            <p className="text-muted small mt-3 mb-0">
              Usa el calculador para seleccionar una pieza compatible y calcular su precio
            </p>
          </div>
        )}

        {/* Mostrar formulario de pieza seleccionada */}
        {mostrarFormularioPieza && idPieza && (
          <>
            {/* Mensaje de éxito */}
            {mensajeExito && (
              <Alert variant="success" className="py-2 mb-3 d-flex align-items-center gap-2">
                <CheckCircle size={16} />
                <small>{mensajeExito}</small>
              </Alert>
            )}

            {/* Mostrar pieza seleccionada */}
            <div className="bg-success bg-opacity-10 p-3 rounded-3 mb-3">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <small className="text-muted">Pieza seleccionada</small>
                  <h6 className="mb-0 fw-bold">{nombrePieza}</h6>
                  <small className="text-muted">ID: {idPieza}</small>
                </div>
                <div className="text-end">
                  <small className="text-muted">Costo</small>
                  <h5 className="mb-0 text-success fw-bold">${parseFloat(costo).toFixed(2)}</h5>
                </div>
              </div>
              <Button
                variant="link"
                size="sm"
                onClick={() => {
                  setShowCalculador(true);
                  setMostrarFormularioPieza(false);
                }}
                className="mt-2 p-0 d-flex align-items-center gap-1"
                disabled={loading}
              >
                <Calculator size={12} />
                Seleccionar otra pieza
              </Button>
            </div>

            {/* Comentario - obligatorio */}
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-muted">
                COMENTARIO <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                size="sm"
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Ej: La pieza está dañada, necesita reemplazo urgente"
                disabled={loading}
              />
              <Form.Text className="text-muted small">
                Describa el estado de la pieza o el motivo del reemplazo
              </Form.Text>
            </Form.Group>

            {/* Botones */}
            <div className="d-flex justify-content-end gap-2">
              <Button size="sm" variant="secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleSubmit}
                disabled={loading || !comentario.trim()}
                className="d-flex align-items-center gap-1"
              >
                {loading ? <Spinner size="sm" /> : <Plus size={14} />}
                {loading ? 'Agregando...' : 'Agregar esta pieza'}
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
