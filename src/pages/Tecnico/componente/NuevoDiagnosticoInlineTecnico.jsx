// pages/tecnico/componentes/NuevoDiagnosticoInlineTecnico.jsx
import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Save, X, PlusCircle } from 'lucide-react';
import { DiagnosticoForm } from './DiagnosticoForm';
import {
  ESTADOS_DIAGNOSTICO,
  GRAVEDAD,
} from '../../../constant/estados';

export function NuevoDiagnosticoInlineTecnico({
  ingresoId,
  currentUser,
  dispositivoInfo, // { marca, modelo }
  onCreate,
  onCancel,
}) {
  const [form, setForm] = useState({
    gravedad: GRAVEDAD?.LEVE || 'LEVE',
    estado:
      ESTADOS_DIAGNOSTICO?.ESPERANDO_DIAGNOSTICO ||
      'ESPERANDO_DIAGNOSTICO',
    causa_detectada: '',
    solucion: '',
    observacion: '',
    costo: '0.00',
    fecha_expiracion: new Date().toISOString().split('T')[0],
  
  });
  const [creando, setCreando] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setCreando(true);
      const datosEnvio = {
        ...form,
        id_ingreso: ingresoId,
        id_usuario: currentUser?.id_usuario,
      };
      await onCreate(datosEnvio);
      // Resetear si el padre no desmonta el componente
      setForm({
        gravedad: GRAVEDAD?.LEVE || 'LEVE',
        estado:
          ESTADOS_DIAGNOSTICO?.ESPERANDO_DIAGNOSTICO ||
          'ESPERANDO_DIAGNOSTICO',
        causa_detectada: '',
        solucion: '',
        observacion: '',
        costo: '0.00',
        fecha_expiracion: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      console.error('❌ Error al crear diagnóstico:', err);
      alert('Error al crear el diagnóstico');
    } finally {
      setCreando(false);
    }
  };

  return (
    <div
      className="mt-3 p-3 bg-light rounded-3 border border-primary border-opacity-25"
      style={{ animation: 'fadeSlideIn 0.25s ease' }}
    >
      {/* ── Título ── */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <div className="bg-primary bg-opacity-10 p-2 rounded-2">
          <PlusCircle size={18} className="text-primary" />
        </div>
        <div>
          <h6 className="fw-bold mb-0">Nuevo Diagnóstico</h6>
          {dispositivoInfo && (
            <small className="text-muted">
              Dispositivo: {dispositivoInfo.marca} {dispositivoInfo.modelo}
            </small>
          )}
          {ingresoId && (
            <small className="text-muted ms-2">
              · Ingreso #{ingresoId}
            </small>
          )}
        </div>
      </div>

      {/* ── Formulario ── */}
      <DiagnosticoForm
        formData={form}
        onChange={handleChange}
        modo="creacion"
      />

      {/* ── Info técnico ── */}
      <div className="bg-white border rounded-2 p-2 mt-3 mb-3">
        <small className="text-muted">
          <strong>Técnico asignado:</strong>{' '}
          {currentUser?.nombre} {currentUser?.apellido}
          <span className="text-muted ms-2">
            (ID: {currentUser?.id_usuario})
          </span>
        </small>
      </div>

      {/* ── Acciones ── */}
      <div className="d-flex justify-content-end gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={onCancel}
          disabled={creando}
          className="d-flex align-items-center"
        >
          <X size={14} className="me-1" />
          Cancelar
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={handleSubmit}
          disabled={creando}
          className="d-flex align-items-center"
        >
          <Save size={14} className="me-1" />
          {creando ? 'Creando...' : 'Guardar Diagnóstico'}
        </Button>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}